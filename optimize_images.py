from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
PUBLIC = ROOT / "public"
FORMATS = {".png", ".jpg", ".jpeg"}
MAX_SIZE = 1920
QUALITY = 84

def optimize(source: Path):
    target = source.with_suffix(".webp")
    # Some sources have both JPG and PNG versions with the same name. The
    # application uses PNG paths, so the PNG must be the authoritative source.
    if target.exists() and source.suffix.lower() != ".png":
        return source.stat().st_size, target.stat().st_size, None, None
    with Image.open(source) as image:
        image.load()
        width, height = image.size
        scale = min(1, MAX_SIZE / max(width, height))
        if scale < 1:
            image = image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(target, "WEBP", quality=QUALITY, method=6)
    return source.stat().st_size, target.stat().st_size, (width, height), image.size

def main():
    total_before = total_after = 0
    for source in sorted(PUBLIC.rglob("*")):
        if not source.is_file() or source.suffix.lower() not in FORMATS:
            continue
        before, after, original_size, new_size = optimize(source)
        total_before += before
        total_after += after
        size_note = "already optimized" if original_size is None else f"{original_size} -> {new_size}"
        print(f"{source.relative_to(ROOT)}: {size_note}; {before / 1024:.0f} KB -> {after / 1024:.0f} KB")
    print(f"TOTAL: {total_before / 1024 / 1024:.2f} MB -> {total_after / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
