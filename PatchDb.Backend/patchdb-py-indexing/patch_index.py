import os
import torch
import clip
import faiss
import numpy as np
from PIL import Image

DEVICE = "cpu"
MODEL, PREPROCESS = clip.load("RN50", device=DEVICE, jit=False)
MODEL.eval()

class PatchIndex:
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
            self.index = faiss.IndexIDMap2(base_index)

        self.index.add_with_ids(emb, np.array([id]))

        path = f"./faiss_indexes/{self.index_id}.index"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        faiss.write_index(self.index, path)

    def _get_image_embedding(self, image):
        with Image.open(image) as img:
            img = img.convert("RGB")
            img.thumbnail((256, 256), Image.Resampling.LANCZOS)
            img = self.preprocess(img).unsqueeze(0).to(self.device)

        with torch.inference_mode():
            emb = self.model.encode_image(img)

        emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.cpu().numpy().astype("float32")

    def k_search(self, emb):
        if self.index is None or self.index.ntotal == 0:
            return []

        D, I = self.index.search(emb, k=self.top_k)

        return [
            (int(idx), float(score))
            for score, idx in zip(D[0], I[0])
            if idx != -1 and score >= self.radius
        ]

    def index_patch(self, image, id):
        emb = self._get_image_embedding(image)
        self._add_to_index(emb, id)

    def search_patch(self, image):
        emb = self._get_image_embedding(image)
        return self.k_search(emb)

    def remove_from_index(self, id):
        if self.index is not None:
            self.index.remove_ids(np.array([id], dtype=np.int64))
            path = f"./faiss_indexes/{self.index_id}.index"
            faiss.write_index(self.index, path)
