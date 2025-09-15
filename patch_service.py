import uuid
import os
from db_repo import DbRepo
from patch_search import search_patch
from collections import defaultdict

def save_image(user_id, image, filename):
    extension = get_extension(filename)
    file_id = str(uuid.uuid4())

    os.makedirs(f"./images/{user_id}", exist_ok=True)

    path = f"./images/{user_id}/{file_id}.{extension}"
    image.save(path)
    return path

def get_extension(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''

def handle_patch_upload(user_id, image, filename):
    try:
        db = DbRepo("database.db")

        user = db.get_user_by_id(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        path = save_image(user_id, image, filename)
        result = search_patch(db, user_id, path)

        return result, 200
    except Exception as e:
        print(f"Error in handle_patch_upload: {e}")
        return {'error': "Oops something went wrong"}, 500

def create_patch_group(user_id, name, patch_id):
    try:
        db = DbRepo("database.db")

        user = db.get_user_by_id(user_id)

        if not user:
            return {'error': 'User not found'}, 404
    
        patch = db.get_patch_by_id(patch_id)

        if not patch:
            return {'error': 'Patch not found'}, 404

        group_id = db.insert_patch_group(user_id, name)
        db.update_patch_group(patch_id, group_id)

        return {'group_id': group_id, 'group_name': name}, 201
    except Exception as e:
        print(f"Error in create_patch_group: {e}")
        return {'error': "Oops something went wrong"}, 500

def add_patch_to_group(user_id, patch_id, group_id):
    try:
        db = DbRepo("database.db")

        user = db.get_user_by_id(user_id)

        if not user:
            return {'error': 'User not found'}, 404
    
        patch = db.get_patch_by_id(patch_id)

        if not patch:
            return {'error': 'Patch not found'}, 404

        group = db.get_patch_group_by_id(group_id)

        if not group:
            return {'error': 'Patch group not found'}, 404

        db.update_patch_group(patch_id, group_id)

        return {'message': 'Patch added to group'}, 200
    except Exception as e:
        print(f"Error in add_patch_to_group: {e}")
        return {'error': "Oops something went wrong"}, 500

# {
#     "patches": [
#         {
#             "id": 3,
#             "name": "Apple",
#             "images": [
#                 {
#                     "path": "/images/2/3d670593-1661-4bc7-991e-d7508dac0e03.png",
#                     "id": 9
#                 },
#                 {
#                     "id": 10,
#                     "path": "./images/2/64ef1727-c043-40ff-bce9-2dceff4a95eb.jpg"
#                 }
#             ]
#         }
#     ],
#     "ungrouped_patches": [
#         {
#             "id": 11,
#             "path": "./images/2/ed0c487b-5c30-45c1-b014-5823b9fc6d79.jpg"
#         }
#     ]
# }


def get_user_patches(user_id):
    try:
        db = DbRepo("database.db")
        patches = db.get_all_patches_by_user_id(user_id)

        grouped_patches = defaultdict(list)
        ungrouped_patches = []

        for patch in patches:
            print(patch)

            if patch['group_id'] is not None:
                grouped_patches[str(patch['group_id'])].append({
                    'id': patch['id'],
                    'path': patch['path'],
                    'group_name': patch['group_name']
                })
            else:
                ungrouped_patches.append({
                    'id': patch['id'],
                    'path': patch['path']
                })
            
        response = {
            "patches": [],
            "ungrouped_patches": ungrouped_patches
        }

        for group_id, patch_list in grouped_patches.items():
            group = {
                'id': int(group_id),
                'name': patch_list[0]['group_name'],
                'images': [{'id': p['id'], 'path': p['path']} for p in patch_list]
            }
    
            response["patches"].append(group)

        return response, 200
    except Exception as e:
        print(f"Error in get_user_patch_groups: {e}")
        return {'error': "Oops something went wrong"}, 500

if __name__ == "__main__":
    import json
    print(json.dumps(get_user_patches(1), indent=2))