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
- ``.github/build-and-push-backend-python.yaml``
- ``.github/build-and-push-frontend.yaml``

---

### 9. Apply the deployments and services

```
kubectl apply -f .kubernetes/05-backend-dotnet.yaml
kubectl apply -f .kubernetes/06-backend-python.yaml
kubectl apply -f .kubernetes/07-frontend.yaml
```

### 10. Envoy Gateway

Install the Envoy Gateway [docs](https://gateway.envoyproxy.io/docs/tasks/quickstart/)
```
helm install eg oci://docker.io/envoyproxy/gateway-helm --version v1.6.1 -n envoy-gateway-system --create-namespace
```

Install cert-manager and enable Gateway API support
```
helm upgrade --install cert-manager oci://quay.io/jetstack/charts/cert-manager \
  --version v1.19.2 \
  --namespace cert-manager \
  --set config.apiVersion="controller.config.cert-manager.io/v1alpha1" \
  --set config.kind="ControllerConfiguration" \
  --set config.enableGatewayAPI=true \
  --create-namespace
  --set crds.enabled=true
```

Apply the GatewayClass, Gateway, HTTPRoute, ClusterIssuer and Certificate
```
kubectl apply -f .kubernetes/08-envoy-gateway.yaml
```