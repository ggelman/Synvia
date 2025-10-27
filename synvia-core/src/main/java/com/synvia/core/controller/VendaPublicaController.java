package com.synvia.core.controller;

import com.synvia.core.config.CacheConfig;
import com.synvia.core.model.LogAuditoria;
import com.synvia.core.model.VendaCliente;
import com.synvia.core.repository.LogAuditoriaRepository;
import com.synvia.core.service.VendaClienteService;
import com.synvia.core.service.VendaClienteService.ItemPedidoDTO;
import io.micrometer.observation.annotation.Observed;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/vendas")
@CrossOrigin(origins = "*")
public class VendaPublicaController {

    // Constantes para strings literais
    private static final String CLIENTE_ID_PREFIX = "CLIENTE_ID_";
    private static final String SUCCESS_KEY = "success";
    private static final String MESSAGE_KEY = "message";
    private static final String IP_SUFFIX = " - IP: ";

    private final VendaClienteService vendaClienteService;
    private final LogAuditoriaRepository logAuditoriaRepository;

    public VendaPublicaController(VendaClienteService vendaClienteService, 
                                  LogAuditoriaRepository logAuditoriaRepository) {
        this.vendaClienteService = vendaClienteService;
        this.logAuditoriaRepository = logAuditoriaRepository;
    }

    @PostMapping("/processar-pedido")
    @Observed(name = "public.vendas.processar", contextualName = "processar-pedido-publico")
    @CacheEvict(cacheNames = CacheConfig.PUBLIC_STATUS_CACHE, allEntries = true)
    public ResponseEntity<Map<String, Object>> processarPedido(@RequestBody PedidoPublicoDTO pedidoDTO,
                                           HttpServletRequest request) {
        try {
            // Log de auditoria para processamento de pedido
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + pedidoDTO.getClienteId());
            auditLog.setAcao("PROCESSAMENTO_PEDIDO_PUBLICO");
            auditLog.setDetalhes("Processamento de pedido via cardápio digital com " + pedidoDTO.getItens().size() + " itens" + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);
            
            // Processar o pedido
            VendaCliente venda = vendaClienteService.processarPedido(
                pedidoDTO.getClienteId(),
                pedidoDTO.getItens(),
                pedidoDTO.getFormaPagamento(),
                pedidoDTO.getMesaNumero(),
                pedidoDTO.getObservacoes()
            );
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Pedido processado com sucesso",
                "vendaId", venda.getIdVenda(),
                "valorTotal", venda.getValorTotal()
            ));
            
        } catch (Exception e) {
            // Log de erro
            LogAuditoria auditLogErro = new LogAuditoria();
            auditLogErro.setUsuario(CLIENTE_ID_PREFIX + pedidoDTO.getClienteId());
            auditLogErro.setAcao("ERRO_PROCESSAMENTO_PEDIDO");
            auditLogErro.setDetalhes("Erro no processamento de pedido: " + e.getMessage() + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLogErro);
            
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao processar pedido: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/confirmar-pagamento")
    @Observed(name = "public.vendas.confirmar", contextualName = "confirmar-pagamento-publico")
    @CacheEvict(cacheNames = CacheConfig.PUBLIC_STATUS_CACHE, allEntries = true)
    public ResponseEntity<Map<String, Object>> confirmarPagamento(@RequestBody ConfirmacaoPagamentoDTO confirmacaoDTO,
                                               HttpServletRequest request) {
        try {
            // Log de auditoria para confirmação de pagamento
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + confirmacaoDTO.getClienteId());
            auditLog.setAcao("CONFIRMACAO_PAGAMENTO_PUBLICO");
            auditLog.setDetalhes("Confirmação de pagamento - Venda ID: " + confirmacaoDTO.getVendaId() + ", Método: " + confirmacaoDTO.getMetodoPagamento() + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);
            
            // Confirmar pagamento
            vendaClienteService.confirmarPagamento(
                confirmacaoDTO.getVendaId(),
                confirmacaoDTO.getMetodoPagamento(),
                confirmacaoDTO.getComprovantePagamento()
            );
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Pagamento confirmado com sucesso"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao confirmar pagamento: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/status/{vendaId}")
    @Observed(name = "public.vendas.status", contextualName = "consultar-status-pedido")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_STATUS_CACHE,
            key = "'status:' + #clienteId + ':' + #vendaId",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> consultarStatusPedido(@PathVariable Long vendaId,
                                                  @RequestParam Long clienteId,
                                                  HttpServletRequest request) {
        try {
            // Log de auditoria para consulta de status
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario(CLIENTE_ID_PREFIX + clienteId);
            auditLog.setAcao("CONSULTA_STATUS_PEDIDO_PUBLICO");
            auditLog.setDetalhes("Consulta status do pedido - Venda ID: " + vendaId + IP_SUFFIX + getClientIpAddress(request));
            logAuditoriaRepository.save(auditLog);
            
            VendaCliente venda = vendaClienteService.buscarVendaPorId(vendaId);
            
            if (venda == null || !venda.getCliente().getIdCliente().equals(clienteId)) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                "vendaId", venda.getIdVenda(),
                "status", venda.getStatusPedido(),
                "valorTotal", venda.getValorTotal(),
                "dataVenda", venda.getDataVenda(),
                "formaPagamento", venda.getFormaPagamento(),
                "observacoes", venda.getObservacoes()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao consultar status: " + e.getMessage()
            ));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }

    // DTOs internos
    public static class PedidoPublicoDTO {
        private Long clienteId;
        private List<ItemPedidoDTO> itens;
        private String formaPagamento;
        private String mesaNumero;
        private String observacoes;
        
        // Getters e Setters
        public Long getClienteId() { return clienteId; }
        public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
        
        public List<ItemPedidoDTO> getItens() { return itens; }
        public void setItens(List<ItemPedidoDTO> itens) { this.itens = itens; }
        
        public String getFormaPagamento() { return formaPagamento; }
        public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
        
        public String getMesaNumero() { return mesaNumero; }
        public void setMesaNumero(String mesaNumero) { this.mesaNumero = mesaNumero; }
        
        public String getObservacoes() { return observacoes; }
        public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    }

    public static class ConfirmacaoPagamentoDTO {
        private Long vendaId;
        private Long clienteId;
        private String metodoPagamento;
        private String comprovantePagamento;
        
        // Getters e Setters
        public Long getVendaId() { return vendaId; }
        public void setVendaId(Long vendaId) { this.vendaId = vendaId; }
        
        public Long getClienteId() { return clienteId; }
        public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
        
        public String getMetodoPagamento() { return metodoPagamento; }
        public void setMetodoPagamento(String metodoPagamento) { this.metodoPagamento = metodoPagamento; }
        
        public String getComprovantePagamento() { return comprovantePagamento; }
        public void setComprovantePagamento(String comprovantePagamento) { this.comprovantePagamento = comprovantePagamento; }
    }
}