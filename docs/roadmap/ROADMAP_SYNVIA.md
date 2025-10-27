# Synvia Platform - Roadmap Consolidado

_Atualizado em: outubro/2025_

---

## Visao geral
A plataforma evoluiu do projeto voltado a uma unica padaria para uma suite modular aplicavel a diferentes empresas. Os ambientes locais rodam em HTTP (Frontend 3000, Core API 8080, IA 5001) com suporte opcional a HTTPS.

### Status resumido
| Dominio | Status atual | Destaques | Pontos de atencao |
| --- | --- | --- | --- |
| **IA (Flask)** | 70% | Modelos Prophet operando, orquestrador LLM com OpenAI prioritario e Gemini como fallback, monitoramento basico. | Dados e prompts ainda carregam contexto padaria, retreinamento manual, falta pipeline automatizada. |
| **Portal LGPD (Backend + Front)** | 60% | Endpoints principais implementados, fluxo MFA ativo. | Falta cobertura completa das solicitacoes, mensagens ainda especificas, UI necessita ajustes. |
| **Blockchain** | 10% | POC em planejamento. | Definir caso de uso (auditoria consentimentos/insights), escolher stack, estimar integracao. |
| **Backend geral** | 75% | Autenticacao e MFA estaveis, endpoints otimizados para HTTP, scripts de start/stop consolidados. | Observabilidade OTEL pendente, secrets hardcoded em alguns pontos, automatizacoes faltantes. |
| **UI/UX** | 50% | Login com MFA e dashboards iniciais. | Layout e linguagem ainda sao herdados, necessidade de refatorar componentes LGPD e alinhar branding Synvia. |

Prioridades confirmadas:  
1. Inteligencia Artificial  
2. Portal LGPD  
3. Blockchain  
4. Backend geral  
5. UI/UX

---

## Linha do tempo sugerida

### Curto prazo (0-2 sprints)
1. **IA**
   - Substituir datasets e prompts padronizados por dados genericos multiempresa.  
   - Implementar script de bootstrap de dados e scheduler de retreinamento.  
   - Habilitar logs estruturados e desativar OTLP quando nao houver collector.  
2. **Portal LGPD**
   - Revisar controlador e repositorios para fluxo completo de solicitacoes.  
   - Ajustar textos e componentes do frontend para linguagem Synvia.  
3. **Infra**
   - Ajustar carregamento de variaveis `DB_USERNAME/DB_PASSWORD` via `.env`.  
   - Documentar configuracoes atualizadas (guia rapido e completo).

### Medio prazo (3-6 sprints)
- IA: incorporar monitoramento de drift automatico, escalonar testes `pytest`.  
- LGPD: publicar auditoria consolidada e criar relatorios exportaveis.  
- Blockchain: escolher plataforma, definir modelo de dados e prototipo de prova de existencia para consentimentos.  
- Backend: instrumentar OpenTelemetry, reforcar politica de secrets.  
- UI/UX: redesenhar dashboards LGPD, criar design system simples.

### Longo prazo (>6 sprints)
- Multi-tenant completo com RBAC por cliente.  
- Integrao de eventos (Kafka ou similar) para notificar Portal LGPD e blockchain.  
- Integracao de eventos (Kafka ou similar) para notificar Portal LGPD e blockchain.

---

## Tarefas curtas priorizadas
| Modulo | Tarefa | Resultado esperado |
| --- | --- | --- |
| IA | Atualizar `data_collector.py` e `fallback_data` para dataset generico; revisar prompts do orquestrador | Predict e insights agnosticos a dominio |
| IA | Automatizar retreinamento (scheduler ou endpoint cron) e registrar metricas chave | Modelos sempre atualizados, logs acessiveis |
| Portal LGPD | Completar fluxo de solicitacoes (CRUD, auditoria, notificacoes) e alinhar textos | Portal funcional multiempresa |
| Backend | Desativar OTLP por padrao, revisar secrets e health checks | Logs limpos, operacao padronizada |
| UI/UX | Refatorar telas LGPD (componentes reutilizaveis, toasts padronizados) | Melhor experiencia inicial |
| Blockchain | Elaborar proposta tecnica (requisitos, stack, marco inicial) | Plano aprovado para proxima fase |

---

## Indicadores de pronto
- IA entregando previsoes e insights genericos, retreinamento automatizado, logs sem warnings Tomcat/OTLP.  
- Portal LGPD cobrindo registros, consultas e auditoria com linguagem Synvia.  
- Documento tecnico sem referencias a padaria; roadmap alinhado com este arquivo.  
- Decisao sobre blockchain documentada e backlog criado.  
- Frontend com componentes LGPD refatorados e mensagens atualizadas.

---

> Mantenha este roadmap sincronizado com as atualizacoes do backlog e dos guias operacionais.



