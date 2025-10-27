package com.synvia.core.repository;

import com.synvia.core.dto.ProdutoVendidoDTO;
import com.synvia.core.model.Cliente;
import com.synvia.core.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

        List<Venda> findByDataBetween(LocalDateTime dataInicio, LocalDateTime dataFim);

        @Query("SELECT COALESCE(SUM(v.valorTotal), 0.0) FROM Venda v WHERE v.data BETWEEN :inicio AND :fim")
        Optional<BigDecimal> sumValorTotalByDataBetween(@Param("inicio") LocalDateTime inicio,
                        @Param("fim") LocalDateTime fim);

        List<Venda> findByPedidoCliente(Cliente cliente);

        @Query("SELECT COUNT(v) FROM Venda v WHERE v.data BETWEEN :inicio AND :fim")
        Optional<Long> countVendasByDataBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

        @Query(value = "SELECT p.nome as nome, SUM(ip.quantidade) as quantidade " +
                        "FROM venda v JOIN pedido p2 ON v.id_pedido = p2.id_pedido " +
                        "JOIN item_pedido ip ON p2.id_pedido = ip.id_pedido " +
                        "JOIN produto p ON ip.id_produto = p.id_produto " +
                        "WHERE v.data BETWEEN :inicio AND :fim " +
                        "GROUP BY p.nome ORDER BY quantidade DESC LIMIT 1", nativeQuery = true)
        Map<String, Object> findMostSoldProductByDataBetween(@Param("inicio") LocalDateTime inicio,
                        @Param("fim") LocalDateTime fim);

        @Query("SELECT new com.synvia.core.dto.ProdutoVendidoDTO(ip.produto.nome, SUM(ip.quantidade)) " +
                        "FROM Venda v JOIN v.pedido p JOIN p.itens ip " +
                        "WHERE v.data BETWEEN :inicio AND :fim " +
                        "GROUP BY ip.produto.nome " +
                        "ORDER BY SUM(ip.quantidade) DESC")
        List<ProdutoVendidoDTO> findTopSoldProductsAsDTO(@Param("inicio") LocalDateTime inicio,
                        @Param("fim") LocalDateTime fim);

        @Query(value = "SELECT p.nome as nome, SUM(ip.quantidade) as quantidade " +
                        "FROM item_pedido ip JOIN produto p ON ip.id_produto = p.id_produto " +
                        "GROUP BY p.nome", nativeQuery = true)
        List<Map<String, Object>> findVendasPorProduto();

        @Query("SELECT FUNCTION('DATE', v.data), SUM(v.valorTotal) " +
                        "FROM Venda v " +
                        "WHERE v.data BETWEEN :inicio AND :fim " +
                        "GROUP BY FUNCTION('DATE', v.data) " +
                        "ORDER BY FUNCTION('DATE', v.data)")
        List<Object[]> findFaturamentoDiarioRaw(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

        @Query("SELECT v FROM Venda v " +
                        "LEFT JOIN FETCH v.pedido p " +
                        "LEFT JOIN FETCH p.cliente " +
                        "LEFT JOIN FETCH p.itens i " +
                        "LEFT JOIN FETCH i.produto " +
                        "ORDER BY v.data DESC")
        List<Venda> findAllWithDetails();
}