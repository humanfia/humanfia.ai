"""Draws public/og.png -- the card that shows up when a link to the site is pasted somewhere.

    uv run --with cairosvg scripts/og.py

The card is laid out as an SVG here and rasterised, rather than kept as a binary nobody can
regenerate: the H comes out of public/logo.svg itself, and the colours are the tokens from
.vitepress/theme/style.css, so a palette change is a two-line edit and a re-run rather than a
trip through a drawing program. Crawlers want a raster, hence the PNG at the end.
"""

import re
from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parent.parent

# The palette, from .vitepress/theme/style.css. Keep in step with it.
SLATE = "#1e293b"
INK = "#0f172a"
PALE = "#e2e8f0"
BLUE = "#2e599e"
BODY = "#475569"
PAPER = "#f8fafc"

W, H = 1200, 630

SANS = "Liberation Sans, Arial, sans-serif"
MONO = "DejaVu Sans Mono, monospace"


def mark(x: float, y: float, height: float) -> str:
    """The logo, lifted straight out of public/logo.svg and placed at a size."""
    source = (ROOT / "public" / "logo.svg").read_text()
    body = re.search(r"(<g fill=.*</g>)", source, re.S).group(1)
    scale = height / 57  # the logo's viewBox is 51x57
    return f'<g transform="translate({x} {y}) scale({scale})">{body}</g>'


svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{PAPER}"/>
  <rect width="{W}" height="10" fill="{SLATE}"/>

  {mark(72, 84, 96)}
  <text x="196" y="164" font-family="{MONO}" font-size="44" font-weight="bold"
        letter-spacing="3" fill="{SLATE}">HUMANFIA</text>

  <text x="72" y="322" font-family="{SANS}" font-size="72" font-weight="bold"
        letter-spacing="-2" fill="{INK}">We build the flow</text>
  <text x="72" y="402" font-family="{SANS}" font-size="72" font-weight="bold"
        letter-spacing="-2" fill="{BLUE}">around the agent.</text>

  <text x="72" y="480" font-family="{SANS}" font-size="30" fill="{BODY}">A research team working on</text>
  <text x="72" y="520" font-family="{SANS}" font-size="30" fill="{BODY}">long-horizon agent systems.</text>

  <text x="72" y="582" font-family="{MONO}" font-size="26" font-weight="bold"
        fill="{INK}">humanfia.ai</text>

  <!-- Slate and the matte white, in that order: the two colours the logo is drawn in. -->
  <rect x="700" y="552" width="{W - 700}" height="{H - 552}" fill="{SLATE}"/>
  <text x="950" y="599" font-family="{MONO}" font-size="22" font-weight="bold"
        letter-spacing="1" text-anchor="middle" fill="{PALE}">6/6 IMO 2026 · 99.7% PUTNAMBENCH</text>
</svg>
"""

out = ROOT / "public" / "og.png"
cairosvg.svg2png(bytestring=svg.encode(), write_to=str(out), output_width=W, output_height=H)
print(f"wrote {out}")
