# Painel de alertas de seguranca

Este documento descreve o dashboard de seguranca que consolida logs, alertas e metricas para a Synvia Platform.

---

## 1. Objetivo
Fornecer uma visao centralizada de:
- Requisicoes suspeitas (rate limiting, IPs repetidos, user agents estranhos).
- Tentativas de autenticacao invalida.
- Status de servicos criticos (backend, IA, portal LGPD).

---

## 2. Fontes de dados
- **Backend (Spring Boot)**: logs estruturados (`security_monitor`, `RateLimitingFilter`).  
- **IA (Flask)**: middleware `security_monitor.py` registra IP, endpoint e status.  
- **Infra**: health checks `system_status.bat` e OTEL/bases de log quando habilitados.

---

## 3. Estrutura do painel
1. **Resumo geral**: status (Healthy/Warning/Critical) com base em thresholds configurados.  
2. **Timeline**: linhas do tempo por tipo de alerta (rate limit, erro 401, excecoes).  
3. **Tabela de eventos**: IP anonimizado, endpoint, mensagem, acao tomada.  
4. **Metricas**: requests por minuto, top endpoints, top user agents.  
5. **Acoes rapidas** (planejado): bloquear IP, exportar logs, abrir ticket.

---

## 4. Operacao padrao
1. Executar o script de monitoramento (quando disponivel) ou acessar `/api/monitoring/dashboard` (IA).  
2. Verificar se os contadores estao dentro do limite.  
3. Em caso de alerta:
   - Validar se se trata de trafego legitimo.  
   - Acionar bloqueio manual ou automatizado.  
   - Registrar ocorrencia (Jira/Service Desk).  
4. Exportar logs relevantes para auditoria.

---

## 5. Roadmap do painel
- Integrao com WebSocket para atualizacao em tempo real.  
- Notificacoes por email/Slack quando limites excedidos.  
- Exportacao CSV/JSON para analise externa.  
- Integracao com SIEM (Splunk, Elastic, Grafana Loki).  
- Dashboard executivo com agregados semanais/mensais.

---

## 6. Checklist de revisao
- [ ] Logs estruturados habilitados e armazenados com retencao definida.  
- [ ] Painel acessivel apenas a usuarios autorizados (perfil Admin/Security).  
- [ ] Health checks configurados (`/actuator/health`, `/api/monitoring/metrics`).  
- [ ] Alertas documentados e feedback aplicado no backlog.

---

> ltima revisao: outubro/2025

