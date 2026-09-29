from getpass import getpass
from sqlite3 import IntegrityError

from werkzeug.security import generate_password_hash

from database import connect, create_tables


create_tables()

username = input("New member username: ").strip()
password = getpass("New member password: ")

if not username or not password:
    print("Username and password cannot be empty.")
else:
    try:
        with connect() as db:
            db.execute(
                """
                INSERT INTO members (username, password_hash)
                VALUES (?, ?)
                """,
                (username, generate_password_hash(password)),
            )
        print("Member created:", username)
    except IntegrityError:
        print("That username already exists.")