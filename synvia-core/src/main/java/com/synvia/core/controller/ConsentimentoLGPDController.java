package com.synvia.core.controller;

import com.synvia.core.model.ConsentimentoLGPD;
import com.synvia.core.model.Cliente;
import com.synvia.core.model.LogAuditoria;
import com.synvia.core.model.SolicitacaoLGPD;
import com.synvia.core.repository.ConsentimentoLGPDRepository;
import com.synvia.core.repository.ClienteRepository;
import com.synvia.core.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/lgpd")
@CrossOrigin(origins = "*")
public class ConsentimentoLGPDController {

    private static final String SUCCESS_KEY = "success";
    private static final String MESSAGE_KEY = "message";
    private static final String ERROR_PREFIX = "Erro ao";
    private static final String CLIENTE_PREFIX = "CLIENTE_ID_";
    private static final String X_FORWARDED_FOR_HEADER = "X-Forwarded-For";
    private static final String IP_HEADER_SEPARATOR = ",";
    private static final int FIRST_IP_INDEX = 0;
    private static final String NOVO_CONSENTIMENTO_MOTIVO = "Novo consentimento registrado";

    @Autowired
    private ConsentimentoLGPDRepository consentimentoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository;

    @PostMapping("/consentimento")
    public ResponseEntity<Object> registrarConsentimento(@RequestBody ConsentimentoDTO consentimentoDTO,
            HttpServletRequest request) {
        try {
            validarCliente(consentimentoDTO.getUsuarioId());

            revogarConsentimentosExistentes(consentimentoDTO.getUsuarioId(), consentimentoDTO.getFinalidade());

            ConsentimentoLGPD consentimentoSalvo = criarNovoConsentimento(consentimentoDTO, request);

            logarAuditoriaConsentimento(consentimentoDTO, request);

            return ResponseEntity.ok(Map.of(
                    SUCCESS_KEY, true,
                    MESSAGE_KEY, "Consentimento registrado com sucesso",
                    "consentimentoId", consentimentoSalvo.getId()));

        } catch (Exception e) {
            return createErrorResponse("registrar consentimento", e.getMessage());
        }
    }

    @GetMapping("/consentimentos/{usuarioId}")
    public ResponseEntity<Object> listarConsentimentos(@PathVariable Long usuarioId,
            HttpServletRequest request) {
        try {
            validarCliente(usuarioId);

            List<ConsentimentoLGPD> consentimentos = consentimentoRepository.findByUsuarioIdAndRevogadoFalse(usuarioId);

            logarAuditoriaConsulta(usuarioId, request, "CONSULTA_CONSENTIMENTOS_LGPD",
                    "Consulta de consentimentos do cliente");

            return ResponseEntity.ok(Map.of(
                    SUCCESS_KEY, true,
                    "consentimentos", ensureNotEmptyConsentimentos(consentimentos)));

        } catch (Exception e) {
            return createErrorResponse("consultar consentimentos", e.getMessage());
        }
    }

    @PostMapping("/revogar-consentimento")
    public ResponseEntity<Object> revogarConsentimento(@RequestBody RevogacaoDTO revogacaoDTO,
            HttpServletRequest request) {
        try {
            ConsentimentoLGPD consentimento = consentimentoRepository.findById(revogacaoDTO.getConsentimentoId())
                    .orElseThrow(() -> new RuntimeException("Consentimento não encontrado"));

            if (isConsentimentoInvalido(consentimento, revogacaoDTO)) {
                return createValidationErrorResponse();
            }

            processarRevogacao(consentimento, revogacaoDTO);

            logarAuditoriaRevogacao(revogacaoDTO, consentimento, request);

            return ResponseEntity.ok(Map.of(
                    SUCCESS_KEY, true,
                    MESSAGE_KEY, "Consentimento revogado com sucesso"));

        } catch (Exception e) {
            return createErrorResponse("revogar consentimento", e.getMessage());
        }
    }

    @GetMapping("/solicitacoes/tipos-solicitacao")
    public ResponseEntity<List<String>> listarTiposSolicitacao() {
        List<String> tiposSolicitacao = List.of(
                "Acesso aos Dados",
                "Correção de Dados",
                "Exclusão de Dados",
                "Portabilidade de Dados",
                "Revogação de Consentimento");

        return ResponseEntity.ok(tiposSolicitacao);
    }

    @GetMapping("/historico/{usuarioId}")
    public ResponseEntity<Object> historicoConsentimentos(@PathVariable Long usuarioId,
            HttpServletRequest request) {
        try {
            validarCliente(usuarioId);

            List<ConsentimentoLGPD> historico = consentimentoRepository
                    .findByUsuarioIdOrderByDataConsentimentoDesc(usuarioId);

            logarAuditoriaConsulta(usuarioId, request, "CONSULTA_HISTORICO_CONSENTIMENTOS",
                    "Consulta de histórico completo de consentimentos");

            return ResponseEntity.ok(Map.of(
                    SUCCESS_KEY, true,
                    "historico", ensureNotEmptyConsentimentos(historico)));

        } catch (Exception e) {
            return createErrorResponse("consultar histórico", e.getMessage());
        }
    }

