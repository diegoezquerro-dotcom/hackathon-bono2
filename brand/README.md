# Bono Brand Extraction

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
| Lufga-Bold | 1, 3, 9, 10, 11, 15 |
| Lufga-ExtraBold | 4, 5, 6, 7, 8, 10, 12, 13 |
| Lufga-Medium | 10 |
| Lufga-Regular | 1, 2, 4, 5, 6, 7, 8, 10, 12, 13, 14 |
| Lufga-SemiBold | 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 |

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
| 1 | 0 | `brand/assets/extracted-images/page-01-image-00.png` | 1339x767 |
| 4 | 0 | `brand/assets/extracted-images/page-04-image-00.png` | 927x316 |
| 4 | 1 | `brand/assets/extracted-images/page-04-image-01.png` | 1207x243 |
| 4 | 2 | `brand/assets/extracted-images/page-04-image-02.png` | 1212x243 |
| 5 | 0 | `brand/assets/extracted-images/page-05-image-00.png` | 717x306 |
| 6 | 0 | `brand/assets/extracted-images/page-06-image-00.png` | 353x121 |
| 7 | 0 | `brand/assets/extracted-images/page-07-image-00.png` | 794x518 |
| 7 | 1 | `brand/assets/extracted-images/page-07-image-01.png` | 786x514 |
| 7 | 2 | `brand/assets/extracted-images/page-07-image-02.png` | 786x514 |
| 7 | 3 | `brand/assets/extracted-images/page-07-image-03.png` | 788x514 |
| 8 | 0 | `brand/assets/extracted-images/page-08-image-00.png` | 453x155 |
| 8 | 1 | `brand/assets/extracted-images/page-08-image-01.png` | 589x115 |
| 8 | 2 | `brand/assets/extracted-images/page-08-image-02.png` | 766x404 |
| 12 | 0 | `brand/assets/extracted-images/page-12-image-00.png` | 274x274 |
| 13 | 0 | `brand/assets/extracted-images/page-13-image-00.png` | 572x1126 |
| 13 | 1 | `brand/assets/extracted-images/page-13-image-01.png` | 1126x686 |
| 13 | 2 | `brand/assets/extracted-images/page-13-image-02.png` | 671x1020 |
| 13 | 3 | `brand/assets/extracted-images/page-13-image-03.png` | 753x1012 |
| 13 | 4 | `brand/assets/extracted-images/page-13-image-04.png` | 1126x795 |
| 15 | 0 | `brand/assets/extracted-images/page-15-image-00.png` | 1339x767 |

## React-Ready Assets

- JSON tokens: `brand/tokens/bono-brand.json`
- CSS custom properties: `brand/tokens/bono-brand.css`
- JS token export: `brand/tokens/bono-brand.js`
- Manual text extraction: `brand/manual-text.md`
