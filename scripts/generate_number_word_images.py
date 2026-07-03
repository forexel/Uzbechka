from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_DIRS = [ROOT / "public" / "word-images", ROOT / "dist" / "word-images"]

NUMBERS = {
    "number-105": ("nol", 0),
    "number-106": ("bir", 1),
    "number-107": ("ikki", 2),
    "number-108": ("uch", 3),
    "number-109": ("toʻrt", 4),
    "number-110": ("besh", 5),
    "number-111": ("olti", 6),
    "number-112": ("yetti", 7),
    "number-113": ("sakkiz", 8),
    "number-114": ("toʻqqiz", 9),
    "number-115": ("oʻn", 10),
    "number-116": ("yigirma", 20),
    "number-117": ("oʻttiz", 30),
    "number-118": ("qirq", 40),
    "number-119": ("ellik", 50),
    "number-120": ("oltmish", 60),
    "number-121": ("yetmish", 70),
    "number-122": ("sakson", 80),
    "number-123": ("toʻqson", 90),
    "number-124": ("yuz", 100),
    "number-125": ("ming", 1000),
}

BG = (250, 247, 239)
CARD = (255, 253, 247)
INK = (27, 151, 99)
INK_DARK = (10, 112, 75)
SHADOW = (226, 218, 202)
ACCENT = (240, 186, 84)


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_dot(draw, x, y, r=13, fill=INK):
    draw.ellipse((x - r + 3, y - r + 5, x + r + 3, y + r + 5), fill=SHADOW)
    draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def dot_positions(count, x0, y0, cols=10, gap=42):
    for i in range(count):
        yield x0 + (i % cols) * gap, y0 + (i // cols) * gap


def draw_exact_dots(draw, value):
    if value == 0:
        rounded_rect(draw, (352, 264, 672, 504), 42, (245, 241, 232), (232, 224, 210), 4)
        draw.arc((422, 300, 602, 480), 30, 330, fill=INK_DARK, width=18)
        return

    if value <= 10:
        cols = 5 if value > 5 else value
        rows = (value + cols - 1) // cols
        gap = 92
        x0 = 512 - (cols - 1) * gap / 2
        y0 = 384 - (rows - 1) * gap / 2
        for x, y in dot_positions(value, x0, y0, cols, gap):
            draw_dot(draw, x, y, 28)
        return

    if value <= 100:
        tens = value // 10
        cards_per_row = 5
        card_w, card_h = 132, 92
        gap_x, gap_y = 22, 22
        rows = (tens + cards_per_row - 1) // cards_per_row
        start_x = 512 - (min(tens, cards_per_row) * card_w + (min(tens, cards_per_row) - 1) * gap_x) / 2
        start_y = 384 - (rows * card_h + (rows - 1) * gap_y) / 2
        for group in range(tens):
            row = group // cards_per_row
            col = group % cards_per_row
            x = start_x + col * (card_w + gap_x)
            y = start_y + row * (card_h + gap_y)
            rounded_rect(draw, (x, y, x + card_w, y + card_h), 22, (235, 249, 241), (189, 231, 212), 3)
            for dx, dy in dot_positions(10, x + 23, y + 24, 5, 20):
                draw_dot(draw, dx, dy, 6)
        return

    # Thousand: show ten large bundles, each bundle visually represents one hundred.
    start_x, start_y = 226, 214
    for group in range(10):
        row = group // 5
        col = group % 5
        x = start_x + col * 120
        y = start_y + row * 150
        rounded_rect(draw, (x, y, x + 92, y + 112), 20, (235, 249, 241), (189, 231, 212), 3)
        for dx, dy in dot_positions(10, x + 18, y + 24, 5, 14):
            draw_dot(draw, dx, dy, 4)
        rounded_rect(draw, (x + 22, y + 82, x + 70, y + 100), 8, ACCENT, None, 0)


def make_image(value):
    img = Image.new("RGB", (1024, 768), BG)
    draw = ImageDraw.Draw(img)
    rounded_rect(draw, (112, 76, 912, 692), 64, CARD, (238, 231, 218), 3)
    draw.ellipse((92, 74, 260, 242), fill=(226, 248, 238))
    draw.ellipse((788, 528, 948, 688), fill=(226, 248, 238))
    draw_exact_dots(draw, value)
    return img


for out_dir in OUT_DIRS:
    out_dir.mkdir(parents=True, exist_ok=True)
    for image_id, (_, value) in NUMBERS.items():
        make_image(value).save(out_dir / f"{image_id}.png", "PNG")

print(f"Generated {len(NUMBERS)} deterministic number images in {', '.join(str(p) for p in OUT_DIRS)}")
