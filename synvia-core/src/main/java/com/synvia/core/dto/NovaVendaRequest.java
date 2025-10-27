package com.synvia.core.dto;

import java.util.List;

public class NovaVendaRequest {
    private List<ItemVendaRequest> itens;
    private String metodoPagamento;
    private Long clienteId;
    private Integer pontosParaUtilizar;

    public List<ItemVendaRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemVendaRequest> itens) {
        this.itens = itens;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getPontosParaUtilizar() {
        return pontosParaUtilizar;
    }

    public void setPontosParaUtilizar(Integer pontosParaUtilizar) {
        this.pontosParaUtilizar = pontosParaUtilizar;
    }
}