package com.synvia.core.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ResumoVendasDTO {
    private BigDecimal totalFaturamento;
    private Long quantidadeVendas;
    private BigDecimal ticketMedio;

    private Map<String, Long> distribuicaoPorPagamento;
    private List<ProdutoVendidoDTO> produtosMaisVendidos;

    public BigDecimal getTotalFaturamento() {
        return totalFaturamento;
    }

    public void setTotalFaturamento(BigDecimal totalFaturamento) {
        this.totalFaturamento = totalFaturamento;
    }

    public Long getQuantidadeVendas() {
        return quantidadeVendas;
    }

    public void setQuantidadeVendas(Long quantidadeVendas) {
        this.quantidadeVendas = quantidadeVendas;
    }

    public BigDecimal getTicketMedio() {
        return ticketMedio;
    }

    public void setTicketMedio(BigDecimal ticketMedio) {
        this.ticketMedio = ticketMedio;
    }

    public Map<String, Long> getDistribuicaoPorPagamento() {
        return distribuicaoPorPagamento;
    }

    public void setDistribuicaoPorPagamento(Map<String, Long> distribuicaoPorPagamento) {
        this.distribuicaoPorPagamento = distribuicaoPorPagamento;
    }

    public List<ProdutoVendidoDTO> getProdutosMaisVendidos() {
        return produtosMaisVendidos;
    }

    public void setProdutosMaisVendidos(List<ProdutoVendidoDTO> produtosMaisVendidos) {
        this.produtosMaisVendidos = produtosMaisVendidos;
    }
}