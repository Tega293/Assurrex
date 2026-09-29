import io
import re

import pymupdf
import pytesseract
from PIL import Image, UnidentifiedImageError


pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

def read_receipt(file_bytes, filename):
    """Extract text from an uploaded image or PDF."""
    name = filename.lower()

    if name.endswith((".png", ".jpg", ".jpeg")):
        try:
            image = Image.open(io.BytesIO(file_bytes))
            image.load()
        except (UnidentifiedImageError, OSError) as error:
            raise ValueError("This is not a readable image.") from error

        text = pytesseract.image_to_string(
            image.convert("RGB"),
            timeout=20,
        )

    elif name.endswith(".pdf"):
        try:
            document = pymupdf.open(stream=file_bytes, filetype="pdf")
        except Exception as error:
            raise ValueError("This is not a readable PDF.") from error

        if document.page_count > 3:
            document.close()
            raise ValueError("Upload a PDF of at most 3 pages.")

        parts = []

        for page in document:
            # First try text already embedded in the PDF.
            page_text = page.get_text("text")

            # A scanned PDF page is an image, so OCR that page.
            if not page_text.strip():
                pixels = page.get_pixmap(dpi=150)
                image = Image.open(io.BytesIO(pixels.tobytes("png")))
                page_text = pytesseract.image_to_string(
                    image,
                    timeout=20,
                )

            parts.append(page_text)

        document.close()
        text = "\n".join(parts)

    else:
        raise ValueError("Upload a PNG, JPG, JPEG, or PDF file.")

    return text.strip()


def suggest_fields(text):
    """Suggest values only when an explicit label and value appear."""

    invoice = re.search(
        r"^\s*(?:invoice|receipt)\s*(?:no\.?|number|#)?"
        r"\s*[:#-]\s*([A-Z0-9][A-Z0-9-]{4,29})\s*$",
        text,
        re.IGNORECASE | re.MULTILINE,
    )

    serial = re.search(
        r"^\s*(?:serial|s/n)\s*(?:no\.?|number|#)?"
        r"\s*[:#-]\s*([A-Z0-9][A-Z0-9-]{4,29})\s*$",
        text,
        re.IGNORECASE | re.MULTILINE,
    )

    purchase_date = re.search(
        r"^\s*(?:purchased|purchase date|date of purchase)"
        r"\s*:\s*(\d{4}-\d{2}-\d{2})\b",
        text,
        re.IGNORECASE | re.MULTILINE,
    )

    return {
        "invoice_number": invoice.group(1) if invoice else None,
        "evidence_serial": serial.group(1) if serial else None,
        "possible_purchase_date": (
            purchase_date.group(1) if purchase_date else None
        ),
    }