# Rate limiting e protecao contra abuso

Este documento resume como a Synvia Platform limita requisicoes e protege contra trafego malicioso em cada modulo.

---

## 1. Visao geral
- **Frontend**: depende das protecoes da API; pode exibir mensagens de erro amigaveis e aplicar debounce em formularios sensiveis.
- **Backend (Spring Boot)**:
  - Usa filtros customizados (ex.: `RateLimitingFilter`) que podem ser ativados via `app.rate-limiting.enabled=true`.
  - Recomenda-se usar buckets por IP e tambem por usuario autenticado.
  - Logs estruturados ajudam a detectar comportamentos suspeitos.
- **IA (Flask)**:
  - `flask_limiter` configurado com limites padrao `200/day` e `50/hour` (ver `ai_service.py`).
  - Rotas criticas (`/predict`, `/generate-insight`) podem ganhar limites dedicados no futuro.

---

## 2. Configuracao recomendada

### Backend
```properties
app.rate-limiting.enabled=true
app.rate-limiting.limit=100
app.rate-limiting.window-minutes=1
```
Combinar com cache distribuido (ex.: Redis) para instancias multiplas.

### IA
No arquivo `ai_service.py`:
```python
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```
Pode-se definir limites especificos usando `@limiter.limit("20/minute")` por rota.

---

## 3. Resposta padrao a abuso
1. Registrar IP, endpoint e user-agent (`security_monitor.py`).  
2. Retornar HTTP 429 (Too Many Requests) com corpo JSON padronizado.  
3. Opcional: bloquear IP temporariamente (firewall ou WAF).  
4. Monitorar em dashboards (Elastic, Grafana, etc.).

---

## 4. Checklist
- [ ] Limite global configurado para cada modulo.  
- [ ] Logs com contexto suficiente para auditoria.  
- [ ] Alertas quando a taxa de rejeicoes ultrapassa limite definido.  
- [ ] Documentacao atualizada para o time de suporte.  
- [ ] Testes de carga periodicos para validar thresholds.

---

## 5. Proximos passos
- Implementar configuracao por rota (ex.: `/auth/login`, `/api/ai/generate-insight`).  
- Integrar com SIEM para detecao de ataques distribudos.  
- Avaliar uso de CDN/WAF (Cloudflare, AWS WAF) para ambientes externos.  
- Adicionar painel de administracao exibindo estatisticas (requests/min, bloqueios).

---

> ltima reviso: outubro/2025

