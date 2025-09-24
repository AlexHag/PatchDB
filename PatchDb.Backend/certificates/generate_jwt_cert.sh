openssl genrsa -out jwt_key.pem 4096

openssl req -new -x509 -key jwt_key.pem -out jwt_cert.pem -days 365 -subj "/CN=patchdb.se"

openssl pkcs12 -export -in jwt_cert.pem -inkey jwt_key.pem -out jwt_cert.pfx -passout pass:password
