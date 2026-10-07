INSTALLATION AND EXECUTION GUIDE
NextWave AI & ML

1. Overview
This document explains how to install and run the AssureX Claim Engine locally. The supplied project contains a Python backend, Flask API, SQLite database, machine-learning model, synthetic dataset generator, model-training script, receipt OCR, Google Teachable Machine model, and React/Vite frontend.

2. Requirements
Required software:

• Python
• Node.js and npm
• Tesseract OCR
Check Python:

`python --version`

or:

`python3 --version`

Check Node.js:

`node --version`

Check npm:

`npm --version`

3. Create a Python Virtual Environment
From the project root:

`python -m venv .venv`

Windows:

`.venv\Scripts\activate`

macOS/Linux:

`python3 -m venv .venv`

`source .venv/bin/activate`

4. Install Python Dependencies
The current project does not supply `requirements.txt`. Install the packages required by the project imports. These include:

• Flask
• pandas
• scikit-learn
• joblib
• Pillow
• PyTesseract
• PyMuPDF
• requests
• Werkzeug
Keep scikit-learn compatible with the supplied saved model:

`output/assurex_python_model.joblib`

5. Tesseract OCR
PyTesseract is a Python interface to the Tesseract executable. Tesseract must also be installed on the operating system.

The current OCR module contains a platform-specific executable path in:

`backend/receipt_ocr.py`

Update that path when running on another operating system.

6. Generate the Dataset
From the project root:

`python 01_generate_dataset.py`

Expected generated files include:

• `output/all_claims.csv`
• `output/train.csv`
• `output/validation.csv`
• `output/test.csv`
• `output/prior_claims.csv`
7. Train the Machine-Learning Model
Run:

`python 02_train_python_model.py`

The script loads the generated data, prepares features, trains Logistic Regression, Random Forest and Extra Trees, compares validation macro-F1, selects the best model, evaluates it, and saves the selected model.

Saved model:

`output/assurex_python_model.joblib`

8. Start the Flask Backend
From the project root:

`cd backend`

`python app.py`

The backend listens on:

`http://127.0.0.1:5000`

9. Run the Frontend
Open a second terminal:

`cd frontend`

`npm install`

`npm run dev`

Vite will display the local development address.

10. Frontend/Backend Connection
The Vite configuration proxies backend requests to:

`http://127.0.0.1:5000`

The Flask backend must therefore be running for API-dependent frontend functionality.

11. Database
The backend uses SQLite. The database file is:

`backend/assurex.db`

The backend initialises the required database tables.

12. Helper Scripts
The supplied project includes:

• `backend/create_member.py` — member-account creation workflow.
• `backend/try_claim.py` — sample claim-analysis request.
• `backend/try_receipt.py` — receipt OCR test.
• `backend/try_review.py` — manual-review workflow test.
• `backend/check_invoices.py` — invoice inspection utility.
A sample receipt is included as:

`AssureX_Sample_Receipt.png`

13. Google Teachable Machine
The exported GTM model is already included in:

`backend/gtm_model/`

Files:

• `model.json`
• `metadata.json`
• `weights.bin`
14. Recommended Startup Order
1. `python 01_generate_dataset.py`

2. `python 02_train_python_model.py` (only when the model needs regeneration)

3. `cd backend && python app.py`

4. In a second terminal: `cd frontend && npm install && npm run dev`

15. Important Note
The supplied archive does not contain `requirements.txt` and does not contain deployment configuration. This guide therefore describes local execution rather than cloud/production deployment.

