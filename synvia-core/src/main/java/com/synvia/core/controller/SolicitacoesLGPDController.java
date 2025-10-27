package com.synvia.core.controller;

import com.synvia.core.model.SolicitacaoLGPD;
import com.synvia.core.model.LogAuditoria;
import com.synvia.core.repository.SolicitacaoLGPDRepository;
import com.synvia.core.repository.ClienteRepository;
import com.synvia.core.repository.LogAuditoriaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/public/lgpd/solicitacoes")
@CrossOrigin(origins = "*")
public class SolicitacoesLGPDController {

    private static final String CLIENTE_ID_PREFIX = "CLIENTE_ID_";
    private static final String PROTOCOLO_PREFIX = "Protocolo: ";
    private static final String IP_SUFFIX = ", IP: ";
    private static final String SUCCESS_KEY = "success";
    private static final String MESSAGE_KEY = "message";

    private final SolicitacaoLGPDRepository solicitacaoRepository;
    private final ClienteRepository clienteRepository;
    private final LogAuditoriaRepository logAuditoriaRepository;

    public SolicitacoesLGPDController(SolicitacaoLGPDRepository solicitacaoRepository,
                                      ClienteRepository clienteRepository,
                                      LogAuditoriaRepository logAuditoriaRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.clienteRepository = clienteRepository;
        this.logAuditoriaRepository = logAuditoriaRepository;
    }

