import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).absolute().parent / "../PatchDb.Backend.Service/database.db"

def get_all_users():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Users")
    users_res = cursor.fetchall()

    # Get column names from cursor description
    columns = [desc[0] for desc in cursor.description]

    # Build list of dicts
    users = [dict(zip(columns, row)) for row in users_res]

    print(json.dumps(users, indent=4))

def print_available_roles():
    print(f"Available roles:")
    print("\tUnknown = 0")
    print("\tUser = 10")
    print("\tPatchMaker = 20")
    print("\tModerator = 30")
    print("\tAdmin = 40")

def update_role(username, role):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE Users SET role = ? WHERE username = ?",
        (role, username)
    )

    conn.commit()

def main():
    print("Select an option:")
    print("1. List all users")
    print("2. Update user role")
    choice = input("Enter 1 or 2: ").strip()

    if choice == "1":
        get_all_users()
    elif choice == "2":
        print_available_roles()
        username = input("Enter username: ").strip()
        role = input("Enter role number: ").strip()
        try:
            role_int = int(role)

            if role_int not in [0, 10, 20, 30, 40]:
                print("Invalid role number.")
                return

            update_role(username, role_int)
            print(f"Role updated for user '{username}' to {role_int}.")

        except ValueError:
            print("Invalid role. Must be a number.")
    else:
        print("Invalid choice.")



if __name__ == "__main__":
    main()