from pathlib import Path

import requests


RECEIPT = Path(r"C:\Users\abdul\Desktop\Aptech\AssureX\AssureX_Sample_Receipt.png")

with RECEIPT.open("rb") as file:
    response = requests.post(
        "http://127.0.0.1:5000/api/documents/scan",
        files={"file": (RECEIPT.name, file)},
    )

print("HTTP status:", response.status_code)
print(response.json())