# PatchDB

[patchdb.se](https://patchdb.se)

---

Image recognition using

https://github.com/openai/CLIP

# Deploy

The server is deployed on https://cloud.cbh.kth.se/ which only exposes a non-standard public port. To get a domain available, the server is proxied through another server that hosts the domain.

## Deploy Proxy

1. Install Nginx
```
sudo apt update
sudo apt install nginx
```

2. Install certbot
```
sudo apt update
sudo apt install python3 python3-dev python3-venv libaugeas-dev gcc
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
sudo certbox --help
```

3. Generate certificat
```
sudo certbot certonly --nginx
```

4. Generate self signed certificates for HTTPS communication between the proxy and server
Do this locally
```
sudo openssl req -x509 -nodes -days 3650 \
  -newkey rsa:4096 \
  -keyout backend.key \
  -out backend.crt \
  -subj "/CN=deploy.cloud.cbh.kth.se"
```
5. Copy the certificate to the proxy
```
scp backend.crt <username>@<proxy_ip>:/etc/nginx/certs/backend.crt
```

6. Copy Proxy Nginx config
```
sudo cp ~/PatchDB/nginx/patch_db_proxy_https /etc/nginx/sites-available/patch_db_proxy_https
sudo cp ~/PatchDB/nginx/patch_db_proxy_http /etc/nginx/sites-available/patch_db_proxy_http
sudo ln -s /etc/nginx/sites-available/patch_db_proxy_https /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/patch_db_proxy_http /etc/nginx/sites-enabled/
```

7. Restart nginx
```
sudo systemctl restart nginx
```

## Deploy Server

1. Copy the self signed certificate and private key to the KTH server
```
scp backend.crt <username>@<kth_server_ip>:/etc/nginx/ssl/backend.crt
scp backend.crt <username>@<kth_server_ip>:/etc/nginx/ssl/backend.key
```

2. Install Nginx
```
sudo apt update
sudo apt install nginx
```

3. Build React Frontend
```
cd ~/PatchDB/react-frontend
npm install
npm run build
```
If you build locally, use scp to copy the file to the VM
```
scp -r ./dist/* <username>@<server_ip>:/var/www/patch_db_react
```
If you build on the VM, copy the files directly
```
cp -r ./dist/* /var/www/patch_db_react
```

4. Copy Nginx Config
```
sudo cp ~/PatchDB/nginx/patch_db_react /etc/nginx/sites-available/patch_db_react
sudo ln -s /etc/nginx/sites-available/patch_db_react /etc/nginx/sites-enabled/
```

5. Restart Nginx
```
sudo systemctl restart nginx
```

## Deploy python backend for image processing and indexing
```
cd ~/PatchDB/PatchDb.Backend/patchdb-py-indexing
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m flask run > output.log 2>&1 &
```
If you face any issues installing the requirements. Try and do it manually. See how to install [PyTorch](https://pytorch.org/get-started/locally/) and [CLIP](https://github.com/openai/CLIP).

## Deploy .NET backend

1. Install the .NET SDK
```
sudo apt-get update && \
  sudo apt-get install -y dotnet-sdk-8.0
```

2. Install the runtime
```
sudo apt-get update && \
  sudo apt-get install -y aspnetcore-runtime-8.0
```
(Make sure the global.json file matches the installed sdk version)

3. Install entity framework
```
cd ~/PatchDB/PatchDb.Backend
dotnet new tool-manifest
dotnet tool install --local dotnet-ef
```

4. Apply DB migrations
```
dotnet ef database update
```

5. Generate JWT certificates
```
cd ~/PatchDB/PatchDb.Backend/certificates
chmod +x generate_jwt_cert.sh
./generate_jwt_cert.sh
```

6. You must manually copy the secrets into
```
cd ~/PatchDB/PatchDb.Backend/app-secrets
```

7. Run the backend
```
cd ~/PatchDB/PatchDb.Backend/PatchDb.Backend.Service
dotnet run > output.log 2>&1 &
```

# Features

## Patch indexing written in python
- Add a new patch to the index ``POST /index``
- Delete a patch from the index ``DELETE /index/{id}``
- Search for similar patches in the index ``POST /search``

## Authentication
- Login
- Register

## User
- Profile Picture
- Bio
- University Information
- Search other users

## Patches
- Get
- Search

## Patch submittion
- Upload
- Update
- Get unpublished

## User patches
- Get patches
- Upload patch
- Match with existing

## Following
- Follow / Unfollow other user
- Get followers and following