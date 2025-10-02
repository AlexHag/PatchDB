from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from patch_index import PatchIndex
import os

os.makedirs("faiss_indexes", exist_ok=True)

app = Flask(__name__,  static_folder='images', static_url_path='/images')
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

@app.route("/index", methods=["POST"])
def index_patch():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'You must provide an image to upload'}), 400

        patch_id = request.form.get("patchId")

        image = request.files['image']

        index = PatchIndex("main")
        index.index_patch(image, patch_id)

        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"Error in patch upload /index: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500

@app.route("/search", methods=["POST"])
def search_patch():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'You must provide an image to upload'}), 400

        image = request.files['image']
        
        index = PatchIndex("main")
        result = index.search_patch(image)
        response = []

        for rid, score in result:
            response.append({"patchId": rid, "score": score})

        return jsonify({"matches": response}), 200
    except Exception as e:
        print(f"Error in patch search /search: {e}")
        return jsonify({'error': "Oops something went wrong"}), 500