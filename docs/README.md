# Indice de Documentacao - Synvia Platform

Este diretorio centraliza os materiais oficiais da Synvia Platform apos a migracao do contexto padaria para uma solucao modular multiempresa. Utilize as secoes abaixo para localizar rapidamente o conteudo.

---

## Guias operacionais (`guides/`)
- **[INICIO_RAPIDO.md](guides/INICIO_RAPIDO.md)** - sequencia resumida para subir IA, backend e frontend em modo HTTP.
- **[GUIA_EXECUCAO_COMPLETO.md](guides/GUIA_EXECUCAO_COMPLETO.md)** - preparacao detalhada, execucao, validacao e desligamento com HTTPS opcional.

## Seguranca (`security/`)
- **[HTTPS_CONFIGURATION.md](security/HTTPS_CONFIGURATION.md)** - ativacao do perfil HTTPS no Spring Boot.
- **[RATE_LIMITING_DDOS_PROTECTION.md](security/RATE_LIMITING_DDOS_PROTECTION.md)** - controles de rate limiting e mitigacao de abusos.
- **[RESOLVER_CERTIFICADO_SSL.md](security/RESOLVER_CERTIFICADO_SSL.md)** - troubleshooting de certificados.
- **[SECURITY_ALERTS_DOCUMENTATION.md](security/SECURITY_ALERTS_DOCUMENTATION.md)** - visao de metricas e alertas.

## Referencia tecnica (`technical/`)
- **[DOCUMENTACAO_TECNICA_COMPLETA.md](technical/DOCUMENTACAO_TECNICA_COMPLETA.md)** - arquitetura, integracoes, prioridades e backlog tecnico.

## Planejamento estrategico (`roadmap/`)
- **[ROADMAP_SYNVIA.md](roadmap/ROADMAP_SYNVIA.md)** - metas, marcos e prioridades consolidadas.

## Artefatos auxiliares
- Templates `.env`: `FrontGoDgital/.env.example`, `synvia-core/.env.example`, `ai_module/.env.example`.
- Scripts utilitarios: `start_system.bat`, `stop_system.bat`, `system_status.bat`, `test_sistema_seguranca.bat`.

---

### Convensoes
- Arquivos em Markdown mantidos sem acentuacao para evitar problemas de encoding.
- Links sao relativos a raiz de `docs/`.
- Registre alteracoes relevantes via pull request e atualize este indice.

> Ultima atualizacao: outubro/2025
