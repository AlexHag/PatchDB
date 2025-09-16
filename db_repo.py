import sqlite3

class DbRepo:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
    
    def create_tables(self):
        self.cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT
        )
        """)

        self.cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS patches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            path TEXT,
            patch_group_id INTEGER
        )
        """)

        self.cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS patch_group (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT
        )
        """)

        self.conn.commit()
    
    # ----------- User -------------------

    def insert_user(self, user_name):
        self.cursor.execute(
            "INSERT INTO users (username) VALUES (?)",
            (user_name,)
        )

        self.conn.commit()

        return self.cursor.lastrowid

    def get_user_by_username(self, username):
        self.cursor.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,)
        )

        user = self.cursor.fetchone()

        return {
            "id": user[0],
            "username": user[1]
        } if user else None
    
    def get_user_by_id(self, user_id):
        self.cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,)
        )

        user = self.cursor.fetchone()

        return {
            "id": user[0],
            "username": user[1]
        } if user else None

    # ----------- Patch Management -------------------

    def insert_patch(self, user_id, path):
        self.cursor.execute(
            "INSERT INTO patches (user_id, path) VALUES (?, ?)",
            (user_id, path)
        )

        self.conn.commit()

        return self.cursor.lastrowid

    def update_patch_group(self, patch_id, patch_group_id):
        self.cursor.execute(
            "UPDATE patches SET patch_group_id = ? WHERE id = ?",
            (patch_group_id, patch_id)
        )

        self.conn.commit()
    
    def get_patch_by_id(self, patch_id):
        self.cursor.execute(
            "SELECT * FROM patches WHERE id = ?",
            (patch_id,)
        )

        patch = self.cursor.fetchone()

        return {
            "id": patch[0],
            "user_id": patch[1],
            "path": patch[2],
            "patch_group_id": patch[3]
        } if patch else None

    def get_all_patches_by_group_id(self, group_id):
        self.cursor.execute(
            "SELECT * FROM patches WHERE patch_group_id = ?",
            (group_id,)
        )

        patches = self.cursor.fetchall()

        return [
            {
                "id": patch[0],
                "user_id": patch[1],
                "path": patch[2],
                "patch_group_id": patch[3]
            } for patch in patches
        ] if patches else []

    def delete_patch_by_id(self, patch_id):
        self.cursor.execute(
            "DELETE FROM patches WHERE id = ?",
            (patch_id,)
        )

        self.conn.commit()

    # ------------ Patch Group ------------------

    def insert_patch_group(self, user_id, name):
        self.cursor.execute(
            "INSERT INTO patch_group (user_id, name) VALUES (?, ?)",
            (user_id, name)
        )

        self.conn.commit()

        return self.cursor.lastrowid

    def get_patch_group_by_id(self, group_id):
        self.cursor.execute(
            "SELECT * FROM patch_group WHERE id = ?",
            (group_id,)
        )

        group = self.cursor.fetchone()

        return {
            "id": group[0],
            "user_id": group[1],
            "name": group[2]
        } if group else None

    def get_all_patches_by_user_id(self, user_id):
        self.cursor.execute(
            "SELECT p.id, p.path, p.patch_group_id, pg.name FROM patches p LEFT JOIN patch_group pg ON p.patch_group_id=pg.id WHERE p.user_id = ?",
            (user_id,)
        )

        patches = self.cursor.fetchall()

        return [
            {
                "id": patch[0],
                "path": patch[1],
                "group_id": patch[2],
                "group_name": patch[3]
            } for patch in patches
        ] if patches else []

    def delete_patch_group_by_id(self, group_id):
        self.cursor.execute(
            "DELETE FROM patch_group WHERE id = ?",
            (group_id,)
        )

        self.conn.commit()