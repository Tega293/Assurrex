from database import connect

with connect() as db:
    rows = db.execute(
        "SELECT id, invoice_number FROM claims ORDER BY id"
    ).fetchall()

for row in rows:
    print(row["id"], repr(row["invoice_number"]))   