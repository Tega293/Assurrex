import importlib.util
from pathlib import Path

import pandas as pd

from database import connect, get_claim


BACKEND = Path(__file__).resolve().parent
PROJECT = BACKEND.parent
CARDS = BACKEND / "generated_cards"

# Load the existing renderer from your dataset generator.
generator_file = PROJECT / "01_generate_dataset.py"
spec = importlib.util.spec_from_file_location(
    "assurex_generator", generator_file
)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


def make_card(claim_id, owner_id):
    """Draw the training-style card for one saved claim."""
    saved = get_claim(claim_id, owner_id)
    if saved is None:
        return None

    row = pd.Series(saved["claim_data"]).copy()
    row["repair_date"] = row.get("repair_date") or ""
    row["prior_claim_invoice"] = ""

    # Recalculate the facts shown on the training cards.
    row = generator.derive(row)

    # Was this invoice already present BEFORE this particular claim?
    invoice = row.get("invoice_number", "")
    with connect() as db:
        previous = db.execute(
            """
            SELECT id FROM claims
            WHERE invoice_number = ? AND id < ? AND owner_id = ?
            LIMIT 1
            """,
            (invoice, claim_id, owner_id),
        ).fetchone()

    row["duplicate_indicator"] = int(
        bool(invoice) and previous is not None
    )

    CARDS.mkdir(exist_ok=True)
    destination = CARDS / f"claim_{claim_id}.png"

    generator.draw_card(row, destination, variation=0)
    return destination
