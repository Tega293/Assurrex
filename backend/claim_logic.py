from calendar import monthrange
from datetime import date
from pathlib import Path

import joblib
import pandas as pd


# Find the AssureX folder from this file's location.
PROJECT_FOLDER = Path(__file__).resolve().parent.parent
MODEL_FILE = PROJECT_FOLDER / "output" / "assurex_python_model.joblib"

# Load the already-trained model once when the backend starts.
model = joblib.load(MODEL_FILE)

# These must match the columns in 02_train_python_model.py.
MODEL_COLUMNS = [
    "warranty_months",
    "product_age_days",
    "remaining_warranty_days",
    "fault_claim_gap_days",
    "repair_purchase_gap_days",
    "receipt_present",
    "serial_match",
    "repair_count",
    "authorized_repair",
    "missing_document_count",
    "duplicate_indicator",
    "contradiction_indicator",
    "product_category",
    "fault_type",
    "damage_type",
]


def add_months(day, months):
    """Add calendar months to a purchase date."""
    year, month = divmod(day.year * 12 + day.month - 1 + months, 12)
    last_day = monthrange(year, month + 1)[1]
    return date(year, month + 1, min(day.day, last_day))


def required_date(claim, field):
    """Read a required date written as YYYY-MM-DD."""
    return date.fromisoformat(claim[field])


def analyze_claim(claim, duplicate_indicator=0):
    """Calculate facts, run the model, then apply warranty rules."""

    # 1. Read the customer's dates and details.
    purchase = required_date(claim, "purchase_date")
    fault = required_date(claim, "fault_date")
    claim_date = required_date(claim, "claim_date")

    repair_text = claim.get("repair_date")
    repair = date.fromisoformat(repair_text) if repair_text else None

    months = int(claim["warranty_months"])
    repair_count = int(claim.get("repair_count", 0))
    missing_documents = int(claim.get("missing_document_count", 0))
    receipt_present = int(claim.get("receipt_present", 0))

    authorized_repair = claim.get("authorized_repair")
    if authorized_repair is not None:
        authorized_repair = int(authorized_repair)

    if months <= 0 or repair_count < 0 or missing_documents < 0:
        raise ValueError(
            "Warranty months must be positive; counts cannot be negative."
        )

    if repair_count > 0 and authorized_repair not in (0, 1):
        raise ValueError(
            "A repaired product needs authorized_repair set to 0 or 1."
        )

    # 2. Work out facts that the customer should not calculate.
    expiry = add_months(purchase, months)
    remaining_days = (expiry - claim_date).days

    serial_match = int(
        claim["registered_serial"] == claim["evidence_serial"]
    )

    contradiction = int(
        fault < purchase
        or fault > claim_date
        or (
            repair is not None
            and (repair < purchase or repair > claim_date)
        )
    )

    # Important: the training CSV read "None" damage as a missing
    # category. Represent it as a missing value here too.
    damage_type = claim.get("damage_type", "None")
    model_damage = (
        float("nan") if damage_type == "None" else damage_type
    )

    # 3. Build ONE row with the model's training columns.
    model_row = {
        "warranty_months": months,
        "product_age_days": (claim_date - purchase).days,
        "remaining_warranty_days": remaining_days,
        "fault_claim_gap_days": (claim_date - fault).days,
        "repair_purchase_gap_days": (
            (repair - purchase).days if repair else float("nan")
        ),
        "receipt_present": receipt_present,
        "serial_match": serial_match,
        "repair_count": repair_count,
        "authorized_repair": (
            authorized_repair if repair_count else float("nan")
        ),
        "missing_document_count": missing_documents,
        "duplicate_indicator": duplicate_indicator,
        "contradiction_indicator": contradiction,
        "product_category": claim["product_category"],
        "fault_type": claim["fault_type"],
        "damage_type": model_damage,
    }

    inputs = pd.DataFrame([model_row], columns=MODEL_COLUMNS)

    # 4. Get the REAL model's three probabilities.
    scores = model.predict_proba(inputs)[0]
    probabilities = {
        label: round(float(score), 4)
        for label, score in zip(model.classes_, scores)
    }
    model_prediction = model.predict(inputs)[0]

    # 5. Apply the same illustrative decision rules used by
    # the dataset generator. Reasons appear on the results page.
    invalid_reasons = []
    review_reasons = []

    if remaining_days < 0:
        invalid_reasons.append("Warranty expired before the claim date.")

    if damage_type != "None":
        invalid_reasons.append("Reported damage is excluded by this policy.")
        
    if duplicate_indicator:
        review_reasons.append("This invoice appears on an earlier claim.")

    if repair_count > 0 and authorized_repair == 0:
        invalid_reasons.append("Repair was not authorized.")

    if receipt_present == 0:
        review_reasons.append("Receipt is missing.")

    if missing_documents > 0:
        review_reasons.append("Some supporting documents are missing.")

    if serial_match == 0:
        review_reasons.append("Product and evidence serial numbers differ.")

    if contradiction:
        review_reasons.append("The reported dates conflict.")

    if invalid_reasons:
        final_decision = "Invalid Claim"
        reasons = invalid_reasons + review_reasons
    elif review_reasons:
        final_decision = "Manual Review"
        reasons = review_reasons
    else:
        final_decision = "Valid Claim"
        reasons = ["Claim details meet the current sample warranty rules."]

    # 6. Send all useful results back to Flask.
    return {
        "python_prediction": model_prediction,
        "python_probabilities": probabilities,
        "final_recommendation": final_decision,
        "reasons": reasons,
        "calculated_facts": {
            "warranty_expiry_date": expiry.isoformat(),
            "remaining_warranty_days": remaining_days,
            "serial_match": bool(serial_match),
            "date_conflict": bool(contradiction),
        },
    }