#!/usr/bin/env python3
"""Render the Wafra Review document to PDF.

    pip install weasyprint pillow
    python3 build.py

Fonts are bundled in ./fonts, so the output is identical anywhere.
"""
import pathlib
from weasyprint import HTML

here = pathlib.Path(__file__).parent
out = here.parent / "Farm_Monitoring_Wafra_Review.pdf"
HTML(filename=str(here / "review.html")).write_pdf(str(out))
print("wrote", out)
