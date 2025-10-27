# Documentacao tecnica consolidada - Synvia Platform

Visao atualizada da plataforma Synvia, incluindo integracoes, pendencias herdadas da fase padaria e plano de evolucao priorizado (IA -> Portal LGPD -> Blockchain -> Backend geral -> UI/UX).

---

## 1. Arquitetura em alto nivel

| Modulo | Porta (HTTP) | Descricao |
| --- | --- | --- |
| FrontGoDgital (React) | 3000 | SPA para autenticacao, dashboards e portal LGPD. |
| synvia-core (Spring Boot) | 8080 | API principal: autenticao, LGPD, integracoes, MFA, observabilidade. |
| ai_module (Flask) | 5001 | Previsoes, analytics e insights com Prophet + LLMs. |

Todos os modulos compartilham o banco MySQL `synvia_platform`. Redis e opcional para cache da IA. Certificados autoassinados suportam HTTPS (5443 para IA, 8443 para backend).

---

## 2. Configuracoes principais

### 2.1 IA (`ai_module`)
- `.env` define `DB_*`, `OPENAI_API_KEY` (preferencial) e `GEMINI_API_KEY` (fallback).
- Flags relevantes:
  - `USE_HTTPS` (default true) - definir `false` para ambiente local.
  - `MODEL_SAVE_PATH`, `DATA_COLLECTION_INTERVAL=24`, `PREDICTION_HORIZON=7`, `CONFIDENCE_THRESHOLD=0.8`.
  - `ENABLE_MODEL_MONITORING=true`, `DRIFT_DETECTION_THRESHOLD=0.1`, `RETRAINING_FREQUENCY=168` horas.
- Cache Redis configuravel via `REDIS_HOST/PORT/DB/PASSWORD`; degrade para cache em memoria quando indisponivel.

### 2.2 Backend (`synvia-core`)
- `application.properties` aponta para `jdbc:mysql://localhost:3306/synvia_platform`.
- Variaveis `DB_USERNAME` e `DB_PASSWORD` devem estar no ambiente do processo (PowerShell, bash, etc.).
- Security:
  - MFA obrigatorio para administradores.
  - Secrets JWT (`jwt.secret`, `jwt.refresh.secret`) precisam de estrategia de rotacao.
  - `management.*` ja expoe health/info/metrics; endpoints OTEL configurados para futura coleta.

### 2.3 Frontend (`FrontGoDgital`)
- `.env` controla `REACT_APP_API_URL`.
- Fluxo de login com MFA e credenciais padrao `admin@synvia.io / admin123`.
- Branding e copys ainda trazem termos padaria, exigindo revisao.

---

## 3. Modulo de IA em detalhes

### 3.1 API Flask (`ai_service.py`)
- **Forecast**: `POST /api/ai/predict` (retorna previsao Prophet com intervalos).  
- **Batch**: `GET /api/ai/predict-all`, `POST /api/ai/retrain`, `POST /api/ai/update-data`.  
- **Produtos**: `GET /api/ai/products`.  
- **Insights / chatbot**: `POST /api/ai/generate-insight`.  
  - Orquestrador (`orchestrator.py`) usa OpenAI como primeira opcao (`gpt-3.5-turbo` por padrao) e Gemini como fallback (peso 3) quando a chave estiver presente.  
- **Monitoramento**: `/api/monitoring/metrics`, `/api/monitoring/dashboard`, `/api/health/robust`.  
- **Cache**: `/api/ai/cache/info`, `/clear`, `/warm-up`.  
- **Seguranca**: rate limiting `200/day` e `50/hour`, middleware `security_monitor.py` com logs estruturados.

### 3.2 Pipeline de dados e modelos
- **Coleta** (`data_collector.py`): extrai vendas do MySQL (tabelas herdadas da padaria) e gera `processed_sales_data.csv`.
- **Treinamento** (`model_trainer.py`, `hyperparameter_optimization.py`): modelos Prophet por produto salvos em `trained_models/`.
- **Retreinamento** (`model_retrainer.py` + endpoint `/api/ai/retrain`).
- **Fallback** (`fallback_service.py`, `fallback_data/`): dados estaticos para operacao offline.
- **Monitoramento** (`monitoring_system.py`): metricas de desempenho, drift e logs JSON.

### 3.3 Pontos de atencao atuais
- Data sets, prompts e mensagens ainda referenciam o dominio padaria.
- Dependencia de chave OpenAI valida; fallback Gemini requer chave opcional.
- Retreinamento somente manual (trigger via endpoint).
- Observabilidade depende de consumo manual dos endpoints (nao integrado ao backend).

