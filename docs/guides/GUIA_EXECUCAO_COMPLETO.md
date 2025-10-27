# Guia completo de execucao

Procedimento detalhado para preparar e executar todos os modulos da Synvia Platform em ambientes locais, incluindo opcao HTTPS quando necessario.

---

## 1. Pre-requisitos

| Componente | Versao recomendada | Verificacao |
| --- | --- | --- |
| Java | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18 LTS | `node --version` |
| npm | 8+ | `npm --version` |
| Python | 3.10+ | `python --version` |

Em Windows recomenda-se PowerShell ou WSL para melhor compatibilidade.

---

## 2. Preparacao dos ambientes

### 2.1 IA (`ai_module`)
```bash
cd ai_module
python -m venv .venv          # opcional
source .venv/bin/activate     # Linux/macOS
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
```
Configurar no `.env` o acesso ao MySQL e as chaves de LLM:
- `OPENAI_API_KEY`: chave obrigatoria e preferencial.
- `GEMINI_API_KEY`: fallback caso esteja disponivel.
- Ajustar ainda `MODEL_SAVE_PATH`, `DATA_COLLECTION_INTERVAL`, `PREDICTION_HORIZON`, `CONFIDENCE_THRESHOLD` se necessario.

### 2.2 Frontend (`FrontGoDgital`)
```bash
cd FrontGoDgital
npm install
cp .env.example .env
```
No `.env`, confirme `REACT_APP_API_URL=http://localhost:8080`.

### 2.3 Backend (`synvia-core`)
```bash
cd synvia-core
cp .env.example .env   # quando o template estiver disponivel
```
Carregue `DB_USERNAME` e `DB_PASSWORD` no ambiente antes de executar (`set`/`export`) para apontar para o mesmo MySQL usado pela IA.

### 2.4 Certificados para HTTPS
Certificados autoassinados ja estao em `ssl_certificates/`. Para habilitar TLS:
- Backend: `mvn spring-boot:run -Dspring-boot.run.profiles=https`
- IA: definir `USE_HTTPS=true` e garantir `server.crt` + `server.key`.

---

## 3. Inicializacao dos modulos

### 3.1 IA (HTTP)
```bash
cd ai_module
set USE_HTTPS=false        # Linux/macOS: export USE_HTTPS=false
python ai_service.py
```
Endpoints principais:
- `POST /api/ai/predict`
- `GET /api/ai/predict-all`
- `POST /api/ai/generate-insight` (OpenAI preferencial com fallback Gemini)
- `GET /api/monitoring/metrics`

### 3.2 Backend
```bash
cd synvia-core
mvn spring-boot:run
```
Principais rotas:
- `GET /api/actuator/health`
- `POST /api/auth/login`
- APIs LGPD em `/api/lgpd/*`

### 3.3 Frontend
```bash
cd FrontGoDgital
npm start
```
Interface em `http://localhost:3000` com fluxo MFA para administradores.

---

## 4. Verificacoes pos-start

1. `http://localhost:8080/actuator/health` -> `{"status":"UP"}`.
2. `http://localhost:5001/health` -> `{"status":"ok"}`.
3. Login via `admin@synvia.io / admin123` configurando MFA.
4. `system_status.bat` confirma portas 3000/8080/5001.

---

## 5. Desligamento
- IA: `Ctrl+C` no terminal ou fechar janela aberta pelo script.
- Backend: `Ctrl+C` no Maven.
- Frontend: `Ctrl+C` no terminal `npm start`.
- Scripts Windows: `.\stop_system.bat`.

---

## 6. Testes recomendados
```bash
cd ai_module && pytest -q
cd synvia-core && mvn clean verify
cd FrontGoDgital && npm run lint && npm test
```

---

## 7. Troubleshooting

| Sintoma | Diagnostico | Acao |
| --- | --- | --- |
| Erro MySQL 1045 | Credenciais invalidas | Revisar `DB_USERNAME/DB_PASSWORD` em variaveis de ambiente e `.env` |
| IA sem dados | Collector nao executou | `POST /api/ai/update-data` ou rodar `data_collector.py` |
| LLM indisponivel | Falha com OpenAI | Checar chave; Gemini atua como fallback |
| CORS no frontend | Backend em URL diferente | Ajustar `proxy` ou `REACT_APP_API_URL` |

---

## 8. Checklist de liberacao
- [ ] Variaveis de ambiente revisadas (`.env` atualizados).
- [ ] Health checks respondendo `UP`.
- [ ] Previsoes `POST /api/ai/predict` entregando dados.
- [ ] Fluxo de login + MFA validado.
- [ ] Portal LGPD acessivel (registrar gaps).
- [ ] Logs sem erros criticos.

---

## 9. Referencias adicionais
- Guia rapido: [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
- Documentacao tecnica: [../technical/DOCUMENTACAO_TECNICA_COMPLETA.md](../technical/DOCUMENTACAO_TECNICA_COMPLETA.md)
- Roadmap consolidado: [../roadmap/ROADMAP_SYNVIA.md](../roadmap/ROADMAP_SYNVIA.md)
