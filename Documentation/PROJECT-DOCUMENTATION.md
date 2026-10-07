Python Dataset and Model Scripts

01_generate_dataset.py

Generates the synthetic warranty-claim dataset.

It also contains the logic for generating Claim Summary Cards.

02_train_python_model.py

Trains and compares three machine-learning classification algorithms:

- Logistic Regression
- Random Forest
- Extra Trees

The best model based on validation macro F1 is selected and saved.

⸻

3. BACKEND

The backend is implemented using Flask.

Location:

backend/

The backend contains the main application logic, database operations, warranty policies, OCR processing, Claim Summary Card generation, and GTM integration.

⸻

backend/app.py

This is the main Flask application.

It provides the API endpoints used by the system.

The application:

- Starts the Flask server
- Creates the SQLite database tables
- Handles claim analysis
- Handles member login
- Handles logout
- Retrieves claims
- Handles manual review
- Processes uploaded documents
- Provides warranty policies
- Generates Claim Summary Cards
- Receives GTM predictions
- Serves the GTM model files

The Flask application uses a local secret key stored outside the public source code.

The maximum upload size is configured as 10 MB.

⸻

4. CLAIM ANALYSIS

The main claim-analysis endpoint is:

POST /api/claims/analyze

The endpoint receives a JSON warranty claim.

The backend obtains the selected warranty policy and sets the warranty duration.

It then checks whether the invoice has previously been used.

The claim is passed to the claim-analysis logic.

The result contains information such as:

- Python prediction
- Python probabilities
- Final recommendation
- Reasons for the recommendation
- Calculated warranty facts
- Policy information
- Claim ID

⸻

5. CLAIM LOGIC

File:

backend/claim_logic.py

This module performs the main claim-analysis logic.

It loads the saved Python machine-learning model and prepares the claim data for prediction.

The module calculates information that should not be entered manually by the user.

Examples include:

- Warranty expiry date
- Remaining warranty days
- Product age
- Fault-to-claim interval
- Repair-to-purchase interval
- Serial-number match
- Duplicate indicator
- Date contradiction indicator

The model then produces probabilities for:

Invalid Claim
Manual Review
Valid Claim

The rule engine independently evaluates the claim.

⸻

6. WARRANTY RULES

The prototype uses the following sample policies:

Policy Warranty
Basic Cover 12 months
Standard Cover 24 months
Extended Cover 36 months

These policies are defined in:

backend/policies.py

The policy IDs are:

basic
standard
extended

⸻

7. RULE-BASED DECISION LOGIC

The rule engine checks several conditions.

Expired Warranty

If the warranty has expired before the claim date:

Invalid Claim

Excluded Damage

If the damage type is not covered:

Invalid Claim

The prototype currently treats damage types such as:

Impact
Liquid

as excluded examples.

Unauthorized Repair

If the product has been repaired and the repair was not authorized:

Invalid Claim

Missing Receipt

If the receipt is missing:

Manual Review

Missing Documents

If supporting documentation is missing:

Manual Review

Serial Mismatch

If the registered serial number and evidence serial number do not match:

Manual Review

Duplicate Invoice

If the invoice appears in a previous claim:

Manual Review

Contradictory Dates

The system checks whether dates occur in an impossible or contradictory sequence.

For example, a fault date occurring after the claim date can trigger:

Manual Review

⸻

8. MACHINE LEARNING MODEL

The Python model is implemented using Scikit-learn.

Three algorithms are trained:

Logistic Regression

Provides a linear classification approach.

Random Forest

Uses multiple decision trees and combines their predictions.

Extra Trees

Uses randomized decision trees to produce an ensemble classifier.

The validation macro-F1 results stored in the project are:

Logistic Regression: 0.915371
Random Forest: 0.928686
Extra Trees: 0.928686

The selected model is:

Random Forest

The saved model is:

output/assurex_python_model.joblib

⸻

9. MACHINE LEARNING FEATURES

The model uses numerical and categorical features.

Numerical Features

The numerical features include:

warranty_months
product_age_days
remaining_warranty_days
fault_claim_gap_days
repair_purchase_gap_days
receipt_present
serial_match
repair_count
authorized_repair
missing_document_count
duplicate_indicator
contradiction_indicator

Categorical Features

The categorical features include:

product_category
fault_type
damage_type

The model does not use the claim ID or the known target class as prediction features.

⸻

10. DATA PREPROCESSING

The machine-learning pipeline contains preprocessing for both numerical and categorical data.

