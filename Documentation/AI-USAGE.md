AI USAGE DECLARATION
NextWave AI & ML


1. Purpose
This document records the use of artificial-intelligence tools during development and documentation of the AssureX Claim Engine. It distinguishes development/documentation assistance from the AI/ML components that form part of the application.

2. AI Tool Used for Development Support
**Tool:** ChatGPT

ChatGPT was used as a development and documentation assistant for:

• Understanding project requirements.
• Reviewing and explaining the existing project structure.
• Organising technical documentation.
• Explaining existing machine-learning components.
• Explaining dataset generation and splitting.
• Explaining the Flask backend, SQLite database, OCR, Google Teachable Machine model, and React/Vite structure.
• Preparing installation, troubleshooting, and limitations documentation.
The supplied source code was treated as the source of truth when preparing documentation.

3. Type of Assistance Requested
Assistance included analysis of project files, explanation of Python modules, machine-learning pipeline documentation, dataset-generation documentation, backend/API explanation, OCR explanation, GTM model explanation, frontend structure explanation, installation guidance, troubleshooting guidance, and identification of documented limitations.

4. Files and Modules Covered
The documentation covers existing modules including:

• `01_generate_dataset.py`
• `02_train_python_model.py`
• `CLAIM_FIELDS.md`
• `backend/app.py`
• `backend/card_service.py`
• `backend/claim_logic.py`
• `backend/database.py`
• `backend/policies.py`
• `backend/receipt_ocr.py`
• `backend/create_member.py`
• `backend/check_invoices.py`
• `backend/try_claim.py`
• `backend/try_receipt.py`
• `backend/try_review.py`
• `backend/gtm_model/`
• `frontend/`
• `output/`
5. Source-Code Modification
AI assistance for documentation does not mean ChatGPT is credited as the author of the existing application source code. The implementation was reviewed and documented from the supplied project archive.

6. AI/ML Components Actually Used by AssureX
The application itself contains machine-learning functionality.

Python Machine-Learning Model
The training script compares:

• Logistic Regression
• Random Forest
• Extra Trees
The selected model is saved as:

`output/assurex_python_model.joblib`

Google Teachable Machine
The exported model is located in:

`backend/gtm_model/`

It contains:

• `model.json`
• `metadata.json`
• `weights.bin`
The model produces probabilities for:

• Valid Claim
• Invalid Claim
• Manual Claim
`Manual Claim` is mapped to `Manual Review`.

Warranty Rule Engine
The deterministic rule engine checks conditions including warranty expiry, excluded damage, unauthorised repairs, missing receipt/documents, serial-number mismatch, duplicate invoice, and contradictory dates.

7. Verification Responsibility
The project team remains responsible for understanding the source code, verifying documented behaviour, testing the application, correcting inaccuracies, and confirming that documented functionality actually exists.

8. Testing
The supplied project contains manual helper scripts for claim submission, receipt OCR, manual review, and invoice checking. It does not contain a dedicated automated `tests/` directory in the supplied archive.

9. Final Decision Generation
The final claim decision is not produced through a generative-AI API. The implemented application uses the Python ML model, warranty-rule engine, application logic, and GTM model where applicable.

10. Final Note
The AI assistance described here is primarily documentation and development support. The team remains responsible for the submitted implementation, testing, documentation, and technical understanding.

