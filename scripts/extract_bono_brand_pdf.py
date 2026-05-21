"""Extract Bono identity manual content into repo-friendly brand assets.

Usage:
    python scripts/extract_bono_brand_pdf.py "C:/path/to/Manual de Identidad Bono.pdf"
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand"
ASSETS = OUT / "assets"
EXTRACTED = ASSETS / "extracted-images"
SOURCE = OUT / "source"
TOKENS = OUT / "tokens"


ASSET_ALIASES = {
    "backgrounds/gradient-cover.png": "page-01-image-00.png",
    "backgrounds/gradient-footer.png": "page-15-image-00.png",
    "logos/bono-logo-original-large.png": "page-04-image-00.png",
    "logos/bono-logo-gradient-and-inverse.png": "page-04-image-01.png",
    "logos/bono-logo-black-and-light.png": "page-04-image-02.png",
    "logos/bono-logo-minimum-size.png": "page-06-image-00.png",
    "rules/logo-clear-space.png": "page-05-image-00.png",
    "rules/logo-usage-image-forest.png": "page-07-image-00.png",
    "rules/logo-usage-image-industrial-busy.png": "page-07-image-01.png",
    "rules/logo-usage-image-industrial-low-contrast.png": "page-07-image-02.png",
    "rules/logo-usage-image-cutting.png": "page-07-image-03.png",
    "rules/logo-incorrect-rotation.png": "page-08-image-00.png",
    "rules/logo-incorrect-stretch.png": "page-08-image-01.png",
    "rules/logo-incorrect-contrast.png": "page-08-image-02.png",
    "swatches/primary-gradient-circle.png": "page-12-image-00.png",
    "icons/dashboard-mitigation-projects.png": "page-13-image-00.png",
    "icons/strategy-analysis.png": "page-13-image-01.png",
    "icons/renewable-energy-transformation.png": "page-13-image-02.png",
    "icons/carbon-footprint-targets.png": "page-13-image-03.png",
    "icons/carbon-offsets.png": "page-13-image-04.png",
}


BRAND = {
    "name": "Bono",
    "tagline": "cutting emissions",
    "sourceManual": "brand/source/manual-identidad-bono.pdf",
    "colors": {
        "black": {
            "hex": "#000000",
            "rgb": [0, 0, 0],
            "cmyk": [75, 68, 67, 90],
            "usage": "Primary brand color and high-contrast logo/text color.",
        },
        "gradientBlue": {
            "hex": "#3001F7",
            "rgb": [48, 1, 247],
            "cmyk": [85, 78, 0, 0],
            "usage": "Primary gradient start/accent blue.",
        },
        "gradientPurple": {
            "hex": "#7243FD",
            "rgb": [114, 67, 253],
            "cmyk": [71, 73, 0, 0],
            "usage": "Primary gradient end/accent purple.",
        },
        "lightGray": {
            "hex": "#F1F1F1",
            "rgb": [241, 241, 241],
            "cmyk": [4, 3, 3, 0],
            "usage": "Secondary color for presentations, web surfaces, and light logo usage.",
        },
        "white": {
            "hex": "#FFFFFF",
            "rgb": [255, 255, 255],
            "usage": "Clear space, inverse layouts, and neutral page background.",
        },
    },
    "gradients": {
        "primary": {
            "css": "linear-gradient(135deg, #3001F7 0%, #7243FD 100%)",
            "stops": ["#3001F7", "#7243FD"],
        }
    },
    "typography": {
        "logo": {
            "family": "Cocon Pro",
            "weight": "Regular",
            "usage": "Logo only. Do not use for general UI or marketing copy.",
        },
        "brand": {
            "family": "Lufga",
            "bodyWeights": ["Regular", "Medium"],
            "headingWeights": ["SemiBold", "Bold", "ExtraBold"],
            "fallbackCss": "'Lufga', 'Inter', 'Avenir Next', 'Segoe UI', sans-serif",
        },
    },
    "logoRules": {
        "concept": (
            "The last O/0 represents the break in the emissions chain and acts as "
            "the brand's visual accent."
        ),
        "clearSpace": "Minimum clear space equals 100% of the height of the '2' element.",
        "minimumSize": {
            "width": "3 cm",
            "height": "1 cm",
        },
        "approvedVariants": [
            "Original",
            "Gradient",
            "Black",
            "Light gray on color surfaces",
            "Light gray on black surface",
        ],
        "doNot": [
            "Do not rotate the logo.",
            "Do not stretch or elongate the logo.",
            "Do not use unapproved colors.",
            "Do not create an outline version.",
            "Do not place the logo on backgrounds with insufficient contrast.",
            "Do not place the logo over busy images that reduce legibility.",
        ],
    },
    "iconography": {
        "style": "Uses Bono black plus the blue-purple gradient palette.",
        "manualIcons": [
            "Dashboard 1: Proyectos de mitigacion",
            "Estrategia/Analisis",
            "Dashboard 2: Cambio/Transformacion a energias renovables",
            "Huella de carbono Targets",
            "Dashboard 3: Carbon Offsets",
        ],
    },
}


def clean_text(text: str) -> str:
    text = text.replace("\u2014", "-")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u00ed", "i") if False else text
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def extract_fonts(reader: PdfReader) -> dict[str, list[int]]:
    fonts: dict[str, set[int]] = {}
    for page_index, page in enumerate(reader.pages, start=1):
        resources = page.get("/Resources") or {}
        page_fonts = resources.get("/Font")
        if not page_fonts:
            continue
        for font_ref in page_fonts.get_object().values():
            font = font_ref.get_object()
            base_font = str(font.get("/BaseFont", "")).lstrip("/")
            base_font = base_font.split("+", 1)[-1]
            fonts.setdefault(base_font, set()).add(page_index)
    return {font: sorted(pages) for font, pages in sorted(fonts.items())}


def extract_images(reader: PdfReader) -> list[dict[str, object]]:
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, object]] = []
    for page_index, page in enumerate(reader.pages, start=1):
        for image_index, pdf_image in enumerate(page.images):
            image = pdf_image.image
            suffix = ".png"
            filename = f"page-{page_index:02d}-image-{image_index:02d}{suffix}"
            path = EXTRACTED / filename
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")
            image.save(path)
            manifest.append(
                {
                    "page": page_index,
                    "index": image_index,
                    "sourceName": pdf_image.name,
                    "file": str(path.relative_to(ROOT)).replace("\\", "/"),
                    "width": image.width,
                    "height": image.height,
                    "mode": image.mode,
                }
            )
    return manifest


def create_contact_sheet(manifest: list[dict[str, object]]) -> None:
    if not manifest:
        return
    thumb_w, thumb_h = 220, 150
    gap = 20
    label_h = 42
    cols = 3
    rows = (len(manifest) + cols - 1) // cols
    sheet = Image.new(
        "RGB",
        (cols * thumb_w + (cols + 1) * gap, rows * (thumb_h + label_h) + (rows + 1) * gap),
        "white",
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for idx, item in enumerate(manifest):
        row, col = divmod(idx, cols)
        x = gap + col * (thumb_w + gap)
        y = gap + row * (thumb_h + label_h + gap)
        image_path = ROOT / str(item["file"])
        with Image.open(image_path) as image:
            preview = image.convert("RGBA")
            preview.thumbnail((thumb_w, thumb_h))
            px = x + (thumb_w - preview.width) // 2
            py = y + (thumb_h - preview.height) // 2
            if preview.mode == "RGBA":
                sheet.paste(preview, (px, py), preview)
            else:
                sheet.paste(preview, (px, py))
        label = f"p{item['page']:02d} img{item['index']:02d} {item['width']}x{item['height']}"
        draw.text((x, y + thumb_h + 8), label, fill=(0, 0, 0), font=font)
    sheet.save(ASSETS / "extracted-images-contact-sheet.png")


def create_asset_aliases() -> None:
    for alias, extracted_name in ASSET_ALIASES.items():
        source = EXTRACTED / extracted_name
        target = ASSETS / alias
        if not source.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def white_to_transparent(source: Path, target: Path, threshold: int = 246) -> None:
    with Image.open(source) as image:
        rgba = image.convert("RGBA")
        pixels = rgba.load()
        for y in range(rgba.height):
            for x in range(rgba.width):
                r, g, b, a = pixels[x, y]
                if r >= threshold and g >= threshold and b >= threshold:
                    pixels[x, y] = (255, 255, 255, 0)
                else:
                    pixels[x, y] = (r, g, b, a)
        target.parent.mkdir(parents=True, exist_ok=True)
        rgba.save(target)


def create_transparent_logo_variants() -> None:
    white_to_transparent(
        ASSETS / "logos" / "bono-logo-original-large.png",
        ASSETS / "logos" / "transparent" / "bono-logo-original-large-transparent.png",
    )
    white_to_transparent(
        ASSETS / "logos" / "bono-logo-minimum-size.png",
        ASSETS / "logos" / "transparent" / "bono-logo-minimum-size-transparent.png",
    )


def write_tokens() -> None:
    TOKENS.mkdir(parents=True, exist_ok=True)
    (TOKENS / "bono-brand.json").write_text(
        json.dumps(BRAND, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    write_text(
        TOKENS / "bono-brand.css",
        """:root {
  --bono-color-black: #000000;
  --bono-color-gradient-blue: #3001F7;
  --bono-color-gradient-purple: #7243FD;
  --bono-color-light-gray: #F1F1F1;
  --bono-color-white: #FFFFFF;
  --bono-gradient-primary: linear-gradient(135deg, #3001F7 0%, #7243FD 100%);
  --bono-font-family: 'Lufga', 'Inter', 'Avenir Next', 'Segoe UI', sans-serif;
  --bono-font-logo: 'Cocon Pro', 'Lufga', sans-serif;
}
""",
    )
    write_text(
        TOKENS / "bono-brand.js",
        """export const bonoBrand = {
  name: 'Bono',
  tagline: 'cutting emissions',
  colors: {
    black: '#000000',
    gradientBlue: '#3001F7',
    gradientPurple: '#7243FD',
    lightGray: '#F1F1F1',
    white: '#FFFFFF',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3001F7 0%, #7243FD 100%)',
  },
  typography: {
    family: "'Lufga', 'Inter', 'Avenir Next', 'Segoe UI', sans-serif",
    logoFamily: "'Cocon Pro', 'Lufga', sans-serif",
    bodyWeights: ['Regular', 'Medium'],
    headingWeights: ['SemiBold', 'Bold', 'ExtraBold'],
  },
};
""",
    )


def write_readme(fonts: dict[str, list[int]], image_manifest: list[dict[str, object]]) -> None:
    image_rows = "\n".join(
        f"| {item['page']} | {item['index']} | `{item['file']}` | {item['width']}x{item['height']} |"
        for item in image_manifest
    )
    font_rows = "\n".join(
        f"| {font} | {', '.join(str(page) for page in pages)} |" for font, pages in fonts.items()
    )
    readme = f"""# Bono Brand Extraction

Source: `brand/source/manual-identidad-bono.pdf`

This folder contains the first-pass identity extraction from the Bono manual for future React/JS landing page work.

## Brand Core

- Brand: Bono
- Tagline: cutting emissions
- Logo concept: the final `O`/`0` breaks the emissions chain and becomes the brand accent.
- Logo typeface: Cocon Pro Regular, logo only.
- Application typeface: Lufga.

## Colors

| Token | HEX | RGB | CMYK | Usage |
| --- | --- | --- | --- | --- |
| Black | `#000000` | `0, 0, 0` | `75, 68, 67, 90` | Primary contrast, text, black logo |
| Gradient Blue | `#3001F7` | `48, 1, 247` | `85, 78, 0, 0` | Primary gradient/accent |
| Gradient Purple | `#7243FD` | `114, 67, 253` | `71, 73, 0, 0` | Primary gradient/accent |
| Light Gray | `#F1F1F1` | `241, 241, 241` | `4, 3, 3, 0` | Secondary web/presentation surface and light logo variant |
| White | `#FFFFFF` | `255, 255, 255` | - | Clear space and neutral background |

CSS gradient: `linear-gradient(135deg, #3001F7 0%, #7243FD 100%)`

## Typography

- Use `Lufga Regular` or `Lufga Medium` for general text blocks.
- Use `Lufga SemiBold`, `Lufga Bold`, or heavier weights for titles and subtitles.
- Keep `Cocon Pro Regular` limited to the logo.
- Fallback stack prepared in `brand/tokens/bono-brand.css` and `brand/tokens/bono-brand.js`.

Extracted embedded PDF fonts:

| Font | Pages |
| --- | --- |
{font_rows}

## Logo Rules

- Approved variants: original, gradient, black, light gray on color, light gray on black.
- Minimum clear space: 100% of the height of the `2` element.
- Minimum size guidance: 3 cm wide by 1 cm high.
- Avoid: rotation, stretching, unapproved colors, outline-only logo, poor contrast, busy image backgrounds.

## Icons

The manual shows five icon families using the Bono black plus blue-purple gradient palette:

- Dashboard 1: Proyectos de mitigacion
- Estrategia/Analisis
- Dashboard 2: Cambio/Transformacion a energias renovables
- Huella de carbono Targets
- Dashboard 3: Carbon Offsets

## Extracted Images

See `brand/assets/extracted-images-contact-sheet.png` for a quick visual index.

Categorized aliases for implementation:

- Logos: `brand/assets/logos/`
- Transparent logo variants: `brand/assets/logos/transparent/`
- Icons: `brand/assets/icons/`
- Backgrounds: `brand/assets/backgrounds/`
- Swatches: `brand/assets/swatches/`
- Usage rules/examples: `brand/assets/rules/`

| Page | Index | File | Size |
| --- | --- | --- | --- |
{image_rows}

## React-Ready Assets

- JSON tokens: `brand/tokens/bono-brand.json`
- CSS custom properties: `brand/tokens/bono-brand.css`
- JS token export: `brand/tokens/bono-brand.js`
- Manual text extraction: `brand/manual-text.md`
"""
    write_text(OUT / "README.md", readme)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/extract_bono_brand_pdf.py <manual.pdf>", file=sys.stderr)
        return 2
    pdf_path = Path(sys.argv[1]).expanduser().resolve()
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    SOURCE.mkdir(parents=True, exist_ok=True)
    shutil.copy2(pdf_path, SOURCE / "manual-identidad-bono.pdf")

    reader = PdfReader(str(pdf_path))
    page_text = []
    for idx, page in enumerate(reader.pages, start=1):
        page_text.append(f"## Page {idx}\n\n{clean_text(page.extract_text() or '')}\n")
    write_text(OUT / "manual-text.md", "# Manual de Identidad Bono - Extracted Text\n\n" + "\n".join(page_text))

    fonts = extract_fonts(reader)
    images = extract_images(reader)
    write_text(ASSETS / "extracted-images-manifest.json", json.dumps(images, indent=2) + "\n")
    create_contact_sheet(images)
    create_asset_aliases()
    create_transparent_logo_variants()
    write_tokens()
    write_readme(fonts, images)

    print(f"Extracted {len(reader.pages)} pages, {len(fonts)} fonts, {len(images)} images into {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
