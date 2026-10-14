#!/usr/bin/env python3
"""Inline the brand SVGs into the showreel source so their parts can be animated.

    python3 build.py   ->   src/showreel.src.html  =>  index.html
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
LOGOS = ROOT / "assets" / "logos"


def paths(svg_file):
    return re.findall(r"<path[^>]*?d=\"([^\"]+)\"", (LOGOS / svg_file).read_text())


def castor(prefix):
    p = paths("castor-navy.svg")
    # file order: swoosh-top, swoosh-bottom, o, a, C, star, t, s, r, tail, star-tip, star-tip
    letters = [(4, "C"), (3, "a"), (7, "s"), (6, "t"), (2, "o"), (8, "r")]
    out = [f'<svg class="castor-svg" viewBox="0 0 1994 1126" fill="#0F203A" xmlns="http://www.w3.org/2000/svg">']
    out.append(f'<defs><clipPath id="{prefix}-swclip"><rect class="sw-rect" x="0" y="0" width="0" height="1126"/></clipPath></defs>')
    out.append(f'<g class="c-sw" clip-path="url(#{prefix}-swclip)">')
    out += [f'<path d="{p[i]}"/>' for i in (0, 1, 9)]
    out.append("</g>")
    out += [f'<path class="c-l c-{n}" d="{p[i]}"/>' for i, n in letters]
    out.append('<g class="c-star">' + "".join(f'<path d="{p[i]}"/>' for i in (5, 10, 11)) + "</g>")
    out.append("</svg>")
    return "".join(out)


def isofiniti(prefix):
    p = paths("isofiniti-wordmark-light.svg")
    # file order: I T I I F O S I  N-diag(red) N-body  bracket-TL bracket-BR
    letters = [7, 6, 5, 4, 3, 9, 2, 1, 0]
    out = ['<svg class="iso-svg" viewBox="40 34 1228 292" fill="#0F0F11" xmlns="http://www.w3.org/2000/svg">']
    out.append(f'<defs><clipPath id="{prefix}-band"><rect x="100" y="100" width="1110" height="158"/></clipPath></defs>')
    out.append(f'<path class="iso-br iso-tl" d="{p[10]}"/><path class="iso-br iso-brr" d="{p[11]}"/>')
    out.append(f'<g clip-path="url(#{prefix}-band)">')
    out += [f'<path class="iso-l" d="{p[i]}"/>' for i in letters]
    out.append(f'<path class="iso-n" fill="#D01919" d="{p[8]}"/>')
    out.append("</g></svg>")
    return "".join(out)


src = (ROOT / "src" / "showreel.src.html").read_text()
src = src.replace("{{CASTOR_S1}}", castor("s1"))
src = src.replace("{{ISO_S4}}", isofiniti("s4"))
src = src.replace("{{ISO_END}}", isofiniti("end"))
(ROOT / "index.html").write_text(src)
print("wrote index.html", len(src), "bytes")
