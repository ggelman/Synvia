package com.synvia.core.service;

import com.synvia.core.exception.EstoqueInsuficienteException;
import com.synvia.core.model.*;
import com.synvia.core.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VendaClienteService {
    
    private static final Logger logger = LoggerFactory.getLogger(VendaClienteService.class);

    private final VendaClienteRepository vendaClienteRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final LogAuditoriaRepository logAuditoriaRepository;

    public VendaClienteService(VendaClienteRepository vendaClienteRepository,
                              ProdutoRepository produtoRepository,
                              ClienteRepository clienteRepository,
                              LogAuditoriaRepository logAuditoriaRepository) {
        this.vendaClienteRepository = vendaClienteRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.logAuditoriaRepository = logAuditoriaRepository;
    }

    @Transactional
    public VendaCliente processarPedido(Long clienteId, List<ItemPedidoDTO> itensPedido, 
                                       String formaPagamento, String mesaNumero, String observacoes) {
        
        // Buscar cliente
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // Criar venda
        VendaCliente venda = new VendaCliente();
        venda.setCliente(cliente);
        venda.setFormaPagamento(formaPagamento);
        venda.setMesaNumero(mesaNumero);
        venda.setObservacoes(observacoes);
        venda.setDataVenda(LocalDateTime.now());
        venda.setStatusPedido("CONFIRMADO");

        BigDecimal valorTotal = BigDecimal.ZERO;

        // Processar itens do pedido
        for (ItemPedidoDTO itemDto : itensPedido) {
            Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.getProdutoId()));

            // Verificar estoque
            if (produto.getQtdAtual() < itemDto.getQuantidade()) {
                throw new EstoqueInsuficienteException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // Atualizar estoque
            produto.setQtdAtual(produto.getQtdAtual() - itemDto.getQuantidade());
            produtoRepository.save(produto);

            // Criar item da venda
            ItemVendaCliente item = new ItemVendaCliente();
            item.setVenda(venda);
            item.setProduto(produto);
            item.setQuantidade(itemDto.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            item.setPrecoTotal(produto.getPreco().multiply(BigDecimal.valueOf(itemDto.getQuantidade())));

            valorTotal = valorTotal.add(item.getPrecoTotal());
        }

        venda.setValorTotal(valorTotal);
        
        // Salvar venda
        VendaCliente vendaSalva = vendaClienteRepository.save(venda);

        // Registrar auditoria LGPD
        registrarAuditoriaVenda(cliente, vendaSalva);

        return vendaSalva;
    }

    private void registrarAuditoriaVenda(Cliente cliente, VendaCliente venda) {
        try {
            // Registrar auditoria LGPD usando logger até entidades estarem configuradas
            String auditMessage = String.format(
                "AUDITORIA_LGPD - Processamento de venda ID: %d - Cliente: %d - Valor: R$ %.2f",
                venda.getIdVenda(), cliente.getIdCliente(), venda.getValorTotal()
            );
            logger.info(auditMessage);
            
            // Futura implementação: persistência em AuditLogLGPD
        } catch (Exception e) {
            // Log de erro sem interromper a venda
            logger.error("Erro ao registrar auditoria: {}", e.getMessage(), e);
        }
    }

    public List<VendaCliente> buscarVendasPorCliente(Long clienteId) {
        return vendaClienteRepository.findByClienteIdClienteOrderByDataVendaDesc(clienteId);
    }

    public VendaCliente buscarVendaPorId(Long vendaId) {
        return vendaClienteRepository.findById(vendaId).orElse(null);
    }
    
    @Transactional
    public void confirmarPagamento(Long vendaId, String metodoPagamento, String comprovantePagamento) {
        VendaCliente venda = vendaClienteRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        
        venda.setStatusPedido("PAGO");
        venda.setFormaPagamento(metodoPagamento);
        
        vendaClienteRepository.save(venda);
        
        // Log de auditoria
        try {
            LogAuditoria auditLog = new LogAuditoria();
            auditLog.setUsuario("CLIENTE_ID_" + venda.getCliente().getIdCliente());
            auditLog.setAcao("CONFIRMACAO_PAGAMENTO");
            auditLog.setDetalhes("Venda ID: " + vendaId + ", Método: " + metodoPagamento);
            logAuditoriaRepository.save(auditLog);
        } catch (Exception e) {
            logger.error("Erro ao registrar auditoria de pagamento: {}", e.getMessage(), e);
        }
    }

    public List<VendaCliente> buscarVendasPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        return vendaClienteRepository.findByDataVendaBetweenOrderByDataVendaDesc(dataInicio, dataFim);
    }

    // DTO para receber dados do pedido
    public static class ItemPedidoDTO {
        private Long produtoId;
        private Integer quantidade;

        public ItemPedidoDTO() {}

        public ItemPedidoDTO(Long produtoId, Integer quantidade) {
            this.produtoId = produtoId;
            this.quantidade = quantidade;
        }

        public Long getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(Long produtoId) {
            this.produtoId = produtoId;
        }

        public Integer getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }
    }
}