import requests
import os

# BASE_URL = "https://patchdb.se"
BASE_URL = "http://localhost:5001"

class BatchSubmitPatches:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.token = self.login()
    
    def login(self):
        req = {
            "username": self.username,
            "password": self.password
        }

        res = requests.post(f"{BASE_URL}/api/auth/login", json=req)

        if res.status_code != 200:
            raise Exception("Login failed")
        
        token = res.json()['credentials']['accessToken']
        return token

    def get_file_id(self):
        res = requests.get(f"{BASE_URL}/api/file-service/upload-url", headers={"Authorization": f"Bearer {self.token}"})

        if res.status_code != 200:
            raise Exception("Failed to get upload URL")
    
        return res.json()

    def upload_file(self, file_path):
        file_id = self.get_file_id()
        upload_url = file_id["url"]

        with open(file_path, "rb") as f:
            response = requests.put(upload_url, data=f)

        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to upload file to S3: {response.status_code} {response.text}")

        return file_id['fileId']

    def submit_patch(self, file_path):
        file_id = self.upload_file(file_path)

        name = '.'.join(file_path.split("/")[-1].split(".")[:-1])
        req = {
            "fileId": file_id,
            "name": name
        }

        res = requests.post(f"{BASE_URL}/api/patch-submission/upload", json=req, headers={"Authorization": f"Bearer {self.token}"})

        if res.status_code != 200:
            raise Exception(f"Failed to submit patch: {res.status_code} {res.text}")

        print(f"Submitted patch for file {file_path} with patch submission ID {res.json()['patchSubmissionId']}")

def main():
    submission = BatchSubmitPatches("alex", "password")
    all_files = [f for f in os.listdir("images") if os.path.isfile(os.path.join("images", f))]
    
    for f in all_files:
        submission.submit_patch(f"images/{f}")

if __name__ == "__main__":
    main()