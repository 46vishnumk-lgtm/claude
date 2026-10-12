#!/usr/bin/env bash
# Parallel sharded render → concat → mux with loudness-normalised audio.
set -euo pipefail
cd "$(dirname "$0")/.."
SHARDS=${SHARDS:-4}; SUB=${SUB:-2}; TOTAL=900
python3 scripts/audio.py
pids=()
for ((s=0; s<SHARDS; s++)); do
  a=$(( s * TOTAL / SHARDS )); b=$(( (s + 1) * TOTAL / SHARDS ))
  node scripts/render.mjs --sub "$SUB" --from $a --to $b --out out/part$s.mov > out/render$s.log 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done
: > out/parts.txt
for ((s=0; s<SHARDS; s++)); do echo "file 'part$s.mov'" >> out/parts.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/parts.txt -c copy out/master.mov
# Master (ProRes 422 HQ + PCM) and delivery (H.264 + AAC, -14 LUFS / -1 dBTP)
ffmpeg -y -loglevel error -i out/master.mov -i out/isofiniti-showreel-audio.wav \
  -map 0:v -map 1:a -c:v copy -c:a pcm_s24le -shortest out/isofiniti-showreel-master.mov
ffmpeg -y -loglevel error -i out/master.mov -i out/isofiniti-showreel-audio.wav \
  -map 0:v -map 1:a -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 \
  -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -profile:v high -tune film \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 320k -movflags +faststart -shortest out/isofiniti-showreel-hq.mp4
ffmpeg -y -loglevel error -i out/isofiniti-showreel-hq.mp4 -c:v libx264 -preset slower -crf 19 -pix_fmt yuv420p -profile:v high -tune film \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart out/isofiniti-showreel.mp4
ffmpeg -y -loglevel error -i out/isofiniti-showreel-audio.wav -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 256k out/isofiniti-showreel-audio.m4a
rm -f out/part*.mov out/parts.txt out/master.mov
echo done
