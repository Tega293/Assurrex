import json
from urllib.request import Request, urlopen


claim = {
    "product_category": "Phone",
    "fault_type": "Battery fault",
    "damage_type": "None",
    "purchase_date": "2026-01-10",
    "fault_date": "2026-09-20",
    "claim_date": "2026-09-25",
    "repair_date": "",
    "warranty_months": 12,
    "repair_count": 0,
    "authorized_repair": None,
    "receipt_present": 1,
    "missing_document_count": 0,
    "policy_id": "basic",
    "registered_serial": "SN12345ABC",
    "evidence_serial": "SN12345ABC",
    "invoice_number": "INV123456789"
}

request = Request(
    "http://127.0.0.1:5000/api/claims/analyze",
    data=json.dumps(claim).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with urlopen(request) as response:
    result = json.load(response)

print(json.dumps(result, indent=2))