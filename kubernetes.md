# Create Kubernetes Cluster

### 1. Create the cluster and registry in digital ocean

cluster name: patchdb-k8

registry name: patchdb-cr

---

### 2. Github Environment Variables & Secrets

Create an environment in the github repository
- Environment name: prod

Upload environment secrets to github
- ``DIGITALOCEAN_API_KEY``

Upload environment variables to github
- ``DIGITALOCEAN_CR=registry.digitalocean.com/patchdb-cr``
- ``DIGITALOCEAN_USERNAME=alex.hagdahl.jobb@gmail.com``

### 3. Create kubernetes namespace

```
kubectl apply -f .kubernetes/00-namespace.yaml
```

---

### 4. Apply the container registry secrets in kubernetes

Get the kubernetes-manifest
```
doctl registry kubernetes-manifest
```
Change the namespace to ``patcdb``

Apply the secret
```
kubectl apply -f .kubernetes/01-registry-secret.yaml`
```

TODO: Create github pipeline to create the registry secret in kubernetes

---

### 5. Kubernetes Configuration

Create the config map
```
kubectl apply -f .kubernetes/02-backend-dotnet-config.yaml
```

Run the pipeline to upload the configuration files to kubernetes
- ``.github/update-backend-dotnet-configs.yaml``

---

### 6. Kubernetes Secrets

Create the secret
```
kubectl apply -f .kubernetes/03-backend-dotnet-secret.yaml
```

Run the pipeline to update the secrets from github

---

### 7. Kubernetes Certificates

Create certificates and upload them to kubernetes secrets
```
openssl genrsa -out jwt_key.pem 4096
openssl req -new -x509 -key jwt_key.pem -out jwt_cert.pem -days 365 -subj "/CN=patchdb.se"
openssl pkcs12 -export -in jwt_cert.pem -inkey jwt_key.pem -out jwt_cert.pfx -passout pass:password

kubectl create secret generic jwt-cert-secret \
  -n patchdb \
  --from-file=jwt_cert.pem=jwt_cert.pem \
  --from-file=jwt_cert.pfx=jwt_cert.pfx \
  --from-literal=JWT_CERT_PASSWORD='password'
```

---

### 8. Run the github action pipelines to build and push container images to the repository

- ``.github/build-and-push-backend-dotnet.yaml``
- ``.github/build-and-push-backend-pything.yaml``

---

### 9. Apply the deployments and services

```
kubectl apply -f .kubernetes/03-backend-dotnet.yaml
kubectl apply -f .kubernetes/04-backend-dotnet.yaml
```

---

### 10. Frontend

TODO

---

### 11. Gateway

TODO