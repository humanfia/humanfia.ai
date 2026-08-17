"""Picks a still for every recording in public/demo, for the gallery to show before it plays.

    uv run --with pillow scripts/posters.py

A GIF's first frame is an empty terminal, which is the least interesting picture of it there is,
and the stills that came with the recordings are whichever frame the recorder happened to stop
on. So this walks every frame and keeps the one with the most on screen -- the card then shows
the run at its fullest, and hovering rewinds it to the beginning and plays.
"""

from pathlib import Path

from PIL import Image, ImageSequence

DEMO = Path(__file__).resolve().parent.parent / "public" / "demo"

# The terminal's own background, which is what "nothing on screen yet" looks like.
BACKGROUND = (23, 23, 23)
TOLERANCE = 24


def ink(frame: Image.Image) -> int:
    """How many pixels of this frame are not the empty terminal."""
    small = frame.convert("RGB").resize((200, 120))
    return sum(
        count
        for count, pixel in small.getcolors(200 * 120)
        if any(abs(pixel[i] - BACKGROUND[i]) > TOLERANCE for i in range(3))
    )


# Only the back half is considered. A terminal recording opens on the same splash whichever
# command is being demonstrated, and that screen is both the fullest and the least informative
# one in the file -- three cards showing it is three cards saying nothing.
FROM = 0.45

for source in sorted(DEMO.glob("*.gif")):
    with Image.open(source) as gif:
        frames = [frame.convert("RGB") for frame in ImageSequence.Iterator(gif)]

    late = frames[int(len(frames) * FROM) :]
    best = max((ink(frame), i, frame) for i, frame in enumerate(late))

    # A terminal is a handful of colours on a dark field, so a palette costs nothing to look at
    # and roughly a third of the bytes of the truecolour version.
    out = source.with_name(f"{source.stem}-poster.png")
    best[2].quantize(colors=64, method=Image.Quantize.MEDIANCUT).save(out, optimize=True)
    print(f"{source.name}: frame {best[1]} -> {out.name} ({out.stat().st_size // 1024}KB)")
