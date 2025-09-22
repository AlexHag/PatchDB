import sqlite3
import json

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute(
    "SELECT * FROM users"
)

users_res = cursor.fetchall()

users = [
    {
        "id": user[0],
        "username": user[1]
    } for user in users_res
] if users_res else []

print(json.dumps(users, indent=4))