package com.synvia.core.controller;

import com.synvia.core.model.VendaCliente;
import com.synvia.core.service.VendaClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/vendas")
@CrossOrigin(origins = "*")
public class VendaClienteController {

    @Autowired
    private VendaClienteService vendaClienteService;

    @PostMapping("/processar")
    public ResponseEntity<?> processarPedido(@RequestBody PedidoRequestDTO pedidoRequest) {
        try {
            VendaCliente venda = vendaClienteService.processarPedido(
                pedidoRequest.getClienteId(),
                pedidoRequest.getItens(),
                pedidoRequest.getFormaPagamento(),
                pedidoRequest.getMesaNumero(),
                pedidoRequest.getObservacoes()
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "vendaId", venda.getIdVenda(),
                "valorTotal", venda.getValorTotal(),
                "message", "Pedido processado com sucesso!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Erro ao processar pedido: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VendaCliente>> buscarVendasCliente(@PathVariable Long clienteId) {
        List<VendaCliente> vendas = vendaClienteService.buscarVendasPorCliente(clienteId);
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{vendaId}")
    public ResponseEntity<VendaCliente> buscarVenda(@PathVariable Long vendaId) {
        VendaCliente venda = vendaClienteService.buscarVendaPorId(vendaId);
        if (venda != null) {
            return ResponseEntity.ok(venda);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DTO para receber dados do pedido
    public static class PedidoRequestDTO {
        private Long clienteId;
        private List<VendaClienteService.ItemPedidoDTO> itens;
        private String formaPagamento;
        private String mesaNumero;
        private String observacoes;

        // Getters e Setters
        public Long getClienteId() {
            return clienteId;
        }

        public void setClienteId(Long clienteId) {
            this.clienteId = clienteId;
        }

        public List<VendaClienteService.ItemPedidoDTO> getItens() {
            return itens;
        }

        public void setItens(List<VendaClienteService.ItemPedidoDTO> itens) {
            this.itens = itens;
        }

        public String getFormaPagamento() {
            return formaPagamento;
        }

        public void setFormaPagamento(String formaPagamento) {
            this.formaPagamento = formaPagamento;
        }

        public String getMesaNumero() {
            return mesaNumero;
        }

        public void setMesaNumero(String mesaNumero) {
            this.mesaNumero = mesaNumero;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }
    }
}