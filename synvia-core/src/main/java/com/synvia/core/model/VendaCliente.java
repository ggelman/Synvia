package com.synvia.core.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "venda_cliente")
public class VendaCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVenda;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "data_venda", nullable = false)
    private LocalDateTime dataVenda;

    @Column(name = "valor_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    @Column(name = "forma_pagamento", nullable = false)
    private String formaPagamento;

    @Column(name = "status_pedido")
    private String statusPedido = "PENDENTE";

    @Column(name = "mesa_numero")
    private String mesaNumero;

    @Column(name = "observacoes")
    private String observacoes;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemVendaCliente> itens;

    // Construtores
    public VendaCliente() {}

    public VendaCliente(Cliente cliente, BigDecimal valorTotal, String formaPagamento) {
        this.cliente = cliente;
        this.valorTotal = valorTotal;
        this.formaPagamento = formaPagamento;
        this.dataVenda = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getIdVenda() {
        return idVenda;
    }

    public void setIdVenda(Long idVenda) {
        this.idVenda = idVenda;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDateTime dataVenda) {
        this.dataVenda = dataVenda;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public String getStatusPedido() {
        return statusPedido;
    }

    public void setStatusPedido(String statusPedido) {
        this.statusPedido = statusPedido;
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

    public List<ItemVendaCliente> getItens() {
        return itens;
    }

    public void setItens(List<ItemVendaCliente> itens) {
        this.itens = itens;
    }
}