import json
import sqlite3
from pathlib import Path


DATABASE_FILE = Path(__file__).resolve().parent / "assurex.db"


def connect():
    """Open the database and let us read rows by column name."""
    db = sqlite3.connect(DATABASE_FILE)
    db.row_factory = sqlite3.Row
    return db


def create_tables():
    """Create the tables if they do not already exist."""
    with connect() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT,
                claim_data TEXT NOT NULL,
                analysis TEXT NOT NULL,
                review_status TEXT,
                reviewer_id INTEGER,
                review_note TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reviewer_id) REFERENCES members(id)
            )
        """)
        member_columns = {row["name"] for row in db.execute("PRAGMA table_info(members)")}
        claim_columns = {row["name"] for row in db.execute("PRAGMA table_info(claims)")}
        if "display_name" not in member_columns:
            db.execute("ALTER TABLE members ADD COLUMN display_name TEXT")
        if "auth_version" not in member_columns:
            db.execute("ALTER TABLE members ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 0")
        if "owner_id" not in claim_columns:
            db.execute("ALTER TABLE claims ADD COLUMN owner_id INTEGER REFERENCES members(id)")
        db.execute("CREATE INDEX IF NOT EXISTS claims_owner_id ON claims(owner_id, id)")


def find_member(username):
    """Find a member for login."""
    with connect() as db:
        row = db.execute(
            "SELECT * FROM members WHERE username = ?",
            (username,),
        ).fetchone()
        return dict(row) if row else None


def create_member(username, password_hash, display_name=None):
    """Store a new member's hashed password; username must be unique."""
    with connect() as db:
        cursor = db.execute(
            "INSERT INTO members (username, password_hash, display_name) VALUES (?, ?, ?)",
            (username, password_hash, display_name or username),
        )
        return cursor.lastrowid


def get_member(member_id):
    with connect() as db:
        row = db.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        return dict(row) if row else None


def update_member(member_id, username, display_name):
    with connect() as db:
        db.execute("UPDATE members SET username = ?, display_name = ? WHERE id = ?",
                   (username, display_name, member_id))


def update_password(member_id, password_hash):
    with connect() as db:
        db.execute("UPDATE members SET password_hash = ?, auth_version = auth_version + 1 WHERE id = ?",
                   (password_hash, member_id))


def invoice_was_used(invoice_number, owner_id):
    """Check previously submitted claims for the same invoice."""
    if not invoice_number:
        return False

    with connect() as db:
        row = db.execute(
            "SELECT id FROM claims WHERE invoice_number = ? AND owner_id = ? LIMIT 1",
            (invoice_number, owner_id),
        ).fetchone()
        return row is not None


def save_claim(claim, analysis, owner_id):
    """Store the submitted claim and its AI/rule results."""
    with connect() as db:
        cursor = db.execute(
            """
            INSERT INTO claims
                (invoice_number, claim_data, analysis, review_status, owner_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                claim.get("invoice_number", ""),
                json.dumps(claim),
                json.dumps(analysis),
                "Pending" if analysis["final_recommendation"]
                             == "Manual Review" else None,
                owner_id,
            ),
        )
        return cursor.lastrowid


def get_claim(claim_id, owner_id):
    """Get one claim and turn its stored JSON back into dictionaries."""
    with connect() as db:
        row = db.execute(
            "SELECT * FROM claims WHERE id = ? AND owner_id = ?",
            (claim_id, owner_id),
        ).fetchone()

    if row is None:
        return None

    result = dict(row)
    result["claim_data"] = json.loads(result["claim_data"])
    result["analysis"] = json.loads(result["analysis"])
    return result


def list_claims(owner_id):
    """Show the newest claims first."""
    with connect() as db:
        rows = db.execute(
            """
            SELECT id, invoice_number, claim_data, analysis, review_status, created_at
            FROM claims
            WHERE owner_id = ?
            ORDER BY id DESC
            """, (owner_id,)
        ).fetchall()

    results = []
    for row in rows:
        item = dict(row)
        analysis = json.loads(item.pop("analysis"))
        submitted = json.loads(item.pop("claim_data"))
        item["final_recommendation"] = analysis["final_recommendation"]
        item["product_category"] = submitted.get("product_category", "Product")
        item["fault_type"] = submitted.get("fault_type", "")
        item["policy_id"] = submitted.get("policy_id", "")
        item["claim_date"] = submitted.get("claim_date", "")
        item["models_disagree"] = analysis.get("models_disagree")
        item["gtm_prediction"] = analysis.get("gtm_prediction")
        results.append(item)

    return results


def save_review(claim_id, owner_id, reviewer_id, decision, note):
    """Record what a logged-in reviewer decided."""
    with connect() as db:
        db.execute(
            """
            UPDATE claims
            SET review_status = ?,
                reviewer_id = ?,
                review_note = ?
            WHERE id = ? AND owner_id = ? AND review_status = 'Pending'
            """,
            (decision, reviewer_id, note, claim_id, owner_id),
        )
        
def save_gtm_result(claim_id, owner_id, probabilities, model_version):
    """Add GTM results to a claim's stored analysis."""
    with connect() as db:
        row = db.execute(
            "SELECT analysis FROM claims WHERE id = ? AND owner_id = ?",
            (claim_id, owner_id),
        ).fetchone()

        if row is None:
            return False

        analysis = json.loads(row["analysis"])
        analysis["gtm_probabilities"] = probabilities
        analysis["gtm_prediction"] = max(
            probabilities,
            key=probabilities.get,
        )
        analysis["gtm_model_version"] = model_version
        analysis["models_disagree"] = (
            analysis["gtm_prediction"]
            != analysis["python_prediction"]
        )

        db.execute(
            "UPDATE claims SET analysis = ? WHERE id = ? AND owner_id = ?",
            (json.dumps(analysis), claim_id, owner_id),
        )

        return True
