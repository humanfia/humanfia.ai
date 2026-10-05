"""Draws public/og.png -- the card that shows up when a link to the site is pasted somewhere.

    uv run --with cairosvg scripts/og.py

The card is laid out as an SVG here and rasterised, rather than kept as a binary nobody can
regenerate: the H and its circle come out of public/logo.svg, the wordmark's letters out of
.vitepress/theme/home/logo.ts, and the colours are the tokens from .vitepress/theme/style.css,
so a change to any of them is a re-run rather than a trip through a drawing program. Crawlers
want a raster, hence the PNG at the end.

The layout is the home page's hero, held still: the wordmark and the claim on the left, and on
the right the H as the hero leaves it -- on its disc, its circle home, the construction lines
it was drawn from, and the plinth running out past the edge of the card.
"""

import math
import re
from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parent.parent

# The palette, from .vitepress/theme/style.css. Keep in step with it.
INK = "#16161a"
INK_2 = "#4a4740"
INK_3 = "#7c776d"
PAPER = "#ece6da"
PAPER_LIGHT = "#f4f0e8"
RED = "#d6331f"

W, H = 1200, 630

SANS = "Helvetica Neue, Helvetica, Liberation Sans, Arial, sans-serif"
MONO = "Menlo, DejaVu Sans Mono, monospace"


def mark_geometry() -> tuple[str, dict[str, float]]:
    """The H's outline and its circle, read out of public/logo.svg."""
    source = (ROOT / "public" / "logo.svg").read_text()
    path = re.search(r'<path class="h"[^>]* d="([^"]+)"', source).group(1)
    attrs = re.search(r'<circle class="dot"[^>]*?cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', source)
    cx, cy, r = (float(v) for v in attrs.groups())
    return path, {"cx": cx, "cy": cy, "r": r}


def wordmark(x: float, y: float, height: float) -> str:
    """The lockup from logo.ts -- the H, then the letters -- with the dot on the i."""
    source = (ROOT / ".vitepress" / "theme" / "home" / "logo.ts").read_text()
    word_x = float(re.search(r"export const WORD_X = (\d+)", source).group(1))
    letters = re.findall(r"\{ x: (\d+), d: '([^']+)' \}, // (\S+)", source)
    path, dot = mark_geometry()
    parts = [f'<path fill="{INK}" d="{path}"/>']
    i_x = 0.0
    for lx, d, name in letters:
        parts.append(
            f'<path fill="{INK}" fill-rule="evenodd" transform="translate({word_x + float(lx)} 0)" d="{d}"/>'
        )
        if name.startswith("i"):
            i_x = word_x + float(lx) + 8  # the i is a 16-wide stem; its dot is centred on it
    parts.append(f'<circle fill="{RED}" cx="{i_x}" cy="{dot["cy"]}" r="{dot["r"]}"/>')
    s = height / 108
    return f'<g transform="translate({x} {y}) scale({s})">{"".join(parts)}</g>'


def construction(x: float, y: float, height: float) -> str:
    """The hero's still: disc, dial, guides, the H with its circle home, and the plinth. The
    hero's loose furniture (the needle, the square) is left out: at this size it would land on
    the headline."""
    path, dot = mark_geometry()
    s = height / 108
    hair = f'stroke="{INK_3}" stroke-width="{1.2 / s}" fill="none"'
    slope = 1 / 3
    ticks = []
    for i in range(24):
        a = i / 24 * 2 * math.pi
        r0 = 75 if i % 6 == 0 else 79
        ticks.append(
            f'<line x1="{78 + math.cos(a) * r0:.2f}" y1="{30 + math.sin(a) * r0:.2f}" '
            f'x2="{78 + math.cos(a) * 82:.2f}" y2="{30 + math.sin(a) * 82:.2f}"/>'
        )
    return f"""<g transform="translate({x} {y}) scale({s})">
    <circle cx="78" cy="30" r="70" fill="{PAPER}"/>
    <g {hair}><circle cx="78" cy="30" r="82"/>{"".join(ticks)}
      <line x1="-24" y1="0" x2="200" y2="0"/><line x1="-24" y1="108" x2="200" y2="108"/>
      <line x1="24" y1="-50" x2="24" y2="150"/><line x1="72" y1="-50" x2="72" y2="150"/>
      <line x1="-10" y1="{50 + 34 * slope}" x2="210" y2="{50 - 186 * slope}"/>
    </g>
    <path fill="{INK}" d="{path}"/>
    <circle fill="{RED}" cx="{dot["cx"]}" cy="{dot["cy"]}" r="{dot["r"]}"/>
    <rect x="-30" y="116" width="400" height="4" fill="{INK}"/>
    <g stroke="{INK}" stroke-width="{2 / s}">
      <line x1="110" y1="92" x2="152" y2="78"/><line x1="110" y1="99" x2="152" y2="85"/>
      <line x1="110" y1="106" x2="152" y2="92"/>
    </g>
  </g>"""


svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{PAPER_LIGHT}"/>
  {construction(800, 150, 300)}

  {wordmark(72, 72, 56)}

  <rect x="72" y="234" width="40" height="8" fill="{RED}"/>
  <text x="128" y="243" font-family="{MONO}" font-size="20" font-weight="bold"
        letter-spacing="3" fill="{INK}">OPEN-SOURCE AGENT FLOWS</text>
  <text x="68" y="336" font-family="{SANS}" font-size="78" font-weight="bold"
        letter-spacing="-3" fill="{INK}">We build the flow</text>
  <text x="68" y="418" font-family="{SANS}" font-size="78" font-weight="bold"
        letter-spacing="-3" fill="{INK}">around the agents.</text>

  <text x="72" y="490" font-family="{SANS}" font-size="28" fill="{INK_2}">The runtime, the flows and the referee</text>
  <text x="72" y="528" font-family="{SANS}" font-size="28" fill="{INK_2}">for long-horizon agent work.</text>

  <rect x="0" y="{H - 10}" width="{W}" height="10" fill="{INK}"/>
  <text x="72" y="584" font-family="{MONO}" font-size="22" font-weight="bold" fill="{INK}">humanfia.ai</text>
</svg>
"""

out = ROOT / "public" / "og.png"
cairosvg.svg2png(bytestring=svg.encode(), write_to=str(out), output_width=W, output_height=H)
print(f"wrote {out}")