Numerical preprocessing

Missing numerical values are handled using median imputation.

Numerical values are then standardized using:

StandardScaler

Categorical preprocessing

Missing categorical values are handled using the most frequent value.

Categorical values are converted using:

OneHotEncoder

Unknown categories are ignored during encoding.

The preprocessing and classifier are stored together in the saved machine-learning pipeline.

⸻

11. DATASET GENERATION

The project contains a synthetic dataset generator:

01_generate_dataset.py

The generator uses a fixed random seed:

42

and a fixed reference date:

2026-09-23

This allows the generated dataset to be reproduced consistently.

The dataset contains:

1,500 total claims

with:

500 Valid Claim
500 Invalid Claim
500 Manual Review

⸻

12. DATASET SPLIT

The generated dataset is separated into:

Training: 1,050 claims
Validation: 225 claims
Testing: 225 claims

The split is stratified so that the classes remain balanced.

Each claim receives a unique ID such as:

AX-00001
AX-00002
AX-00003

The generated files include:

output/all_claims.csv
output/train.csv
output/validation.csv
output/test.csv
output/prior_claims.csv

⸻

13. CLAIM SCENARIOS

The dataset generator creates several synthetic claim scenarios.

Valid Claim

Examples include:

covered_fault
authorized_repair

Invalid Claim

Examples include:

expired
excluded_damage
unauthorized_repair

Manual Review

Examples include:

missing_proof
serial_mismatch
duplicate
fault_after_claim
repair_before_purchase

The generated label is checked against the same illustrative rule logic used by the application.

⸻

14. CLAIM SUMMARY CARDS

The dataset generator contains functionality for creating Claim Summary Cards.

The cards provide a visual representation of claim facts.

The card displays information such as:

- Product category
- Fault type
- Product age
- Warranty duration
- Warranty status
- Receipt status
- Serial status
- Damage
- Repair history
- Document status
- Duplicate status
- Date consistency
- Purchase date
- Claim date
- Fault date
- Repair date
- Warranty expiry date

The Claim Summary Card does not display the known claim class.

This allows the card to be used as the input representation for the GTM image model.

⸻

15. GOOGLE TEACHABLE MACHINE

The project contains an exported Google Teachable Machine image model.

Location:

backend/gtm_model/

The model contains:

model.json
metadata.json
weights.bin

The model metadata defines three classes:

Valid Claim
Invalid Claim
Manual Claim

The application maps the GTM Manual Claim concept to the application’s:

Manual Review

class.

The model uses a 224 × 224 image input.

⸻

16. GTM MODEL INTEGRATION

The backend provides a GTM testing page:

GET /gtm

The GTM model files are served through:

/gtm-model/<filename>

A saved claim can also be converted into a Claim Summary Card through:

GET /api/claims/<claim_id>/card

The generated card can then be supplied to the GTM model.

After prediction, the GTM probabilities can be submitted through:

POST /api/claims/<claim_id>/gtm-result

The backend validates that the three probabilities are:

- Numeric
- Between 0 and 1
- Approximately sum to 1

The stored GTM information includes:

- GTM probabilities
- GTM prediction
- GTM model version
- Whether the Python and GTM predictions disagree

⸻

17. OPTICAL CHARACTER RECOGNITION

The project contains receipt/document OCR functionality.

File:

backend/receipt_ocr.py

The OCR system uses:

- PyTesseract
- Tesseract OCR
- Pillow
- PyMuPDF

Supported files are:

PNG
JPG
JPEG
PDF

For images, Tesseract extracts the text directly.

For PDFs, the system first attempts to read embedded PDF text.

If the PDF page does not contain usable text, the page is rendered as an image and OCR is applied.

PDFs are limited to a maximum of three pages.

⸻

18. OCR FIELD EXTRACTION

The OCR system attempts to suggest:

invoice_number
evidence_serial
possible_purchase_date

The system does not automatically treat these values as confirmed.

The API response explicitly indicates that the extracted information requires user confirmation.

This prevents OCR errors from automatically becoming trusted claim information.

⸻

19. DATABASE

The project uses SQLite.

Database module:

backend/database.py

Database file:

backend/assurex.db

The application creates the database tables automatically.

⸻

20. MEMBERS TABLE

The members table stores:

id
username
password_hash

Passwords are stored as password hashes.

The backend uses Werkzeug password-hashing functions to verify login credentials.

⸻

21. CLAIMS TABLE

The claims table stores:

