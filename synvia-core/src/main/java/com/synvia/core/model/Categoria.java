package com.synvia.core.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String nome;

    private String descricao;
    private String cor;

    @Formula("(select count(p.id_produto) from produto p where p.categoria_id = id)")
    private int produtoCount;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public int getProdutoCount() {
        return produtoCount;
    }

    public void setProdutoCount(int produtoCount) {
        this.produtoCount = produtoCount;
    }
}