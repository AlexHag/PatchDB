import os
import torch
import clip
import faiss
import numpy as np
from PIL import Image
from db_repo import DbRepo

DEVICE = "cpu"
MODEL, PREPROCESS = clip.load("RN50", device=DEVICE, jit=False)
MODEL.eval()

class PatchSearch:
    def __init__(self, index_id):
        self.device = DEVICE
        self.model = MODEL
        self.preprocess = PREPROCESS

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

        path = f"./faiss_indexes/{self.index_id}.index"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        faiss.write_index(self.index, path)

    def _get_image_embedding(self, path):
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((256, 256), Image.Resampling.LANCZOS)
            img = self.preprocess(img).unsqueeze(0).to(self.device)

        with torch.inference_mode():
            emb = self.model.encode_image(img)

        emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.cpu().numpy().astype("float32")

    def k_search(self, emb, id):
        if self.index is None or self.index.ntotal == 0:
            return []

        D, I = self.index.search(emb, k=self.top_k)

        return [
            (int(idx), float(score))
            for score, idx in zip(D[0], I[0])
            if idx != id and idx != -1 and score >= self.radius
        ]

    def index_patch(self, path, id):
        emb = self._get_image_embedding(path)
        self._add_to_index(emb, id)
        return self.k_search(emb, id)

def search_patch(db: DbRepo, user_id, patch_id, path):
    index = PatchSearch(user_id)
    result = index.index_patch(path, patch_id)

    patch_groups = {}
    ungrouped_matches = []

    for rid, score in result:
        matching_patch = db.get_patch_by_id(rid)
        if not matching_patch:
            print(f"Warning: matching patch not found for ID={rid}")
            continue

        if matching_patch["patch_group_id"]:
            current = patch_groups.get(matching_patch["patch_group_id"])
            if current and current["score"] > score:
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