id
invoice_number
claim_data
analysis
review_status
reviewer_id
review_note
created_at

The claim and analysis information is stored as JSON within the SQLite database.

The database also supports invoice lookup for duplicate detection.

⸻

22. AUTHENTICATION

The backend provides member authentication.

Login endpoint:

POST /api/auth/login

Logout endpoint:

POST /api/auth/logout

A successful login creates a Flask session containing the member ID and username.

Protected claim operations require an authenticated session.

⸻

23. MANUAL REVIEW

Claims classified as:

Manual Review

are stored with a pending review status.

A logged-in member can view saved claims.

A Manual Review claim can be approved or rejected.

The reviewer must provide:

decision
note

The possible review decisions are:

Approved
Rejected

The database stores:

- Review status
- Reviewer ID
- Review note

⸻

24. DUPLICATE INVOICE DETECTION

The database checks whether an invoice number has previously been submitted.

The relevant function is:

invoice_was_used()

If the same invoice is found in a previous claim, the claim receives a duplicate indicator.

The duplicate condition is then considered by the claim-analysis rules.

⸻

25. FRONTEND

The project contains a React frontend using Vite.

Main technologies include:

React
React DOM
React Router
Vite
TensorFlow.js
Teachable Machine Image

The frontend package also includes ESLint configuration.

The Vite development server proxies:

/api

and:

/gtm-model

to the Flask backend running on:

http://127.0.0.1:5000

⸻

26. FRONTEND ROUTES

The React application defines the following routes:

/

Home

/login

Member Login

/dashboard

Dashboard

/claims/new

New Claim

/claims/:id

Claim Result

/claims

Claim History

/review

Review Dashboard

/reports

Reports

The frontend currently contains the route/page structure and reusable components.

⸻

27. SAMPLE CLAIM TESTING

The backend contains a sample claim script:

backend/try_claim.py

It sends a sample claim to:

POST /api/claims/analyze

The sample includes information such as:

- Phone product
- Battery fault
- Purchase date
- Fault date
- Warranty duration
- Serial numbers
- Invoice number
- Receipt availability

The response is printed as formatted JSON.

⸻

28. SAMPLE OCR TESTING

The project also contains:

backend/try_receipt.py

This script sends a sample receipt to:

POST /api/documents/scan

and prints the OCR response.

A sample receipt image is included in the project:

AssureX_Sample_Receipt.png

⸻

29. SAMPLE REVIEW TESTING

The project contains:

backend/try_review.py

This script demonstrates:

1. Member login
2. Retrieving claims
3. Selecting a Manual Review claim
4. Entering a review decision
5. Adding a review note
6. Reading the saved claim again

⸻

30. INVOICE CHECKING

The project contains:

backend/check_invoices.py

which is used to inspect invoice information stored in the system.

⸻

31. PROJECT OUTPUT FILES

The output/ directory contains the generated datasets and trained model.

output/
├── all_claims.csv
├── train.csv
├── validation.csv
├── test.csv
├── prior_claims.csv
├── training_scores.json
└── assurex_python_model.joblib

The training-score file records the validation macro-F1 values and the selected model.

⸻

32. MODEL EVALUATION RESULT

The stored training results show:

Model Validation Macro F1
Logistic Regression 0.915371
Random Forest 0.928686
Extra Trees 0.928686

The selected model is:

Random Forest

The saved model is:

output/assurex_python_model.joblib

The project also contains a held-out test dataset:

output/test.csv

containing 225 claims.

The test dataset contains 75 claims from each class.

⸻

33. INSTALLATION REQUIREMENTS

The project requires:

- Python
- Node.js
- Tesseract OCR

The Python backend uses packages corresponding to its imports, including:

- Flask
- Pandas
- Scikit-learn
- Joblib
- Pillow
- PyTesseract
- PyMuPDF
- Requests
- Werkzeug

The frontend uses the packages listed in:

frontend/package.json

⸻

34. RUNNING THE BACKEND

From the main project directory:

python backend/app.py

The Flask backend runs on:

http://127.0.0.1:5000

The backend can be checked using:

http://127.0.0.1:5000/

The warranty policies can be checked using:

http://127.0.0.1:5000/api/policies

⸻

35. RUNNING THE FRONTEND

Open another terminal.

Enter the frontend directory:

cd frontend

Install the dependencies:

npm install

Start Vite:

npm run dev

Vite will display the local development URL.

The frontend communicates with the Flask backend through the configured Vite proxy.

⸻

36. GENERATING THE DATASET

