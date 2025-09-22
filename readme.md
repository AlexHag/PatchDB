# PatchDB

[patchdb.se](https://patchdb.se)

---

Image recognition using

https://github.com/openai/CLIP

# Server

## Create user
Request:
```
POST /user
Content-Type: application/json
{
    "username": "John"
}
```
Response
```
{
    "id": 1,
    "username": "John"
}
```

## Upload an image of a patch
Request:
```
POST /<user_id>/upload
File image=@my_patch.png
```
Response:
```
{
  "matches": [
    {
      "group_id": 3,
      "group_name": "Apple",
      "is_favorite": 1
      "id": 9,
      "path": "./images/2/3d670593-1661-4bc7-991e-d7508dac0e03.png",
      "score": 0.8786004185676575
    }
  ],
  "patch": {
    "id": 11,
    "path": "./images/2/ed0c487b-5c30-45c1-b014-5823b9fc6d79.jpg"
  },
  "ungrouped_matches": []
}
```

## Add an uploaded patch to an existing group of patches
Request
```
PATCH /<user_id>/group
Content-Type: application/json
{
    "patch_id": 11,
    "group_id": 3
}
```
Response
```
{
    "message": "Patch added to group"
}
```

## Create new group of patches
Request
```
POST /<user_id>/group
Content-Type: application/json
{
    "patch_id": 11,
    "name": "My new patch"
}
```
Response
```
{
    "message": "Patch added to group"
}
```

## List user patches
Request
```
GET /<user_id>/patches
```
Response
```
{
    "patches": [
        {
            "id": 1,
            "images": [
                {
                    "id": 1,
                    "path": "./images/2/0cbe8703-0254-43d7-af32-59c7a507141d.jpg"
                },
                {
                    "id": 3,
                    "path": "./images/2/4800987c-c5b8-44d2-9a61-801a47db04ad.jpg"
                }
            ],
            "name": "My Cool Patch",
            "is_favorite": 0
        },
        {
            "id": 2,
            "images": [
                {
                    "id": 2,
                    "path": "./images/2/fcd6d76f-cbdd-4a09-9079-f59fac216ab6.jpg"
                }
            ],
            "name": "Another Patch",
            "is_favorite": 1
        }
    ],
    "ungrouped_patches": [
        {
            "id": 5,
            "path": "./images/2/4b7b93de-4795-4451-bb0f-cbad37e6879b.jpg"
        }
    ]
}
```

## Delete patch
Request
```
DELETE /<user_id>/patch/<patch_id>
```

## Delete group and all patches in it
Request
```
DELETE /<user_id>/group/<group_id>
```

## Add a patch group to favorites
Request
```
PUT /<user_id>/group/<group_id>/favorite
```

## Remove a patch group from favorites
Request
```
DELETE /<user_id>/group/<group_id>/favorite
```

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
