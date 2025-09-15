from flask import Flask, jsonify, request, send_from_directory
from db_repo import DbRepo
import patch_service
import os

os.makedirs("images", exist_ok=True)
os.makedirs("faiss_indexes", exist_ok=True)

app = Flask(__name__,  static_folder='images', static_url_path='/images')
_tmp_db = DbRepo("database.db")
_tmp_db.create_tables()

# @app.route("/")
# def index():
#     return send_from_directory(app.root_path + '/frontend', 'index.html')

# @app.route("/app.js")
# def appjs():
#     return send_from_directory(app.root_path + '/frontend', 'app.js')

# @app.route("/collection.html")
# def collection():
#     return send_from_directory(app.root_path + '/frontend', 'collection.html')

# @app.route("/dashboard.html")
# def dashboard():
#     return send_from_directory(app.root_path + '/frontend', 'dashboard.html')

# @app.route("/matches.html")
# def matches():
#     return send_from_directory(app.root_path + '/frontend', 'matches.html')

# @app.route("/style.css")
# def stylecss():
#     return send_from_directory(app.root_path + '/frontend', 'style.css')

# @app.route("/upload.html")
# def upload():
#     return send_from_directory(app.root_path + '/frontend', 'upload.html')

@app.route("/user", methods=["POST"])
def user():
    try:
        db = DbRepo("database.db")
        req = request.get_json()
        username = req.get("username")

        user = db.get_user_by_username(username)

        if user:
            return jsonify({"username": user["username"], "id": user["id"]}), 200
        
        user_id = db.insert_user(username)

        return jsonify({"username": username, "id": user_id}), 201
    except Exception as e:
        print(f"Error in /user: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500

@app.route("/<user_id>/upload", methods=["POST"])
def upload_patch(user_id):
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'You must provide an image to upload'}), 400

        image = request.files['image']
        filename = image.filename

        response, status_code = patch_service.handle_patch_upload(user_id, image, filename)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in /upload-patch: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500

@app.route("/<user_id>/group", methods=["PATCH"])
def add_patch_to_group(user_id):
    try:
        req = request.get_json()
        patch_id = req.get("patch_id")
        group_id = req.get("group_id")

        if not user_id or not patch_id or not group_id:
            return jsonify({'error': 'Invalid request body'}), 400

        response, status_code = patch_service.add_patch_to_group(user_id, patch_id, group_id)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in /add-patch-to-group: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500

@app.route("/<user_id>/group", methods=["POST"])
def create_patch_group(user_id):
    try:
        req = request.get_json()
        name = req.get("name")
        patch_id = req.get("patch_id")

        if not user_id or not name or not patch_id:
            return jsonify({'error': 'Invalid request body'}), 400

        response, status_code = patch_service.create_patch_group(user_id, name, patch_id)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in create_patch_group: {e}")
        return {'error': "Oops something went wrong"}, 500

@app.route("/<user_id>/patches", methods=["GET"])
def get_user_patches(user_id):
    try:
        response, status_code = patch_service.get_user_patches(user_id)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in /get-patches: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500