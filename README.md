# Synvia Platform  Onde estrutura encontra fluidez

Synvia  um ecossistema modular que transforma operaes complexas em experincias claras. O monorepo rene:

- **Synvia Front (FrontGoDgital/)**: SPA em React 18 com autenticao JWT, dashboards configurveis e mdulos plugveis.
- **Synvia Core (synvia-core/)**: Spring Boot 3.5.x para orquestrao operacional, segurana e integraes.
- **Synvia Intelligence (ai_module/)**: Flask + ML/LLM (Prophet, OpenAI, Gemini) com cache e monitoramento estruturado.

O ambiente local executa **em HTTP por padro** (3000 / 8080 / 5001), com suporte opcional a HTTPS documentado.

> Estado atual: Front 85%  Core 85%  Intelligence 80%  Infra/DevSecOps 70%  
> ltima reviso: outubro/2025

---

## Arquitetura em alto nvel
`
Synvia Front (3000) --> Synvia Core API (8080) --> Synvia Intelligence (5001)
           |                 |                         |
           +-----------------+-------------------------+
                     Servios Compartilhados: MySQL  Redis  Observabilidade
`

---

## Execuo rpida (modo HTTP)
1. Copie os templates .env:
   `bash
   cp FrontGoDgital/.env.example FrontGoDgital/.env
   cp synvia-core/.env.example synvia-core/.env
   cp ai_module/.env.example ai_module/.env
   `
   Ajuste as variveis conforme necessrio (URLs, credenciais, chaves LLM).
   Garanta que as credenciais do MySQL estejam definidas em synvia-core/.env e ai_module/.env.
2. Em trs terminais diferentes:
   `bash
   # Terminal 1  IA (porta 5001)
   cd ai_module
   python -m venv .venv && source .venv/bin/activate  # opcional
   pip install -r requirements.txt
   export USE_HTTPS=false  # PowerShell: ="false"
   python ai_service.py

   # Terminal 2  Core API (porta 8080)
   cd synvia-core
   mvn spring-boot:run

   # Terminal 3  Frontend (porta 3000)
   cd FrontGoDgital
   npm install
   npm start
   `
3. Acesse http://localhost:3000. Credenciais padro: admin@synvia.io / admin123.
4. Health-checks: http://localhost:8080/actuator/health e http://localhost:5001/health.

> Automatizao: execute start_system.bat (PowerShell ou Prompt de Comando) para iniciar os trs mdulos em HTTP.

Scripts utilitrios:
- start_system.bat / stop_system.bat  orquestram/encerram todos os servios.
- system_status.bat  verifica portas e health checks (3000/8080/5001).
- 	est_sistema_seguranca.bat  smoke tests de conectividade.

---

## Estrutura do repositrio
`
FrontGoDgital/          # Synvia Front (React)
synvia-core/            # Synvia Core API (Spring Boot)
ai_module/              # Synvia Intelligence (Flask/ML)
llm-gateway/            # Gateway experimental para orquestrao LLM
docs/                   # Documentao oficial (ndice em docs/README.md)
ssl_certificates/       # Certificados autoassinados (uso opcional)
start_system.bat        # Bootstrap em HTTP
system_status.bat       # Diagnstico das portas
`

---

## Documentao essencial
- ndice geral: [docs/README.md](docs/README.md)
- Guias operacionais: [docs/guides/](docs/guides)
- Segurana: [docs/security/](docs/security)
- Referncia tcnica: [docs/technical/DOCUMENTACAO_TECNICA_COMPLETA.md](docs/technical/DOCUMENTACAO_TECNICA_COMPLETA.md)
- Roadmap unificado: [docs/roadmap/ROADMAP_SYNVIA.md](docs/roadmap/ROADMAP_SYNVIA.md)

---

## Roadmap resumido
- **Front**: modularizar pginas LGPD, adicionar testes, incluir widget Synvia Insights.
- **Core**: MFA/WebAuthn, llm-gateway com mTLS, observabilidade (OpenTelemetry).
- **IA**: atualizar SDKs, orquestrar mltiplos provedores, ampliar testes pytest.
- **Infra**: pipeline CI/CD unificado, scripts multi-OS/Docker compose, gesto de segredos (Vault).

Detalhamento completo em [docs/roadmap/ROADMAP_SYNVIA.md](docs/roadmap/ROADMAP_SYNVIA.md).

---

## Contribuindo
1. Leia os guias em docs/.
2. Crie branches temticos (feat/, chore/, docs/) com commits semnticos.
3. Execute os testes relevantes (pytest, mvn clean verify, 
pm test).
4. Em PRs, registre impactos e validaes  equilbrio entre estrutura e fluidez  o ritmo Synvia.
