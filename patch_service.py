import uuid
import os
from db_repo import DbRepo
from patch_index import PatchIndex
from collections import defaultdict

def _save_image(user_id, image, filename):
    extension = _get_extension(filename)
    file_id = str(uuid.uuid4())

    os.makedirs(f"./images/{user_id}", exist_ok=True)

    path = f"./images/{user_id}/{file_id}.{extension}"
    image.save(path)
    return path

def _get_extension(filename):
    basename = os.path.basename(filename)

    if '.' in basename:
        ext = basename.rsplit('.', 1)[1].lower()
        allowed = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
        if ext in allowed:
            return ext

    return ''

def handle_patch_upload(user_id, image, filename):
    try:
        db = DbRepo("database.db")

        user = db.get_user_by_id(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        path = _save_image(user_id, image, filename)
        patch_id = db.insert_patch(user_id, path)

        index = PatchIndex(user_id)
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
        }, 200
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

def update_patch_group_favorite(user_id, group_id, is_favorite):
    try:
        db = DbRepo("database.db")
        user = db.get_user_by_id(user_id)

        if not user:
            return {'error': 'User not found'}, 404
        
        group = db.get_patch_group_by_id(group_id)

        if not group:
            return {'error': 'Patch group not found'}, 404
        
        db.update_is_favorite(group_id, is_favorite)
        msg = "Patch group marked as favorite" if is_favorite else "Patch group removed from favorite"
        return {'message': msg}, 200
    except Exception as e:
        print(f"Error in update_patch_group_favorite: {e}")
        return {'error': "Oops something went wrong"}, 500

def get_user_patches(user_id):
    try:
        db = DbRepo("database.db")
        patches = db.get_all_patches_by_user_id(user_id)

        grouped_patches = defaultdict(list)
        ungrouped_patches = []

        for patch in patches:
            if patch['group_id'] is not None:
                grouped_patches[str(patch['group_id'])].append({
                    'id': patch['id'],
                    'path': patch['path'],
                    'group_name': patch['group_name'],
                    'is_favorite': patch['is_favorite']
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
                'is_favorite': patch_list[0]['is_favorite'],
                'images': [{'id': p['id'], 'path': p['path']} for p in patch_list]
            }
    
            response["patches"].append(group)

        return response, 200
    except Exception as e:
        print(f"Error in get_user_patch_groups: {e}")
        return {'error': "Oops something went wrong"}, 500

def delete_patch(user_id, patch_id):
    try:
        db = DbRepo("database.db")

        patch = db.get_patch_by_id(patch_id)

        if not patch:
            return {'error': 'Patch not found'}, 404
    
        if str(patch['user_id']) != str(user_id):
            return {'error': 'Unauthorized'}, 403

        if os.path.exists(patch['path']):
            os.remove(patch['path'])
        
        db.delete_patch_by_id(patch_id)
        index = PatchIndex(user_id)
        index.remove_from_index(patch_id)

        return {'message': 'Patch deleted successfully'}, 200
    except Exception as e:
        print(f"Error in delete_patch: {e}")
        return {'error': "Oops something went wrong"}, 500

def delete_patch_group(user_id, group_id):
    try:
        db = DbRepo("database.db")

        group = db.get_patch_group_by_id(group_id)

        if not group:
            return {'error': 'Patch group not found'}, 404
    
        if str(group['user_id']) != str(user_id):
            return {'error': 'Unauthorized'}, 403
    
        patches = db.get_all_patches_by_group_id(group_id)
        index = PatchIndex(user_id)

        for patch in patches:
            if os.path.exists(patch['path']):
                os.remove(patch['path'])
            
            db.delete_patch_by_id(patch['id'])
            index.remove_from_index(patch['id'])

        db.delete_patch_group_by_id(group_id)
        return {'message': 'Patch group deleted successfully'}, 200
    except Exception as e:
        print(f"Error in delete_patch_group: {e}")
        return {'error': "Oops something went wrong"}, 500