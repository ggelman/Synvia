package com.synvia.core.repository;

import com.synvia.core.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE p.qtdAtual > 0 AND p.qtdAtual <= p.qtdMinima")
    List<Produto> findProdutosComEstoqueBaixo();

    @Query("SELECT p FROM Produto p WHERE p.qtdAtual = 0")
    List<Produto> findProdutosComEstoqueZerado();

    @Query("SELECT p FROM Produto p WHERE p.qtdAtual > 0")
    List<Produto> findProdutosDisponiveis();

    Optional<Produto> findByNomeIgnoreCase(String nome);

    // Métodos para cardápio público
    List<Produto> findByVisivelCardapioTrueAndQtdAtualGreaterThan(Integer quantidade);
    
    @Query("SELECT p FROM Produto p WHERE p.categoria.id = :categoriaId AND p.visivelCardapio = true AND p.qtdAtual > :quantidade")
    List<Produto> findByCategoriaIdAndVisivelCardapioTrueAndQtdAtualGreaterThan(@Param("categoriaId") Long categoriaId, @Param("quantidade") Integer quantidade);
    
    List<Produto> findByDestaqueTrueAndVisivelCardapioTrueAndQtdAtualGreaterThan(Integer quantidade);
    
    @Query("SELECT p FROM Produto p WHERE p.id = :id AND p.visivelCardapio = true")
    Optional<Produto> findByIdAndVisivelCardapioTrue(@Param("id") Long id);

    // Métodos para CardapioPublicoController
    @Query("SELECT DISTINCT p.categoria.nome FROM Produto p WHERE p.categoria IS NOT NULL ORDER BY p.categoria.nome")
    List<String> findDistinctCategorias();
    
    @Query("SELECT p FROM Produto p WHERE p.categoria.nome = :categoria ORDER BY p.nome")
    Page<Produto> findByCategoria(@Param("categoria") String categoria, Pageable pageable);
    
    @Query("SELECT p FROM Produto p WHERE p.categoria.nome = :categoria AND LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY p.nome")
    Page<Produto> findByCategoriaAndNomeContainingIgnoreCase(@Param("categoria") String categoria, @Param("nome") String nome, Pageable pageable);
    
    @Query("SELECT p FROM Produto p WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY p.nome")
    Page<Produto> findByNomeContainingIgnoreCase(@Param("nome") String nome, Pageable pageable);
    
    @Query("SELECT p FROM Produto p WHERE p.categoria.nome = :categoria ORDER BY p.nome")
    List<Produto> findByCategoriaOrderByNome(@Param("categoria") String categoria);
    
    @Query("SELECT p FROM Produto p WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) ORDER BY p.nome")
    Page<Produto> findByNomeContainingIgnoreCaseOrDescricaoContainingIgnoreCase(@Param("termo") String nome, @Param("termo") String descricao, Pageable pageable);
}