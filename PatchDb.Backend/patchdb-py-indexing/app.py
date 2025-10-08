from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from patch_index import PatchIndex
import os

os.makedirs("faiss_indexes", exist_ok=True)

app = Flask(__name__,  static_folder="images", static_url_path="/images")
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

@app.route("/index", methods=["POST"])
def index_patch():
    try:
        if "image" not in request.files:
            return jsonify({"status": "error", "error": "You must provide an image to upload"}), 400

        patch_id = request.form.get("id")

        image = request.files["image"]

        index = PatchIndex("main")
        index.index_patch(image, patch_id)

        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"Error in patch upload /index: {e}")
        return jsonify({"status": "error", "error": "Oops something went wrong"}), 500

@app.route("/index/<id>", methods=["DELETE"])
def delete_from_index(id):
    try:
        index = PatchIndex("main")
        index.remove_from_index(id)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"Error in delete from index /index/<id>: {e}")
        return jsonify({"status": "error", "error": "Oops something went wrong"}), 500

@app.route("/search", methods=["POST"])
def search_patch():
    try:
        if "image" not in request.files:
            return jsonify({"status": "error", "error": "You must provide an image to upload"}), 400

        image = request.files["image"]

        index = PatchIndex("main")
        result = index.search_patch(image)
        matches = []

        for rid, score in result:
            matches.append({"id": rid, "score": score})

        return jsonify({"status": "success", "matches": matches}), 200
    except Exception as e:
        print(f"Error in patch search /search: {e}")
        return jsonify({"status": "error", "error": "Oops something went wrong"}), 500