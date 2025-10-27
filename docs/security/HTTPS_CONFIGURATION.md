# HTTPS - Guia de configuracao

Este guia descreve como ativar HTTPS nos principais componentes da Synvia Platform utilizando os certificados autoassinados presentes em `ssl_certificates/`.

---

## 1. Certificados locais
- `ssl_certificates/server.crt` - certificado publico.
- `ssl_certificates/server.key` - chave privada.
- `ssl_certificates/keystore.p12` - keystore PKCS12 para o backend.
- Validade padro: 365 dias, dominio `localhost`.

---

## 2. Backend (Spring Boot)
1. Copie `keystore.p12` para `synvia-core/ssl_certificates` (ja versionado).  
2. Execute:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=https
   ```
3. O servidor sobe em `https://localhost:8443/api`.  
4. Ajustes principais em `application-https.properties`:
   - `server.ssl.key-store=./ssl_certificates/keystore.p12`
   - `server.ssl.key-store-password=synvia123`
   - `server.ssl.trust-store` (mesmo arquivo)  
   - Certifique-se de atualizar a senha em ambientes reais.

---

## 3. IA (Flask)
1. Garanta os arquivos `server.crt` e `server.key` em `ssl_certificates/`.  
2. Defina `USE_HTTPS=true` e, opcionalmente, `AI_SERVICE_PORT=5443`.  
3. Execute `python ai_service.py`.  
4. Endpoints ficam em `https://localhost:5443`.  
5. Caso os certificados no existam, o servio cai automaticamente para HTTP (porta 5001).

---

## 4. Frontend (React)
O projeto roda em HTTP por padro. Para testes com HTTPS:
1. Configure `HTTPS=true` e `SSL_CRT_FILE` / `SSL_KEY_FILE` apontando para os certificados.  
2. Atualize `REACT_APP_API_URL` para a URL segura do backend.  
3. Considere usar proxy (ou `npm start --https`) apenas em ambientes controlados.

---

## 5. Boas praticas
- No submeter certificados reais ao repositrio.  
- Rotacionar certificados periodicamente em produo.  
- Considerar Lets Encrypt ou ACM para ambientes reais.  
- Validar se ferramentas externas (Postman, curl) confiam no certificado local; se necessrio importe o `.crt` na trust store do sistema.  
- Manter `USE_HTTPS=false` e executar scripts em HTTP ao desenvolver, habilitando HTTPS apenas quando necessrio.

---

> ltima reviso: outubro/2025

