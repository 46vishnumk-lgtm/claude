#!/usr/bin/env python3
"""ElevenLabs voiceover for the Castor showreel.

    export ELEVENLABS_API_KEY=...            # required
    export ELEVENLABS_VOICE_ID=...           # optional, defaults to a premade narrator voice
    python3 voiceover/voiceover.py generate  # one clip per scene → voiceover/clips/NN.mp3
    python3 voiceover/voiceover.py mix       # place clips on the timeline → out/castor-showreel-vo.mp4

Clips that run longer than their slot are sped up (max 1.15×) so every line lands on its scene.
"""
import json
import os
import pathlib
import subprocess
import sys
import urllib.request

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
CLIPS = HERE / "clips"
SCRIPT = json.loads((HERE / "script.json").read_text())["lines"]
VIDEO = ROOT / "out" / "castor-showreel.mp4"
OUT = ROOT / "out" / "castor-showreel-vo.mp4"

VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "nPczCjzI2devNBz1zQrb")  # premade "Brian" — calm, deep narrator
MODEL = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
SETTINGS = {"stability": 0.55, "similarity_boost": 0.85, "style": 0.15, "use_speaker_boost": True, "speed": 1.0}


def tts(text, dest, prev_text=None, next_text=None):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set")
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev_text:
        body["previous_text"] = prev_text  # keeps intonation continuous across clips
    if next_text:
        body["next_text"] = next_text
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
        data=json.dumps(body).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        dest.write_bytes(r.read())


def duration(f):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]).decode())


def generate():
    CLIPS.mkdir(exist_ok=True)
    for i, line in enumerate(SCRIPT):
        dest = CLIPS / f"{line['id']}.mp3"
        tts(line["text"], dest,
            SCRIPT[i - 1]["text"] if i else None,
            SCRIPT[i + 1]["text"] if i + 1 < len(SCRIPT) else None)
        d = duration(dest)
        flag = "  ← over slot, will be tightened" if d > line["max"] else ""
        print(f"{line['id']}  {d:4.2f}s / {line['max']}s{flag}")


def mix():
    inputs, chains = [], []
    for n, line in enumerate(SCRIPT):
        clip = CLIPS / f"{line['id']}.mp3"
        inputs += ["-i", str(clip)]
        tempo = min(1.15, max(1.0, duration(clip) / line["max"]))
        delay = int(line["at"] * 1000)
        chains.append(f"[{n + 1}:a]atempo={tempo:.3f},adelay={delay}|{delay}[a{n}]")
    mixed = "".join(f"[a{n}]" for n in range(len(SCRIPT)))
    graph = ";".join(chains) + f";{mixed}amix=inputs={len(SCRIPT)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[vo]"
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", str(VIDEO), *inputs,
                           "-filter_complex", graph, "-map", "0:v", "-map", "[vo]",
                           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(OUT)])
    print("wrote", OUT)


if __name__ == "__main__":
    {"generate": generate, "mix": mix}.get(sys.argv[1] if len(sys.argv) > 1 else "", lambda: sys.exit(__doc__))()