---

## 4. Migracao padaria -> Synvia

| Item | Localizacao | Acoes sugeridas |
| --- | --- | --- |
| Dados de vendas especificos | `ai_module/fallback_data/*.csv`, `processed_sales_data.csv` | Substituir por dados genericos multiempresa; criar script de bootstrap. |
| Terminologia padaria em documentacao/UI | `docs/**`, `README.md`, `monitoring_dashboard.html`, textos de logs e prompts | Revisar linguagem para "cliente Synvia" ou parametrizar por tenant. |
| Branding especifico | `FrontGoDgital/src/config/branding.js` e assets | Definir identidade Synvia modular e extrair configuracoes por tenant. |
| APIs LGPD especificas | `synvia-core/src/main/java/.../lgpd` | Ajustar para fluxo multicliente (solicitacoes, auditoria, notificacoes). |
| Prompts IA com cardapio padaria | `ai_module/analytics_pipeline.py`, `generate_insight_with_fallback`, fallback LLM | Reescrever prompts e fallback data para segmentos configuraveis. |
| Documentacao com encoding quebrado | `docs/**` | Continuidade da revisao (indice, guias e tecnico ja atualizados). |
| Testes com dados padaria | `ai_module/tests`, `synvia-core` | Atualizar fixtures e asserts para dados genericos. |

---

## 5. Roadmap tecnico priorizado

### 5.1 Foco atual - Inteligencia Artificial
1. **Dados e modelos**
   - Criar dataset generico (multiempresa, multi produto).
   - Adaptar `model_trainer.py` e `analytics_pipeline.py` para suportar segmentos configuraveis.
   - Automatizar retreinamento (scheduler ou integracao com backend).
   - Garantir que o cache Redis esteja opcional mas testado.
2. **LLM / Chatbot**
   - Validar chave OpenAI (obrigatoria) e manter Gemini como fallback.
   - Adicionar metadados por tenant nos prompts.
   - Registrar conversas e metricas para auditoria em MySQL.
3. **Observabilidade**
   - Integrar metricas da IA ao backend (via OTEL ou exporters).
   - Criar alertas para drift e falhas de providers.

### 5.2 Portal LGPD
- Revisar endpoints, garantir cadastros e auditorias multicliente.
- Documentar no Swagger e adicionar testes de integracao.
- Criar backlog especifico para fluxo de solicitacoes pendentes.

### 5.3 Blockchain
- Definir requisito (ex.: registrar consentimentos ou trilha de IA).
- Avaliar stack (Hyperledger, Quorum, Polygon zkEVM etc.).
- Planejar modulo ou microservico dedicado, integrado ao backend via APIs seguras.

### 5.4 Backend geral
- Revisar secrets (JWT, MFA, refresh tokens) e rotacao.
- Sanear referencias padaria em responses/logs.
- Ampliar testes unitarios e de integracao.
- Planejar instrumentacao OTEL (frontend -> backend -> IA).

### 5.5 UI/UX
- Apos estabilizar backend/IA, redesenhar fluxos, identidade e acessibilidade.
- Atualizar textos, removes termos padaria, preparar temas multiempresa.

---

## 6. Tarefas imediatas recomendadas

1. **IA**
   - Atualizar prompts, fallback data e datasets.
   - Implementar script de bootstrap multiempresa.
   - Garantir previsoes e insights operando com OpenAI preferencial.
2. **Portal LGPD**
   - Mapear endpoints faltantes, corrigir respostas e integrar com MySQL.
3. **Blockchain**
   - Levantar requisitos e definir POC (ex.: registro de consentimento).
4. **Backend**
   - Consolidar carregamento de `DB_USERNAME/DB_PASSWORD` via `.env` + environment.
   - Preparar ativacao de OTEL quando coletor estiver disponivel.
5. **Documentacao**
   - Manter arquivos livres de problemas de encoding.
   - Usar este documento como fonte unica de estado tecnico.

---

## 7. Referencias rapidas
- Guia rapido: `docs/guides/INICIO_RAPIDO.md`
- Guia completo: `docs/guides/GUIA_EXECUCAO_COMPLETO.md`
- Roadmap: `docs/roadmap/ROADMAP_SYNVIA.md`
- Scripts utilitarios: `start_system.bat`, `system_status.bat`, `test_sistema_seguranca.bat`

---

> Responsavel: equipe Synvia Platform  
> Ultima revisao: outubro/2025

