package com.synvia.core.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduto;

    @Column(unique = true, nullable = false)
    private String nome;

    @Column(precision = 10, scale = 2)
    private BigDecimal preco;

    private Integer qtdMinima;
    private String descricao;
    private Integer qtdAtual;

    // Campos para cardápio público
    @Column(name = "visivel_cardapio")
    private Boolean visivelCardapio = false;
    
    @Column(name = "imagem_url")
    private String imagemUrl;
    
    @Column(name = "descricao_cardapio", length = 500)
    private String descricaoCardapio;
    
    @Column(name = "destaque")
    private Boolean destaque = false;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    public Produto() {
        // Construtor padrão necessário para JPA
    }

    public Long getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Long idProduto) {
        this.idProduto = idProduto;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Integer getQtdMinima() {
        return qtdMinima;
    }

    public void setQtdMinima(Integer qtdMinima) {
        this.qtdMinima = qtdMinima;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getQtdAtual() {
        return qtdAtual;
    }

    public void setQtdAtual(Integer qtdAtual) {
        this.qtdAtual = qtdAtual;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Boolean getVisivelCardapio() {
        return visivelCardapio;
    }

    public void setVisivelCardapio(Boolean visivelCardapio) {
        this.visivelCardapio = visivelCardapio;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getDescricaoCardapio() {
        return descricaoCardapio;
    }

    public void setDescricaoCardapio(String descricaoCardapio) {
        this.descricaoCardapio = descricaoCardapio;
    }

    public Boolean getDestaque() {
        return destaque;
    }

    public void setDestaque(Boolean destaque) {
        this.destaque = destaque;
    }
}