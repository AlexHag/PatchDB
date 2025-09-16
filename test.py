import os
from db_repo import DbRepo
import patch_service
from PIL import Image

def integration_test():
    if os.path.exists("./faiss_indexes/1.index"):
        os.remove("./faiss_indexes/1.index")
    if os.path.exists("./database.db"):
        os.remove("./database.db")

    # Setup
    os.makedirs("images", exist_ok=True)
    os.makedirs("faiss_indexes", exist_ok=True)
    db = DbRepo("database.db")
    db.create_tables()

    # Create user
    username = "John"
    user = db.get_user_by_username(username)

    if user:
        user_id = user["id"] 
    else:
        user_id = db.insert_user(username)

    # Upload patch
    filename = './images/apple_1.png'
    image = Image.open(filename)
    upload_response = patch_service.handle_patch_upload(user_id, image, filename)

    # Assert upload was successful
    assert(upload_response[1] == 200), f"Upload return 200 status code {upload_response[1]}"
    assert(len(upload_response[0].get('matches')) == 0), f"Upload returned matches despite no images are supposed to have been uploaded {upload_response[0]}"
    assert(upload_response[0].get('patch') is not None), f"Upload did not return the uploaded patch info {upload_response[0]}"

    # Get patches
    patches = patch_service.get_user_patches(user_id)

    # Assert the uploaded patch has not been added to any group
    assert(patches[1] == 200), f"Get patches returned 200 status code {patches[1]}"
    assert(len(patches[0].get('ungrouped_patches')) == 1), f"Get patches did not return the uploaded ungrouped patch {patches[0]}"
    assert(patches[0].get('ungrouped_patches')[0]['id'] == upload_response[0]['patch']['id']), f"Get patches did not return the correct ungrouped patch ID {patches[0].get('patches')[0]['id']}"

    # Create a new group to add the uploaded patch to
    create_patch_group_response = patch_service.create_patch_group(user_id, "Test Patch", upload_response[0]['patch']['id'])
    assert(create_patch_group_response[1] == 201), f"Create patch group returned 201 status code {create_patch_group_response[1]}"

    # Get patches
    patches = patch_service.get_user_patches(user_id)

    # Assert the uploaded patch has been added to the correct group
    assert(patches[1] == 200), f"Get patches returned 200 status code {patches[1]}"
    assert(len(patches[0].get('patches')) == 1), f"Get patches did not return the correct number of patch groups {patches[0]}"
    assert(patches[0].get('patches')[0]['id'] == create_patch_group_response[0]['group_id']), f"Get patches did not return the correct group ID of the uploaded patch {patches[0]}"
    assert(len(patches[0].get('patches')[0]['images']) == 1), f"Get patches did not return the correct number of images for the patch group {patches[0]}"
    assert(patches[0].get('patches')[0]['images'][0]['id'] == upload_response[0]['patch']['id']), f"Get patches did not return the correct image ID for the patch group {patches[0]}"


if __name__ == "__main__":
    integration_test()
    print("All tests passed!")