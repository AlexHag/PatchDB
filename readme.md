# PatchDB

[patchdb.se](https://patchdb.se)

---

Image recognition using

https://github.com/openai/CLIP

# Server

## Patch indexing written in python
- POST /index
- DELETE /index/{id}
- POST /search

## Authentication
- Login
- Register

## User
- Profile Picture
- Bio
- University Information

## Patches
- Get
- Search

## Patch submittion
- Upload
- Update
- Get pending

## User patches
- Get patches
- Upload patch
- Match with existing

# Deploy

## Install nginx
```
sudo apt update
sudo apt install nginx
```

## Create nginx config
```
sudo cp nginx/patch_db_http /etc/nginx/sites-available/patch_db_http
sudo cp nginx/patch_db_https /etc/nginx/sites-available/patch_db_https
```
```
sudo ln -s /etc/nginx/sites-available/patch_db_http /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/patch_db_https /etc/nginx/sites-enabled/
```

## Move static files
```
sudo mkdir /var/www/patch_db_https
sudo cp -r frontend/* /var/www/patch_db_https
```

## Get HTTPS certificate
1. Install certbot
```
sudo apt update
sudo apt install python3 python3-dev python3-venv libaugeas-dev gcc
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
sudo certbox --help
```
2. Generate certificat
```
sudo certbot certonly --nginx
```

## Restart nginx
```
sudo systemctl restart nginx
```

## Start backend
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m flask run > output.log 2>&1 &
```

## Build react app
Build locally
```
npm i
npm run build
```
Copy build to VM
```
scp -r .\dist\* username@server_ip:/var/www/patch_db_react
```

## Install and deploy .NET backend

### Install the SDK
```
sudo apt-get update && \
  sudo apt-get install -y dotnet-sdk-8.0
```
### Install the runtime
```
sudo apt-get update && \
  sudo apt-get install -y aspnetcore-runtime-8.0
```
(Make sure the global.json file matches the installed sdk version)

### Configure database
1. Install entity framework
```
cd ~/PatchDB/PatchDb.Backend
dotnet new tool-manifest
dotnet tool install --local dotnet-ef
```
2. Update database
```
cd ~/PatchDB/PatchDb.Backend/PatchDb.Backend.Service
dotnet ef database update
```

### You must manually copy the secrets into
```
~/PatchDB/PatchDb.Backend/app-secrets/
```

### Generate JWT certificate
```
cd ~/PatchDB/PatchDb.Backend/certificates
chmod +x generate_jwt_cert.sh
./generate_jwt_cert.sh
```

### Run the backend
```
cd ~/PatchDB/PatchDb.Backend/PatchDb.Backend.Service
dotnet run > output.log 2>&1 &
```

TODO: Do not run production in development mode but please give me some slack...

## Deploy through proxy
Generate self signed cerificate on backend
```
sudo openssl req -x509 -nodes -days 3650 \
  -newkey rsa:4096 \
  -keyout backend.key \
  -out backend.crt \
  -subj "/CN=deploy.cloud.cbh.kth.se"

sudo mkdir -p /etc/nginx/ssl
sudo mv backend.crt /etc/nginx/ssl/backend.crt
sudo mv backend.key /etc/nginx/ssl/backend.key
```

Copy certificate to the proxy server
TODO: Document this shit
