"""Assign verified pre-account claim IDs to their original owner, locally.

Example: python backend/assign_legacy_claims.py Abass 1 2 3 4
Only run for claims you know belong to that username.
"""
import sys
from database import connect, create_tables, find_member


def main():
    create_tables()
    if len(sys.argv) < 3 or not all(arg.isdigit() for arg in sys.argv[2:]):
        raise SystemExit('Usage: python backend/assign_legacy_claims.py USERNAME CLAIM_ID [CLAIM_ID ...]')
    username, ids = sys.argv[1], [int(arg) for arg in sys.argv[2:]]
    if len(ids) != len(set(ids)):
        raise SystemExit('Each claim ID must appear once.')
    member = find_member(username)
    if not member:
        raise SystemExit('Member not found. Create or sign in to the account first.')
    with connect() as db:
        rows = db.execute(f"SELECT id, invoice_number, owner_id FROM claims WHERE id IN ({','.join('?' * len(ids))})", ids).fetchall()
        if len(rows) != len(ids) or any(row['owner_id'] is not None for row in rows):
            raise SystemExit('All IDs must exist and still be unassigned. No changes made.')
        for row in rows:
            print(f"Claim {row['id']}: invoice {row['invoice_number']}")
        if input(f"Assign these {len(rows)} claims to {username}? Type ASSIGN: ") != 'ASSIGN':
            raise SystemExit('Cancelled. No changes made.')
        db.executemany('UPDATE claims SET owner_id = ? WHERE id = ? AND owner_id IS NULL',
                       [(member['id'], claim_id) for claim_id in ids])
    print('Assigned. Refresh the signed-in Claim History page.')


if __name__ == '__main__':
    main()
