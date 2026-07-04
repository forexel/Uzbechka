#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "word-images"
TARGET_SIZE = (640, 480)
QUALITY = 72


def cover_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB")
    target_w, target_h = size
    src_w, src_h = image.size
    src_ratio = src_w / src_h
    target_ratio = target_w / target_h

    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        image = image.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        image = image.crop((0, top, src_w, top + new_h))

    return image.resize(size, Image.Resampling.LANCZOS)


def main() -> None:
    pngs = sorted(SOURCE_DIR.glob("*.png"))
    if not pngs:
        print("No PNG files found.")
        return

    total_before = 0
    total_after = 0
    for source in pngs:
        total_before += source.stat().st_size
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            cover_resize(image, TARGET_SIZE).save(
                target,
                "WEBP",
                quality=QUALITY,
                method=6,
                optimize=True,
            )
        total_after += target.stat().st_size

    print(f"Compressed {len(pngs)} images")
    print(f"PNG total:  {total_before / 1024 / 1024:.1f} MB")
    print(f"WEBP total: {total_after / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