From the project root:

python 01_generate_dataset.py

The script generates:

all_claims.csv
train.csv
validation.csv
test.csv
prior_claims.csv

It also contains the Claim Summary Card generation logic.

⸻

37. TRAINING THE PYTHON MODEL

After generating the dataset:

python 02_train_python_model.py

The script:

1. Loads the training dataset.
2. Loads the validation dataset.
3. Loads the testing dataset.
4. Prepares the numerical features.
5. Prepares the categorical features.
6. Builds preprocessing pipelines.
7. Trains Logistic Regression.
8. Trains Random Forest.
9. Trains Extra Trees.
10. Compares validation macro-F1.
11. Selects the best model.
12. Evaluates the selected model on the test set.
13. Saves the trained model.
14. Saves the training scores.

⸻

38. PROJECT WORKFLOW

The main claim-processing workflow is:

Customer/Member
|
v
Claim Information
|
v
Flask API
|
+--------------------+
| |
v v
Python ML Model Warranty Rules
| |
v v
Python Prediction Rule Evaluation
| |
+---------+----------+
|
v
Final Recommendation
|
+--------+--------+
| | |
v v v
Valid Invalid Manual Review
|
v
Human Review

The GTM path is:

Saved Claim
|
v
Claim Summary Card
|
v
GTM Image Model
|
v
GTM Probabilities
|
v
Stored GTM Result
|
v
Python/GTM Disagreement Check

⸻

39. SECURITY FEATURES IMPLEMENTED

The current backend includes several security-related mechanisms.

Password hashing

Member passwords are stored as hashes rather than plaintext passwords.

Session authentication

Flask sessions are used to protect claim-related routes.

HTTPOnly session cookie

The session cookie is configured with HTTPOnly.

SameSite cookie setting

The session cookie uses:

SameSite=Lax

Upload size restriction

Uploaded files are limited to 10 MB.

File type validation

The OCR endpoint only accepts:

PNG
JPG
JPEG
PDF

Probability validation

GTM probabilities are checked to ensure they are numeric values between 0 and 1 and approximately sum to 1.

Server-side calculations

Important claim-derived values are calculated by the backend instead of trusting client-provided calculated values.

⸻

40. PROJECT LIMITATIONS

The current implementation uses synthetic warranty data and synthetic warranty rules.

The model therefore demonstrates the project pipeline but does not establish real-world warranty-claim accuracy.

OCR results require user confirmation.

The frontend contains the application’s route structure and components, while some page/component implementations are still minimal.

The current database uses SQLite.

The warranty policies are defined directly in the Python policy module.

The system should therefore be treated as a prototype implementation.

⸻

41. PROJECT FILE STRUCTURE

AiProject/
│
├── 01_generate_dataset.py
├── 02_train_python_model.py
├── CLAIM_FIELDS.md
├── README.txt
├── AssureX_Sample_Receipt.png
│
├── backend/
│ ├── app.py
│ ├── card_service.py
│ ├── check_invoices.py
│ ├── claim_logic.py
│ ├── create_member.py
│ ├── database.py
│ ├── policies.py
│ ├── receipt_ocr.py
│ ├── try_claim.py
│ ├── try_receipt.py
│ ├── try_review.py
│ ├── gtm_test.html
│ │
│ └── gtm_model/
│ ├── model.json
│ ├── metadata.json
│ └── weights.bin
│
├── frontend/
│ ├── package.json
│ ├── package-lock.json
│ ├── vite.config.js
│ └── src/
│ ├── App.jsx
│ ├── main.jsx
│ ├── api/
│ ├── components/
│ ├── pages/
│ └── styles/
│
└── output/
├── all_claims.csv
├── train.csv
├── validation.csv
├── test.csv
├── prior_claims.csv
├── training_scores.json
└── assurex_python_model.joblib

⸻

42. TEAM GIT WORKFLOW

The project repository contains Git version-control information.

The existing project README defines the following workflow:

Before starting work:

git pull

After making changes:

git add .
git commit -m "Describe changes"
git push

Team members should communicate which files they are editing to reduce conflicts.

Sensitive files such as passwords, the backend secret key, the SQLite database, node_modules, and real customer receipts should not be committed.

⸻

43. PROJECT DATA CONTRACT

The file:

CLAIM_FIELDS.md

defines the claim data contract used by the prototype.

It distinguishes between:

User-entered or extracted information

Examples:

