"""
Server-side PDF -> page images (the production-style pipeline, run locally for the demo).

    python scripts/convert-pdf.py "CÉLINE — PARIS.pdf" celine-paris

Writes public/demo-pages/<slug>/page-01.jpg ... and manifest.json. The app only ever loads these
images; the original PDF is never sent to a viewer. In production this runs on upload in a
background job, files go to private storage, and pages are served through short-lived signed URLs
(optionally with the viewer's email burned into each image).

Requires PyMuPDF:  pip install pymupdf
"""
import json
import sys
from pathlib import Path

import fitz  # PyMuPDF

WIDTH = 1600  # px — sharp on retina laptops, ~150-400 KB per page as JPEG


def main(pdf_path: str, slug: str) -> None:
    out = Path("public/demo-pages") / slug
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("page-*.jpg"):
        old.unlink()

    doc = fitz.open(pdf_path)
    first = doc[0].rect
    for i, page in enumerate(doc, start=1):
        zoom = WIDTH / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        pix.save(out / f"page-{i:02d}.jpg", jpg_quality=82)
        print(f"  page {i}/{len(doc)}")

    manifest = {"pages": len(doc), "aspect": round(first.width / first.height, 4), "width": WIDTH}
    (out / "manifest.json").write_text(json.dumps(manifest))
    print(f"Converted {len(doc)} pages -> {out}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
