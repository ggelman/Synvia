# Troubleshooting de certificados SSL

Guia rapido para resolver problemas comuns ao usar os certificados locais da Synvia Platform.

---

## 1. Arquivos esperados
- `ssl_certificates/server.crt`
- `ssl_certificates/server.key`
- `ssl_certificates/keystore.p12`

Se algum arquivo estiver ausente, gere novamente usando os scripts `generate_ssl_certs.ps1` ou `.sh`.

---

## 2. Erros frequentes

| Erro | Causa provavel | Correcao |
| --- | --- | --- |
| `java.io.FileNotFoundException` | Caminho incorreto em `application-https.properties` | Ajustar path relativo (`./ssl_certificates/keystore.p12`). |
| `Keystore was tampered with, or password incorrect` | Senha diferente de `synvia123` (padrao) | Redefinir senha ou atualizar propriedade `server.ssl.key-store-password`. |
| `ssl.SSLError: PEM lib` no Flask | Arquivo `.crt` ou `.key` corrompido | Regenerar certificado, garantir que `server.crt` e `server.key` estejam pareados. |
| Navegador exibindo aviso de site inseguro | Certificado autoassinado | Importar `server.crt` na trust store local ou prosseguir com excecao temporaria. |

---

## 3. Passo a passo de diagnostico
1. Verifique paths nos arquivos de configuracao.  
2. Confirme permissoes de leitura dos certificados.  
3. Rode `openssl x509 -in server.crt -noout -text` para validar o certificado.  
4. Para o keystore, execute `keytool -list -keystore keystore.p12 -storetype PKCS12`.  
5. Reinicie o servico para aplicar alteracoes.

---

## 4. Boas praticas
- Use certificados autoassinados apenas em ambientes de desenvolvimento.  
- Em producao, utilize certificados confiaveis (Lets Encrypt, ACM, etc.).  
- Rotacione certificados periodicamente e mantenha senhas seguras.  
- Documente qualquer alteracao de caminho ou senha para o time.

---

> ltima reviso: outubro/2025