product_category
fault_type
damage_type
purchase_date
warranty_months
fault_date
claim_date
repair_count
repair_date
authorized_repair
receipt_present
missing_document_count
registered_serial
evidence_serial
invoice_number

Backend-calculated information

Examples:

warranty_expiry_date
product_age_days
remaining_warranty_days
fault_claim_gap_days
repair_purchase_gap_days
serial_match
duplicate_indicator
contradiction_indicator

Training-only information

Examples:

claim_class
scenario_reason
claim_id

The training target is not used as a model input.

⸻

44. SUMMARY

AssureX Claim Engine combines:

- Flask backend
- React frontend
- SQLite database
- Synthetic warranty dataset generation
- Scikit-learn classification
- Random Forest model
- Warranty rule engine
- OCR
- Google Teachable Machine
- Claim Summary Card generation
- Member authentication
- Manual review
- Duplicate invoice detection

The system provides an end-to-end prototype for analysing warranty claims using both machine-learning predictions and deterministic warranty rules.

The Python model operates on structured claim information, while the GTM model operates on the visual Claim Summary Card representation.

The project is designed around the principle that machine-learning predictions should be accompanied by explicit rule-based checks rather than being treated as the sole source of the claim decision.

---

# FILE 2 — `AI_USAGE.md`

This needs to be handled differently.
The SRS says the AI declaration should contain the **tool name, purpose, affected modules, student modifications, and testing performed by the students**. [oai_citation:2‡AssureX Claim Engine-NextWave AI and ML_SRS.pdf](sediment://file_00000000762c8246b22b985d6438fd49)
I will **not invent AI usage for your team**. The ZIP does not contain an `AI_USAGE.md`, and I do not have evidence that ChatGPT or another AI generated the existing source code.
For the work we are doing in this conversation, the truthful declaration is documentation assistance only:

````markdown
# AI USAGE DECLARATION

## Project

AssureX Claim Engine

## Team

## NextWave AI & ML

# 1. AI TOOL USED

### Tool

ChatGPT

### Purpose of Use

ChatGPT was used to assist with project documentation.
The assistance included:

- Reviewing the project structure
- Reading and interpreting the project requirements
- Organizing technical information into documentation
- Explaining existing project modules
- Describing existing backend functionality
- Describing the existing machine-learning pipeline
- Describing the existing dataset-generation process
- Describing the existing OCR functionality
- Describing the existing Google Teachable Machine integration
- Preparing README documentation
- Preparing technical documentation based on the existing source code

---

# 2. MODULES AFFECTED

The AI assistance was used for documentation covering the existing project modules, including:

````text
01_generate_dataset.py
02_train_python_model.py
backend/app.py
backend/claim_logic.py
backend/database.py
backend/policies.py
backend/receipt_ocr.py
backend/card_service.py
backend/gtm_model/
frontend/
output/
CLAIM_FIELDS.md

The documentation was based on the existing project files.

⸻

3. SOURCE-CODE MODIFICATION

The documentation assistance does not constitute a claim that ChatGPT created the existing project source code.

The existing source code was reviewed and documented based on the project archive.

Any source-code changes made by team members remain the responsibility of the team members who made and reviewed those changes.

⸻

4. STUDENT REVIEW

The project documentation was reviewed against the existing project files.

Only functionality found in the supplied project was documented as implemented functionality.

Project requirements that were not represented by existing implementation were not presented as completed functionality.

⸻

5. TESTING AND VERIFICATION

The project files were inspected to verify the documented functionality.

The following project areas were reviewed:

* Dataset generation
* Dataset splitting
* Dataset labels
* Machine-learning training
* Model selection
* Model output
* Flask API
* Warranty rules
* SQLite database
* Authentication
* Manual review
* OCR processing
* GTM model files
* Claim Summary Card generation
* React routes
* Vite configuration
* Project output files

The documentation describes the implementation found in the project rather than assuming that every SRS requirement has been implemented.

⸻

6. AI CLASSIFICATION DISCLAIMER

The warranty claim classification described by this project is generated by the implemented Python machine-learning model, warranty-rule logic, and Google Teachable Machine integration.

Generative AI is not used as the claim-classification engine.

The AI assistance described in this file concerns documentation and development support.

⸻

7. TEAM RESPONSIBILITY

All team members remain responsible for understanding the source code, reviewing the project implementation, testing the application, and being able to explain the modules they submit.

AI-generated explanations are not a substitute for technical understanding of the project.

That is deliberately conservative. It does **not** falsely say that ChatGPT wrote `claim_logic.py`, trained the Random Forest, created the GTM model, or built the frontend.
---
# FILE 3 — `documentation/PROJECT_DOCUMENTATION.md`
For the actual documentation folder, I would use a **technical implementation document**, separate from the README.
The README explains how someone uses the repository. The project documentation explains how the implemented system works.
The important difference is that this version contains **only things actually present in the ZIP**.
```markdown
# ASSUREX CLAIM ENGINE
# PROJECT DOCUMENTATION
## NextWave AI & ML
---
# 1. INTRODUCTION
AssureX Claim Engine is a prototype AI-assisted warranty claim analysis application.
The application combines a Python machine-learning classification model with deterministic warranty rules to analyse product warranty claims.
It also includes:
- Receipt OCR
- SQLite database storage
- Member authentication
- Manual claim review
- Duplicate invoice detection
- Google Teachable Machine integration
- Claim Summary Card generation
- React/Vite frontend structure
The application classifies claims into:
- Valid Claim
- Invalid Claim
- Manual Review
---
# 2. PROJECT PURPOSE
The purpose of AssureX is to demonstrate how warranty claim information can be processed automatically using machine learning and rule-based validation.
The machine-learning model analyses structured claim features.
The rule engine independently checks warranty and evidence conditions.
The two approaches therefore operate as complementary parts of the claim-analysis process.
---
# 3. APPLICATION ARCHITECTURE
The implemented architecture consists of:
```text
React / Vite Frontend
          |
          v
       Flask API
          |
    +-----+-----+
    |           |
    v           v
Python ML    Rule Engine
    |           |
    +-----+-----+
          |
          v
      SQLite DB
          |
          v
    Saved Claim

The GTM component provides an additional image-analysis path:

Saved Claim
     |
     v
Claim Summary Card
     |
     v
GTM Image Model
     |
     v
GTM Probabilities
     |
     v
Stored GTM Result

⸻

4. BACKEND MODULES

4.1 Flask Application

File:

backend/app.py

Responsibilities:

* Flask application startup
* API routing
* Authentication
* Claim analysis
* Claim retrieval
* Manual review
* OCR endpoint
* Policy endpoint
* Claim-card endpoint
* GTM-result endpoint
* GTM model serving

⸻

4.2 Claim Logic

File:

backend/claim_logic.py

Responsibilities:

* Loading the trained model
* Preparing model features
* Calculating derived claim facts
* Generating Python probabilities
* Generating Python prediction
* Applying warranty rules
* Producing final recommendation

⸻

4.3 Database

File:

backend/database.py

Technology:

SQLite

Responsibilities:

* Database connection
* Table creation
* Member lookup
* Claim storage
* Claim retrieval
* Invoice lookup
* Review storage
* GTM-result storage

⸻

4.4 Warranty Policies

File:

backend/policies.py

Implemented policies:

Basic Cover    = 12 months
Standard Cover = 24 months
Extended Cover = 36 months

⸻

4.5 OCR

File:

backend/receipt_ocr.py

Technologies:

* Tesseract
* PyTesseract
* Pillow
* PyMuPDF

Supported formats:

PNG
JPG
JPEG
PDF

Extracted suggestions:

Invoice number
Serial number
Purchase date

⸻

4.6 Claim Summary Card

File:

backend/card_service.py

The service reconstructs a saved claim and generates a visual Claim Summary Card using the same renderer used by the dataset generator.

The card contains claim facts rather than the known class label.

⸻

4.7 Google Teachable Machine

Directory:

backend/gtm_model/

Files:

model.json
metadata.json
weights.bin

The model defines three image classes.

⸻

5. DATASET GENERATION

File:

01_generate_dataset.py

The generator creates synthetic warranty claims.

The random generator uses seed:

42

The reference date is:

2026-09-23

The generated dataset contains 1,500 records.

Class distribution:

Valid Claim     500
Invalid Claim   500
Manual Review   500

⸻

6. DATASET SPLIT

The dataset is divided into:

Training      1050
Validation     225
Testing        225

The splits are stratified.

Claim IDs are unique and follow the format:

AX-xxxxx

⸻

7. DATASET SCENARIOS

The generator contains scenarios representing:

Valid Claims

covered_fault
authorized_repair

Invalid Claims

expired
excluded_damage
unauthorized_repair

Manual Review

missing_proof
serial_mismatch
duplicate
fault_after_claim
repair_before_purchase

⸻

8. DATA DERIVATION

The backend calculates several values from the original claim data.

These include:

warranty_expiry_date
product_age_days
remaining_warranty_days
fault_claim_gap_days
repair_purchase_gap_days
serial_match
duplicate_indicator
contradiction_indicator

The calculations are repeated by the backend rather than trusting calculated values supplied by a client.

⸻

9. PYTHON MACHINE LEARNING PIPELINE

File:

02_train_python_model.py

The model pipeline performs:

1. Dataset loading
2. Numerical feature preparation
3. Categorical feature preparation
4. Missing-value handling
5. Numerical scaling
6. Categorical encoding
7. Model training
8. Validation
9. Model selection
10. Test evaluation
11. Model persistence

⸻

10. MODELS TESTED

Three classifiers are trained:

Logistic Regression
Random Forest
Extra Trees

Validation macro-F1:

Logistic Regression: 0.915371
Random Forest:       0.928686
Extra Trees:         0.928686

The selected model is:

Random Forest

⸻

11. SAVED MODEL

The trained model is stored at:

output/assurex_python_model.joblib

The saved object contains the complete preprocessing/model pipeline required for inference.

⸻

12. MODEL FEATURES

Numerical features:

warranty_months
product_age_days
remaining_warranty_days
fault_claim_gap_days
repair_purchase_gap_days
receipt_present
serial_match
repair_count
authorized_repair
missing_document_count
duplicate_indicator
contradiction_indicator

Categorical features:

product_category
fault_type
damage_type

⸻

13. PREPROCESSING

Numerical fields:

Median Imputation
StandardScaler

Categorical fields:

Most-Frequent Imputation
One-Hot Encoding

Unknown categorical values are ignored by the encoder.

⸻

14. RULE ENGINE

The rule engine evaluates:

Warranty expiry
Damage exclusions
Unauthorized repairs
Missing receipt
Missing documents
Serial mismatch
Duplicate invoice
Date contradiction

The final recommendation follows the implemented decision order.

If an invalid condition exists:

Invalid Claim

If no invalid condition exists but unresolved evidence exists:

Manual Review

Otherwise:

Valid Claim

⸻

15. DATABASE DESIGN

The SQLite database contains two main tables.

Members

id
username
password_hash

Claims

id
invoice_number
claim_data
analysis
review_status
reviewer_id
review_note
created_at

Claim data and analysis are stored as JSON.

⸻

16. AUTHENTICATION

The application provides member login.

The login endpoint is:

POST /api/auth/login

The logout endpoint is:

POST /api/auth/logout

The application uses Flask sessions.

Password verification is performed using Werkzeug password hashing.

⸻

17. MANUAL REVIEW

A claim is placed into a pending review state when its final recommendation is:

Manual Review

A logged-in member can review the claim.

The reviewer supplies:

Approved

or:

Rejected

together with a note.

The review information is stored in the database.

⸻

18. OCR PROCESSING

The OCR workflow is:

Receipt Upload
      |
      v
File Type Check
      |
      +---- Image ----> Tesseract
      |
      +---- PDF ------> Embedded Text
                       |
                       +--> OCR if required
      |
      v
Extracted Text
      |
      v
Suggested Fields
      |
      v
User Confirmation

The OCR system intentionally returns the extracted values as suggestions requiring confirmation.

⸻

19. DUPLICATE DETECTION

When a new claim is submitted, the invoice number is checked against existing claims.

If the invoice has already been used, the system sets the duplicate indicator.

This information is then considered by the claim rules.

⸻

20. CLAIM SUMMARY CARD GENERATION

The dataset generator contains the Claim Summary Card renderer.

The card displays:

* Product category
* Fault type
* Product age
* Warranty duration
* Warranty state
* Receipt state
* Serial state
* Damage type
* Repair history
* Document state
* Duplicate state
* Date consistency
* Purchase date
* Claim date
* Fault date
* Repair date
* Warranty expiry

The card does not display the target class.

⸻

21. GOOGLE TEACHABLE MACHINE INTEGRATION

The exported model is loaded in the browser using the project frontend/GTM integration.

The GTM model uses:

224 × 224

image input.

The model metadata contains:

Valid Claim
Invalid Claim
Manual Claim

The backend maps the GTM Manual Claim concept to:

Manual Review

The backend stores GTM probabilities and determines whether the GTM and Python predictions disagree.

⸻

22. API ENDPOINTS

Implemented endpoints include:

GET /

Backend status.

GET /api/policies

Returns the available policies.

POST /api/claims/analyze

Analyses and saves a claim.

POST /api/auth/login

Authenticates a member.

POST /api/auth/logout

Logs out the member.

GET /api/claims

Returns saved claims for an authenticated member.

GET /api/claims/<claim_id>

Returns one saved claim.

POST /api/claims/<claim_id>/review

Processes a Manual Review decision.

POST /api/documents/scan

Processes a receipt/document using OCR.

GET /api/claims/<claim_id>/card

Generates the Claim Summary Card.

POST /api/claims/<claim_id>/gtm-result

Stores GTM prediction information.

GET /gtm

Opens the GTM test page.

GET /gtm-model/<filename>

Serves the exported GTM model files.

⸻

23. FRONTEND STRUCTURE

The frontend uses:

React
React DOM
React Router
Vite
TensorFlow.js
Teachable Machine Image

The application defines routes for:

Home
Login
Dashboard
New Claim
Claim Result
Claim History
Review Dashboard
Reports

The Vite configuration proxies backend API requests to:

http://127.0.0.1:5000

⸻

24. TESTING UTILITIES

The project contains manual helper scripts.

Claim Testing

backend/try_claim.py

Tests claim submission.

OCR Testing

backend/try_receipt.py

Tests receipt/document scanning.

Review Testing

backend/try_review.py

Tests login, claim retrieval and manual review.

Invoice Checking

backend/check_invoices.py

Checks stored invoice information.

⸻

25. SAMPLE RECEIPT

The project contains:

AssureX_Sample_Receipt.png

This file can be used with the OCR functionality.

⸻

26. SECURITY IMPLEMENTATION

The implemented backend includes:

* Password hashing
* Session authentication
* HTTPOnly session cookies
* SameSite cookie configuration
* Maximum upload size
* File-extension validation
* Server-side derived-value calculation
* GTM probability validation
* Protected claim retrieval
* Protected manual-review routes
* Protected Claim Summary Card generation

⸻

27. DATA CONTRACT

The project defines its claim data contract in:

CLAIM_FIELDS.md

The contract identifies:

* User-entered fields
* OCR-derived fields
* Prior-claim information
* Backend-calculated fields
* Training-only fields
* Decision rules

Dates use:

YYYY-MM-DD

⸻

28. CURRENT PROJECT OUTPUT

The output directory contains:

all_claims.csv
train.csv
validation.csv
test.csv
prior_claims.csv
training_scores.json
assurex_python_model.joblib

The training scores file contains the validation results for the three trained models and identifies the selected classifier.

⸻

29. PROJECT EXECUTION

Generate the dataset:

python 01_generate_dataset.py

Train the models:

python 02_train_python_model.py

Start the Flask backend:

python backend/app.py

Install frontend dependencies:

cd frontend
npm install

Run the frontend:

npm run dev

⸻

30. IMPLEMENTED SYSTEM FLOW

The implemented claim workflow is:

Claim Details
      |
      v
Flask API
      |
      v
Policy Selection
      |
      v
Duplicate Check
      |
      v
Claim Feature Calculation
      |
      +--------------------+
      |                    |
      v                    v
Python ML Model       Rule Engine
      |                    |
      v                    v
Prediction             Rule Result
      |                    |
      +---------+----------+
                |
                v
       Final Recommendation
                |
       +--------+--------+
       |        |        |
       v        v        v
     Valid   Invalid   Manual Review
                         |
                         v
                    Human Decision

⸻

31. PROJECT CHARACTERISTICS

The implemented system demonstrates:

* Synthetic dataset generation
* Reproducible machine-learning training
* Three-model algorithm comparison
* Saved Python model
* Structured claim analysis
* Rule-based validation
* OCR processing
* Database persistence
* Authentication
* Manual review
* Duplicate invoice detection
* Claim Summary Card generation
* Google Teachable Machine integration
* React/Vite frontend structure
* Flask REST API

⸻

32. IMPLEMENTATION BOUNDARIES

The project uses synthetic data and illustrative warranty rules.

The Python model therefore operates on the project’s generated claim patterns.

OCR results require confirmation.

The application uses SQLite for persistence.

The frontend contains the defined application routes and components.

33.MEMBERS

STUDENT ID      |      NAME
Student1604472     Abdulrahman Abass
Student1699740     Adesina Oghenegetega Oyibocha
Student1699227     Egbu Deborah Njideka
Student1593568     Ogene Micheal Chinecherem
Student1704211     Kalu Derrick Kess
Student1726266     Henry Chukwuebuka Ezeji
````
````