    @PostMapping("/nova-solicitacao")
    public ResponseEntity<Map<String, Object>> criarSolicitacao(@RequestBody NovaSolicitacaoDTO solicitacaoDTO,
                                              HttpServletRequest request) {
        try {
            // Validar se o cliente existe (apenas validação, sem usar a variável)
            clienteRepository.findById(solicitacaoDTO.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

            // Gerar protocolo único
            String protocolo = "LGPD-" + System.currentTimeMillis() + "-" + 
                             UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // Criar nova solicitação
            SolicitacaoLGPD novaSolicitacao = new SolicitacaoLGPD();
            novaSolicitacao.setProtocolo(protocolo);
            novaSolicitacao.setUsuarioId(solicitacaoDTO.getUsuarioId());
            novaSolicitacao.setTipoSolicitacao(solicitacaoDTO.getTipoSolicitacao());
            novaSolicitacao.setMotivo(solicitacaoDTO.getMotivo());
            novaSolicitacao.setDataSolicitacao(LocalDateTime.now());
            novaSolicitacao.setStatus(SolicitacaoLGPD.Status.PENDENTE);
            novaSolicitacao.setIpOrigem(getClientIpAddress(request));

            SolicitacaoLGPD solicitacaoSalva = solicitacaoRepository.save(novaSolicitacao);

            // Log de auditoria
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + solicitacaoDTO.getUsuarioId());
            auditLog.setAcao("NOVA_SOLICITACAO_LGPD");
            auditLog.setDetalhes(PROTOCOLO_PREFIX + protocolo + 
                               ", Tipo: " + solicitacaoDTO.getTipoSolicitacao() + 
                               IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Solicitação criada com sucesso",
                "protocolo", protocolo,
                "prazoResposta", "15 dias úteis",
                "solicitacaoId", solicitacaoSalva.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao criar solicitação: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/consultar/{protocolo}")
    public ResponseEntity<Map<String, Object>> consultarSolicitacao(@PathVariable String protocolo,
                                                  @RequestParam Long usuarioId,
                                                  HttpServletRequest request) {
        try {
            // Buscar solicitação
            SolicitacaoLGPD solicitacao = solicitacaoRepository.findByProtocolo(protocolo)
                    .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

            // Verificar se a solicitação pertence ao usuário
            if (!solicitacao.getUsuarioId().equals(usuarioId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    SUCCESS_KEY, false,
                    MESSAGE_KEY, "Solicitação não pertence ao usuário"
                ));
            }

            // Log de auditoria
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + usuarioId);
            auditLog.setAcao("CONSULTA_SOLICITACAO_LGPD");
            auditLog.setDetalhes(PROTOCOLO_PREFIX + protocolo + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                "solicitacao", Map.of(
                    "protocolo", solicitacao.getProtocolo(),
                    "tipo", solicitacao.getTipoSolicitacao(),
                    "status", solicitacao.getStatus(),
                    "dataSolicitacao", solicitacao.getDataSolicitacao(),
                    "dataConclusao", solicitacao.getDataConclusao(),
                    "resposta", solicitacao.getResposta(),
                    "motivo", solicitacao.getMotivo()
                )
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao consultar solicitação: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/listar/{usuarioId}")
    public ResponseEntity<Map<String, Object>> listarSolicitacoes(@PathVariable Long usuarioId,
                                               HttpServletRequest request) {
        try {
            // Validar se o cliente existe (apenas validação, sem usar a variável)
            clienteRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

            // Buscar todas as solicitações do usuário
            List<SolicitacaoLGPD> solicitacoes = solicitacaoRepository.findByUsuarioIdOrderByDataSolicitacaoDesc(usuarioId);

            // Log de auditoria
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + usuarioId);
            auditLog.setAcao("LISTAGEM_SOLICITACOES_LGPD");
            auditLog.setDetalhes("Consulta de todas as solicitações do usuário" + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                "solicitacoes", solicitacoes
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar solicitações: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/cancelar-solicitacao")
    public ResponseEntity<Map<String, Object>> cancelarSolicitacao(@RequestBody CancelamentoDTO cancelamentoDTO,
                                                 HttpServletRequest request) {
        try {
            // Buscar solicitação
            SolicitacaoLGPD solicitacao = solicitacaoRepository.findByProtocolo(cancelamentoDTO.getProtocolo())
                    .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

            // Verificar se a solicitação pertence ao usuário
            if (!solicitacao.getUsuarioId().equals(cancelamentoDTO.getUsuarioId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    SUCCESS_KEY, false,
                    MESSAGE_KEY, "Solicitação não pertence ao usuário"
                ));
            }

            // Verificar se pode ser cancelada (apenas PENDENTE ou EM_ANALISE)
            if (solicitacao.getStatus() != SolicitacaoLGPD.Status.PENDENTE && 
                solicitacao.getStatus() != SolicitacaoLGPD.Status.EM_ANALISE) {
                return ResponseEntity.badRequest().body(Map.of(
                    SUCCESS_KEY, false,
                    MESSAGE_KEY, "Solicitação não pode ser cancelada no status atual: " + solicitacao.getStatus()
                ));
            }

            // Cancelar solicitação (usando status REJEITADA como cancelada)
            solicitacao.setStatus(SolicitacaoLGPD.Status.REJEITADA);
            solicitacao.setDataConclusao(LocalDateTime.now());
            solicitacao.setResposta("Solicitação cancelada pelo titular dos dados. Motivo: " + 
                                   (cancelamentoDTO.getMotivo() != null ? cancelamentoDTO.getMotivo() : "Não informado"));
            solicitacao.setResponsavelAnalise("SISTEMA_AUTOCANCEL");
            solicitacaoRepository.save(solicitacao);

            // Log de auditoria
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + cancelamentoDTO.getUsuarioId());
            auditLog.setAcao("CANCELAMENTO_SOLICITACAO_LGPD");
            auditLog.setDetalhes(PROTOCOLO_PREFIX + cancelamentoDTO.getProtocolo() + 
                               ", Motivo: " + cancelamentoDTO.getMotivo() +
                               IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Solicitação cancelada com sucesso"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao cancelar solicitação: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/tipos-solicitacao")
    public ResponseEntity<Map<String, Object>> listarTiposSolicitacao() {
        return ResponseEntity.ok(Map.of(
            SUCCESS_KEY, true,
            "tipos", Map.of(
                "ACESSO", "Acesso aos dados pessoais",
                "CORRECAO", "Correção de dados pessoais",
                "EXCLUSAO", "Exclusão de dados pessoais",
                "PORTABILIDADE", "Portabilidade dos dados",
                "OPOSICAO", "Oposição ao tratamento"
            )
        ));
    }

    @GetMapping("/status-solicitacao")
    public ResponseEntity<Map<String, Object>> listarStatusSolicitacao() {
        return ResponseEntity.ok(Map.of(
            SUCCESS_KEY, true,
            "status", Map.of(
                "PENDENTE", "Aguardando análise",
                "EM_ANALISE", "Em análise pela equipe",
                "APROVADA", "Aprovada e em execução",
                "REJEITADA", "Rejeitada ou cancelada",
                "CONCLUIDA", "Concluída com sucesso"
            )
        ));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }

    // DTOs
    public static class NovaSolicitacaoDTO {
        private Long usuarioId;
        private SolicitacaoLGPD.TipoSolicitacao tipoSolicitacao;
        private String motivo;

        // Getters e Setters
        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

        public SolicitacaoLGPD.TipoSolicitacao getTipoSolicitacao() { return tipoSolicitacao; }
        public void setTipoSolicitacao(SolicitacaoLGPD.TipoSolicitacao tipoSolicitacao) { this.tipoSolicitacao = tipoSolicitacao; }

        public String getMotivo() { return motivo; }
        public void setMotivo(String motivo) { this.motivo = motivo; }
    }

    public static class CancelamentoDTO {
        private String protocolo;
        private Long usuarioId;
        private String motivo;

        // Getters e Setters
        public String getProtocolo() { return protocolo; }
        public void setProtocolo(String protocolo) { this.protocolo = protocolo; }

        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

        public String getMotivo() { return motivo; }
        public void setMotivo(String motivo) { this.motivo = motivo; }
    }
}