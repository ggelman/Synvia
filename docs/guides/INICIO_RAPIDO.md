# Inicio rapido (<= 5 minutos)

Guia objetivo para subir a Synvia Platform localmente em modo HTTP. Ideal para demos ou validacoes rapidas apos o clone do repositorio.

---

## 1. Pre-requisitos minimos
- Java 17+ com Maven no `PATH`
- Node.js 18 LTS + npm
- Python 3.10+
- Certificados locais ja presentes em `ssl_certificates/` (usados apenas se HTTPS for ativado)

---

## 2. Execucao automatizada (Windows)
1. Abra PowerShell na raiz do repositorio.
2. Execute:
   ```powershell
   .\start_system.bat
   ```
3. Aguarde cerca de 2 minutos enquanto IA (5001), backend (8080) e frontend (3000) sobem.
4. Acesse `http://localhost:3000`.

Para encerrar:
```powershell
.\stop_system.bat
```

---

## 3. Execucao manual (Windows, Linux ou macOS)
Use tres terminais separados a partir da raiz do projeto.

### 3.1 IA (porta 5001 HTTP)
```bash
cd ai_module
python -m venv .venv && source .venv/bin/activate   # opcional
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
set USE_HTTPS=false      # Linux/macOS: export USE_HTTPS=false
python ai_service.py
```

### 3.2 Backend Spring Boot (porta 8080)
```bash
cd synvia-core
mvn spring-boot:run
```

### 3.3 Frontend React (porta 3000)
```bash
cd FrontGoDgital
npm install
npm start
```

---

## 4. Verificacoes rapidas
- Frontend: `http://localhost:3000` exibe tela de login.
- Backend: `http://localhost:8080/actuator/health` deve retornar `{"status":"UP"}` com MySQL disponivel.
- IA: `http://localhost:5001/health` responde `{"status":"ok"}`.

Use `system_status.bat` (Windows) ou `lsof/netstat` para confirmar portas 3000/8080/5001.

---

## 5. Checks sugeridos apos o start
```bash
pytest -q                        # testes da IA
mvn clean verify                 # backend
npm run lint && npm test         # frontend
```

---

## 6. Troubleshooting rapido
| Sintoma | Causa provavel | Acao |
| --- | --- | --- |
| Porta ocupada | Processo antigo ativo | Rodar `stop_system.bat` ou finalizar manualmente |
| Erro MySQL 1045 | Credencial incorreta | Ajustar `DB_USERNAME/DB_PASSWORD` e reiniciar API |
| IA sem resposta | Modelos nao carregados | Chamar `/api/ai/update-data` ou rodar `model_trainer.py` |
| Falha no login | Backend offline ou MFA pendente | Verificar `mvn spring-boot:run` e seguir configuracao MFA |

---

## 7. Referencias
- Guia completo: [GUIA_EXECUCAO_COMPLETO.md](GUIA_EXECUCAO_COMPLETO.md)
- Documentacao tecnica: [../technical/DOCUMENTACAO_TECNICA_COMPLETA.md](../technical/DOCUMENTACAO_TECNICA_COMPLETA.md)
- Roadmap: [../roadmap/ROADMAP_SYNVIA.md](../roadmap/ROADMAP_SYNVIA.md)
