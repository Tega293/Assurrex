# AssureX claim data contract (prototype v2)

Use these fields consistently in the dataset, API, database and card renderer.
Store dates as ISO strings `YYYY-MM-DD`; convert to Python `date` for rules.
The supplied labels and policies are synthetic examples, not manufacturer terms.

## Entered or extracted for a new claim

| Field | Source and meaning |
|---|---|
| product_category, fault_type, damage_type | Customer/service form and policy choice |
| purchase_date, warranty_months | Confirmed receipt or product registration |
| fault_date, claim_date | Customer report and submission time |
| repair_count, repair_date, authorized_repair | Repair history; date and authorization may be absent if no repairs |
| receipt_present, missing_document_count | Upload/evidence checklist |
| registered_serial, evidence_serial | Registered product and receipt/product photo after OCR confirmation |
| invoice_number | Confirmed receipt/OCR field |

## Obtained from prior claims

`prior_claim_id` and `prior_claim_invoice` come from a database duplicate lookup.
The synthetic `prior_claims.csv` contains matching prior invoices for the
duplicate scenarios. A real system searches stored claims and file hashes;
never ask the customer to supply the duplicate indicator directly.

## Calculated by backend (do not ask user to enter)

`warranty_expiry_date` uses calendar-month addition; `product_age_days` and
`remaining_warranty_days` compare claim and purchase/expiry dates. The
`fault_claim_gap_days` and `repair_purchase_gap_days` preserve chronology.
`serial_match` compares the two serials. `duplicate_indicator` compares
invoice evidence with prior claims. `contradiction_indicator` checks whether
fault/repair dates are outside the purchase-to-claim period. Recalculate these
on the server even if a client sends values.

## Training-only fields

`claim_class` is the known target; `scenario_reason` explains how the
synthetic record was generated; `claim_id` is an identifier. Never include
these three fields as model predictors or draw them on training cards.

## Decision boundary in the prototype

An expired warranty, excluded damage or unauthorized repair is an illustrative
Invalid condition. Missing receipt/documents, serial mismatch, duplicate or
chronology conflict routes to Manual Review. Other coherent, covered claims
are Valid. In the app, independently run the policy rules and preserve both
model outputs; a model's Valid guess must not override a hard exclusion or
unresolved evidence.

## Limits before real-world use

Real warranties vary by manufacturer, product and jurisdiction. OCR needs user
confirmation, policy files need authoritative product terms, and real labeled
claims need consent and proper evaluation. The generated dataset proves a
reproducible competition pipeline, not production accuracy.
