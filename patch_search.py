import torch
import clip
from PIL import Image
import os
import numpy as np
import faiss
from db_repo import DbRepo
import json

class PatchSearch:
    def __init__(self, index_id):
        self.device = "cpu"
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)

        self.index_id = index_id
        self.index = self._try_load_index()

        self.top_k = 4
        self.radius = 0.7
    
    def _try_load_index(self):
        path = f"./faiss_indexes/{self.index_id}.index"

        if os.path.exists(path):
            return faiss.read_index(path)

        return None

    def _add_to_index(self, emb, id):
        if self.index is None:
            base_index = faiss.IndexFlatIP(emb.shape[1])
            self.index = faiss.IndexIDMap(base_index)
            self.index.add_with_ids(emb, np.array([id]))
        else:
            self.index.add_with_ids(emb, np.array([id]))
        
        path = f"./faiss_indexes/{self.index_id}.index"
        faiss.write_index(self.index, path)
    
    def _get_image_embedding(self, path):
        img = self.preprocess(Image.open(path)).unsqueeze(0).to(self.device)

        with torch.no_grad():
            emb = self.model.encode_image(img)
        emb = emb / emb.norm(dim=-1, keepdim=True)
        
        return emb.cpu().numpy().astype("float32")

    def k_search(self, emb, id):
        result = []

        D, I = self.index.search(emb, k=self.top_k)
        for score, idx in zip(D[0], I[0]):
            if idx != id and idx != -1 and score >= self.radius:
                result.append((int(idx), float(score)))

        return result

    def index_patch(self, path, id):
        emb = self._get_image_embedding(path)
        self._add_to_index(emb, id)

        return self.k_search(emb, id)

def search_patch(db: DbRepo, user_id, path):
    patch_id = db.insert_patch(user_id, path)

    index = PatchSearch(user_id)
    result = index.index_patch(path, patch_id)

    patch_groups = {}
    ungrouped_matches = []

    for rid, score in result:
        matching_patch = db.get_patch_by_id(rid)
        if not matching_patch:
            print(f"Warning matching patch not found in DB for ID={rid}")
            continue

        if matching_patch["patch_group_id"]:
            existing_patch_in_group = patch_groups.get(matching_patch["patch_group_id"], None)

            if existing_patch_in_group is not None and existing_patch_in_group["score"] > score:
                continue

            group = db.get_patch_group_by_id(matching_patch["patch_group_id"])

            patch_groups[matching_patch["patch_group_id"]] = {
                "id": matching_patch["id"],
                "group_id": matching_patch["patch_group_id"],
                "group_name": group["name"] if group else "Unknown Group",
                "path": matching_patch["path"],
                "score": score
            }
        else:
            ungrouped_matches.append({
                "id": matching_patch["id"],
                "group_id": None,
                "group_name": None,
                "path": matching_patch["path"],
                "score": score
            })
        
    return {
        "patch": {
            "id": patch_id,
            "path": path
        },
        "matches": list(patch_groups.values()),
        "ungrouped_matches": ungrouped_matches
    }

def upload_patch(db: DbRepo, user_id, path):
    search_results = search_patch(db, user_id, path)
    print(json.dumps(search_results, indent=4))

    patch_id = search_results["patch"]["id"]

    if search_results["matches"]:
        confirmed_group_match_id = input("Found matching patches. Enter the group ID to add the patch to:")

        if confirmed_group_match_id.isdigit():
            group_id = int(confirmed_group_match_id)
            db.update_patch_group(patch_id, group_id)
            print(f"Added patch to group ID {group_id} - {search_results['matches'][group_id]['group_name']}")
            return

    new_group_name = input("Enter new group name: ")
    if new_group_name:
        group_id = db.insert_patch_group(user_id, new_group_name)
        db.update_patch_group(patch_id, group_id)
        print(f"Created new group '{new_group_name}' with ID {group_id} and added the patch to it.")

def get_or_create_user(db: DbRepo, user_name="alex"):
    db.create_tables()

    existing = db.get_user_by_username(user_name)
    
    if existing is None:
        return db.insert_user("alex")
    
    return existing["id"]

def main():
    db = DbRepo("database.db")
    user_id = get_or_create_user(db)

    path = "./images/starbucks_1.jpg"
    upload_patch(db, user_id, path)

if __name__ == "__main__":
    main()
