TROUBLESHOOTING GUIDE
NextWave AI & ML

1. Python Command Not Found
Try:

`python3 --version`

If available:

`python3 -m venv .venv`

`source .venv/bin/activate`

2. Virtual Environment Will Not Activate
Windows:

`.venv\Scripts\activate`

macOS/Linux:

`source .venv/bin/activate`

Verify that `.venv` exists in the project directory.

3. Missing Python Package
Activate the virtual environment and install the missing package. Examples:

`pip install flask`

`pip install pandas scikit-learn joblib`

`pip install pillow pytesseract pymupdf`

The project currently has no `requirements.txt`.

4. Tesseract Not Found
PyTesseract requires the Tesseract OCR executable. Install Tesseract and verify that the executable is accessible. Update the path in `backend/receipt_ocr.py` if necessary.

5. OCR Works on One Computer but Not Another
The OCR implementation contains a platform-specific Tesseract path. Configure the path for the local operating system.

6. Flask Server Will Not Start
Verify that you are in `backend/`, Python is available, and required dependencies are installed:

`cd backend`

`python app.py`

7. Frontend Cannot Connect to Backend
Start Flask first:

`cd backend`

`python app.py`

Then in another terminal:

`cd frontend`

`npm run dev`

The Vite configuration expects:

`http://127.0.0.1:5000`

8. npm Command Not Found
Install Node.js, then verify:

`node --version`

`npm --version`

Run:

`cd frontend`

`npm install`

`npm run dev`

9. Frontend Dependency Error
Inside `frontend/` run:

`npm install`

then:

`npm run dev`

10. Saved Model Will Not Load
The saved model is:

`output/assurex_python_model.joblib`

A scikit-learn version mismatch may prevent it from loading. Use a compatible version or retrain:

`python 01_generate_dataset.py`

`python 02_train_python_model.py`

11. Dataset File Not Found
Run:

`python 01_generate_dataset.py`

before:

`python 02_train_python_model.py`

12. Training Script Fails
Verify that generated CSV files exist in `output/` and that pandas/scikit-learn are installed.

13. Database Error
Verify that `backend/` is writable and that the SQLite database can be created/accessed:

`backend/assurex.db`

14. Login Failure
Verify that the member account exists and that the supplied credentials are correct. The project includes `backend/create_member.py`.

15. OCR File Rejected
The current OCR implementation supports PNG, JPG/JPEG and PDF input. Unsupported formats should not be submitted.

16. Large Upload
The backend limits uploaded files to 10 MB. PDF processing is also limited to three pages.

17. Incorrect OCR Results
OCR accuracy depends on document quality, lighting, resolution, layout, fonts, and whether text is printed or handwritten. Extracted information should be verified.

18. GTM Model Does Not Load
Verify that these files exist:

• `backend/gtm_model/model.json`
• `backend/gtm_model/metadata.json`
• `backend/gtm_model/weights.bin`
19. GTM Probability Error
The backend expects numeric probabilities between 0 and 1 that approximately sum to 1.

20. Manual Review Does Not Work
Verify authentication, claim existence, eligibility, valid review decision, and required review note. Relevant files include `backend/app.py`, `backend/database.py`, and `backend/try_review.py`.

21. Duplicate Invoice Result
Check whether the invoice number already exists in the database. Duplicate invoices can trigger Manual Review.

22. Date-Related Decision
Check purchase date, fault date, claim date, repair date and warranty expiry date. The backend derives date-based features and checks for contradictory dates.

23. Frontend Page Looks Incomplete
The current React frontend is not a fully completed end-to-end interface. Some pages/routes are scaffolding, so an incomplete page does not necessarily mean the corresponding backend functionality is absent.

24. Troubleshooting Procedure
Before modifying the project:

1. Read the terminal error.

2. Identify the component that produced it.

3. Verify dependencies.

4. Verify expected files exist.

5. Verify the backend is running.

6. Verify the frontend is running.

7. Check configuration.

8. Retry the operation.

Avoid changing several components at once because this makes the original cause harder to identify.