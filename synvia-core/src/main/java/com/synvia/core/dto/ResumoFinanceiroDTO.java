package com.synvia.core.dto;

import java.math.BigDecimal;

public class ResumoFinanceiroDTO {
    private BigDecimal receita;
    private BigDecimal despesa;
    private BigDecimal lucro;
    private BigDecimal totalVendas;

    public BigDecimal getReceita() {
        return receita;
    }

    public void setReceita(BigDecimal receita) {
        this.receita = receita;
    }

    public BigDecimal getDespesa() {
        return despesa;
    }

    public void setDespesa(BigDecimal despesa) {
        this.despesa = despesa;
    }

    public BigDecimal getLucro() {
        return lucro;
    }

    public void setLucro(BigDecimal lucro) {
        this.lucro = lucro;
    }

    public BigDecimal getTotalVendas() {
        return totalVendas;
    }

    public void setTotalVendas(BigDecimal totalVendas) {
        this.totalVendas = totalVendas;
    }
}