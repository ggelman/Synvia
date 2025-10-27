#!/bin/bash
# Script para gerar certificados SSL self-signed para desenvolvimento

echo " Gerando Certificados SSL para todos os servios..."

# Criar diretrio se no existir
mkdir -p ssl_certificates

# Gerar chave privada
openssl genrsa -out ssl_certificates/server.key 2048

# Gerar certificado self-signed vlido por 365 dias
openssl req -new -x509 -key ssl_certificates/server.key -out ssl_certificates/server.crt -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=GoDigital/OU=Development/CN=localhost"

# Gerar certificado em formato PEM para Python/Flask
cp ssl_certificates/server.crt ssl_certificates/server.pem
cat ssl_certificates/server.key >> ssl_certificates/server.pem

# Gerar keystore para Java/Spring Boot (PKCS12)
openssl pkcs12 -export -in ssl_certificates/server.crt -inkey ssl_certificates/server.key -out ssl_certificates/keystore.p12 -name localhost -password pass:synvia123

echo " Certificados SSL gerados com sucesso!"
echo " Arquivos criados:"
echo "   - server.key (chave privada)"
echo "   - server.crt (certificado)"
echo "   - server.pem (para Python/Flask)"
echo "   - keystore.p12 (para Java/Spring Boot)"
echo ""
echo " Senha do keystore: synvia123"