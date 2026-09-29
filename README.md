# AssureX Claim Engine

A competition prototype for warranty claim intake, receipt OCR, Python structured-data scoring, Google Teachable Machine (GTM) claim-card scoring, and human review. Policies and model training records are synthetic examples, not manufacturer warranties or real-world accuracy evidence.

## Start locally on Windows

Open a terminal in this project's root folder:

```powershell
py -m pip install -r requirements.txt
py backend/app.py
```

Use the new `/sign-up` page to create a member, then sign in at `/login`. For an offline CLI alternative, run `py backend/create_member.py`. The database and Flask secret are generated locally and are not shared in the zip or Git repository. Tesseract OCR must also be installed and on PATH to scan images; PDFs with selectable text may work without OCR.

In a **second terminal**:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open Vite's Local URL, usually `http://localhost:5173/`. The project `.npmrc` makes npm use `legacy-peer-deps=true` because the Teachable Machine image helper declares an old TensorFlow.js peer version. This resolves installation, but GTM inference should be checked on your machine with an actual claim card. Start both Flask and Vite before submitting a claim.

## Page flow

- `/`: public introduction, light/dark mode, Member login.
- `/sign-up`: creates a member with a hashed password in SQLite, then sends them to login.
- `/login`: verifies a member through Flask.
- `/dashboard`: real claim counts, recent claims, quick actions.
- `/new-claim`: selected demo policy, dates, receipt OCR, confirmed invoice and serial fields; submits to Flask and tries GTM scoring on the generated claim card.
- `/claims/:id`: saved result, explanations, model scores, and review note.
- `/claim-history`: search, filter, sort, pagination, result links.
- `/review-dashboard`: pending/reviewed cases and Approve/Reject with a required note.
- `/reports`: saved claim counts, model agreement where GTM was scored, date filter, export CSV, and optional local import of the 30 unseen-claim comparison.

Every member page shares the signed-in header. The Flask API checks sessions for protected claim, OCR, and review routes. The public `/api/policies` endpoint remains accessible.

## Evaluation CSV format

The Reports import expects exactly **30 distinct unseen claims**, 10 in each true class. Header names are:

```csv
claim_id,true_class,python_prediction,gtm_prediction
AX-00123,Valid Claim,Valid Claim,Valid Claim
```

Allowed class values: `Valid Claim`, `Invalid Claim`, `Manual Review`. Complete the remaining 29 real evaluation rows before importing. Importing displays computed comparison counts in this browser session; it does not train the models or save the evaluation on the server.

## Team integration

The supplied output model and GTM export are included. Python model was serialized with scikit-learn 1.9.0; install the matching version to avoid loading-version warnings. Do not commit `.secret_key`, local SQLite databases, real customer receipts, `frontend/node_modules`, or generated cards.

If replacing an existing project folder with this zip, retain your local `backend/assurex.db` and `backend/.secret_key` files. Those contain your local member accounts and Flask session key. Copy updated source files into your current project rather than replacing your working folder wholesale.

The prototype has public member registration and every member can use the review dashboard. For real use, restrict reviewer permissions and close public reviewer signup.

## Private accounts and existing claims

Each member has their own claim history, dashboard, reports, reviews, GTM results and claim cards. The server checks ownership of every claim URL. The Profile page lets a signed-in member change their display name and username after entering their current password, or change their password and sign in again. Sign-up now asks for a display name.

The first launch after this update adds account and ownership columns to the existing SQLite database automatically. Claims made before account ownership was recorded are intentionally hidden, since the database cannot infer who submitted them. To restore **only claims you know belong to your account**, keep your original `backend/assurex.db`, sign in to your account, and run from the AssureX project root:

```powershell
python backend/assign_legacy_claims.py Abass 1 2 3 4
```

Replace `Abass` and the IDs with the actual username and verified claim IDs; read the invoice numbers shown and type `ASSIGN` to confirm. Do this separately for each account's own older claims. Do not upload `backend/assurex.db` or `backend/.secret_key` to GitHub.
