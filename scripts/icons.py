"""Draws the app icons in public/, from the same H as everything else.

    uv run --with cairosvg scripts/icons.py

A favicon can be an SVG with a media query in it, and public/favicon.svg is. A home-screen icon
cannot: iOS and Android want a raster of a known size, and they composite it onto a background
of their choosing, so a transparent mark would come out as an ink H on whatever the phone felt
like. These are drawn the way the dark mode draws the mark -- paper H, lifted red circle -- on a
full square of ink. Full bleed and square: the phone rounds or masks the corners itself, and the
512 doubles as the manifest's maskable icon, so the mark sits well inside the safe circle.
"""

import re
from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parent.parent

# The palette, from .vitepress/theme/style.css. Keep in step with it.
INK = "#16161a"
PAPER = "#ece6da"
RED = "#ff5a43"  # the dark mode's red: the icon is the mark on ink

# Sizes: 180 is what iOS asks for, 192 and 512 are what a web app manifest asks for.
SIZES = [180, 192, 512]


def geometry() -> tuple[str, str]:
    """The H's outline and the circle's attributes, read out of public/logo.svg."""
    source = (ROOT / "public" / "logo.svg").read_text()
    path = re.search(r'<path class="h"[^>]* d="([^"]+)"', source).group(1)
    circle = re.search(r'<circle class="dot"[^>]*?(cx="[^"]+" cy="[^"]+" r="[^"]+")', source).group(1)
    return path, circle


def card(size: int) -> str:
    """The mark centred on ink, its 96 x 108 box half the tile high (the maskable safe zone is
    the middle 80%, and the H's corners have to stay inside its circle)."""
    path, circle = geometry()
    mark = size * 0.5  # height of the H inside the tile
    scale = mark / 108
    x = (size - 96 * scale) / 2
    y = (size - mark) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" fill="{INK}"/>'
        f'<g transform="translate({x} {y}) scale({scale})">'
        f'<path fill="{PAPER}" d="{path}"/><circle fill="{RED}" {circle}/></g>'
        "</svg>"
    )


for size in SIZES:
    out = ROOT / "public" / f"icon-{size}.png"
    cairosvg.svg2png(
        bytestring=card(size).encode(), write_to=str(out), output_width=size, output_height=size
    )
    print(f"wrote {out.name} ({out.stat().st_size // 1024}KB)")
