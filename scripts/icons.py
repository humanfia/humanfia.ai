"""Draws the app icons in public/, from the same H as everything else.

    uv run --with cairosvg scripts/icons.py

A favicon can be an SVG with a media query in it, and public/favicon.svg is. A home-screen icon
cannot: iOS and Android want a raster of a known size, and they composite it onto a background
of their choosing, so a transparent mark would come out as a slate H on whatever the phone felt
like. These are drawn on the slate the mark belongs to instead, and are the only icons the site
has -- the previous set was a different logo in a different palette that nothing referenced.
"""

import re
from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parent.parent

SLATE = "#1e293b"
PALE = "#e2e8f0"

# Sizes: 180 is what iOS asks for, 192 and 512 are what a web app manifest asks for.
SIZES = [180, 192, 512]


def card(size: int) -> str:
    """The mark, pale, centred on slate, with the margin a home screen expects."""
    source = (ROOT / "public" / "logo.svg").read_text()
    body = re.search(r"(<g fill=)(?:.*?)(\s+transform=.*</g>)", source, re.S)
    glyph = f'{body.group(1)}"{PALE}"{body.group(2)}'

    mark = size * 0.56  # height of the H inside the tile
    scale = mark / 57  # the logo's viewBox is 51x57
    x = (size - 51 * scale) / 2
    y = (size - mark) / 2

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" rx="{size * 0.22}" fill="{SLATE}"/>'
        f'<g transform="translate({x} {y}) scale({scale})">{glyph}</g>'
        "</svg>"
    )


for size in SIZES:
    out = ROOT / "public" / f"icon-{size}.png"
    cairosvg.svg2png(
        bytestring=card(size).encode(), write_to=str(out), output_width=size, output_height=size
    )
    print(f"wrote {out.name} ({out.stat().st_size // 1024}KB)")