    private Cliente validarCliente(Long usuarioId) {
        return clienteRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    private void revogarConsentimentosExistentes(Long usuarioId, ConsentimentoLGPD.TipoFinalidade finalidade) {
        List<ConsentimentoLGPD> consentimentosExistentes = consentimentoRepository
                .findByUsuarioIdAndFinalidade(usuarioId, finalidade);

        for (ConsentimentoLGPD consentimentoExistente : consentimentosExistentes) {
            if (!consentimentoExistente.getRevogado()) {
                consentimentoExistente.setRevogado(true);
                consentimentoExistente.setDataRevogacao(LocalDateTime.now());
                consentimentoExistente.setMotivoRevogacao(NOVO_CONSENTIMENTO_MOTIVO);
                consentimentoRepository.save(consentimentoExistente);
            }
        }
    }

    private ConsentimentoLGPD criarNovoConsentimento(ConsentimentoDTO consentimentoDTO, HttpServletRequest request) {
        ConsentimentoLGPD novoConsentimento = new ConsentimentoLGPD();
        novoConsentimento.setUsuarioId(consentimentoDTO.getUsuarioId());
        novoConsentimento.setFinalidade(consentimentoDTO.getFinalidade());
        novoConsentimento.setConsentimentoDado(consentimentoDTO.getConsentimentoDado());
        novoConsentimento.setDataConsentimento(LocalDateTime.now());
        novoConsentimento.setIpOrigem(getClientIpAddress(request));
        novoConsentimento.setDetalhesConsentimento(consentimentoDTO.getDetalhes());
        novoConsentimento.setRevogado(false);

        return consentimentoRepository.save(novoConsentimento);
    }

    private void logarAuditoriaConsentimento(ConsentimentoDTO consentimentoDTO, HttpServletRequest request) {
        LogAuditoria auditLog = new LogAuditoria();
        auditLog.setUsuario(CLIENTE_PREFIX + consentimentoDTO.getUsuarioId());
        auditLog.setAcao("REGISTRO_CONSENTIMENTO_LGPD");
        auditLog.setDetalhes("Finalidade: " + consentimentoDTO.getFinalidade() +
                ", Consentimento: " + (Boolean.TRUE.equals(consentimentoDTO.getConsentimentoDado()) ? "DADO" : "NEGADO")
                +
                ", IP: " + getClientIpAddress(request));
        logAuditoriaRepository.save(auditLog);
    }

    private void logarAuditoriaConsulta(Long usuarioId, HttpServletRequest request, String acao, String detalhes) {
        LogAuditoria auditLog = new LogAuditoria();
        auditLog.setUsuario(CLIENTE_PREFIX + usuarioId);
        auditLog.setAcao(acao);
        auditLog.setDetalhes(detalhes + " - IP: " + getClientIpAddress(request));
        logAuditoriaRepository.save(auditLog);
    }

    private boolean isConsentimentoInvalido(ConsentimentoLGPD consentimento, RevogacaoDTO revogacaoDTO) {
        return !consentimento.getUsuarioId().equals(revogacaoDTO.getUsuarioId()) ||
                consentimento.getRevogado();
    }

    private ResponseEntity<Object> createValidationErrorResponse() {
        String message = "Consentimento não pertence ao usuário ou já foi revogado";
        return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, message));
    }

    private void processarRevogacao(ConsentimentoLGPD consentimento, RevogacaoDTO revogacaoDTO) {
        consentimento.setRevogado(true);
        consentimento.setDataRevogacao(LocalDateTime.now());
        consentimento.setMotivoRevogacao(revogacaoDTO.getMotivo());
        consentimentoRepository.save(consentimento);
    }

    private void logarAuditoriaRevogacao(RevogacaoDTO revogacaoDTO, ConsentimentoLGPD consentimento,
            HttpServletRequest request) {
        LogAuditoria auditLog = new LogAuditoria();
        auditLog.setUsuario(CLIENTE_PREFIX + revogacaoDTO.getUsuarioId());
        auditLog.setAcao("REVOGACAO_CONSENTIMENTO_LGPD");
        auditLog.setDetalhes("Consentimento ID: " + revogacaoDTO.getConsentimentoId() +
                ", Finalidade: " + consentimento.getFinalidade() +
                ", Motivo: " + revogacaoDTO.getMotivo() +
                ", IP: " + getClientIpAddress(request));
        logAuditoriaRepository.save(auditLog);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader(X_FORWARDED_FOR_HEADER);
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(IP_HEADER_SEPARATOR)[FIRST_IP_INDEX];
        }
    }

    private ResponseEntity<Object> createErrorResponse(String operation, String errorMessage) {
        return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, ERROR_PREFIX + " " + operation + ": " + errorMessage));
    }

    private List<ConsentimentoLGPD> ensureNotEmptyConsentimentos(List<ConsentimentoLGPD> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }

    public static class ConsentimentoDTO {
        private Long usuarioId;
        private ConsentimentoLGPD.TipoFinalidade finalidade;
        private Boolean consentimentoDado;
        private String detalhes;

        public Long getUsuarioId() {
            return usuarioId;
        }

        public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
        }

        public ConsentimentoLGPD.TipoFinalidade getFinalidade() {
            return finalidade;
        }

        public void setFinalidade(ConsentimentoLGPD.TipoFinalidade finalidade) {
            this.finalidade = finalidade;
        }

        public Boolean getConsentimentoDado() {
            return consentimentoDado;
        }

        public void setConsentimentoDado(Boolean consentimentoDado) {
            this.consentimentoDado = consentimentoDado;
        }

        public String getDetalhes() {
            return detalhes;
        }

        public void setDetalhes(String detalhes) {
            this.detalhes = detalhes;
        }
    }

    public static class RevogacaoDTO {
        private Long consentimentoId;
        private Long usuarioId;
        private String motivo;

        public Long getConsentimentoId() {
            return consentimentoId;
        }

        public void setConsentimentoId(Long consentimentoId) {
            this.consentimentoId = consentimentoId;
        }

        public Long getUsuarioId() {
            return usuarioId;
        }

        public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
        }

        public String getMotivo() {
            return motivo;
        }

        public void setMotivo(String motivo) {
            this.motivo = motivo;
        }
    }
}