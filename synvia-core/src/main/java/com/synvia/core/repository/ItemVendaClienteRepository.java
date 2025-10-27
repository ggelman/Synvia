package com.synvia.core.repository;

import com.synvia.core.model.ItemVendaCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemVendaClienteRepository extends JpaRepository<ItemVendaCliente, Long> {
    
    List<ItemVendaCliente> findByVendaIdVenda(Long vendaId);
    
    @Query("SELECT i FROM ItemVendaCliente i JOIN i.venda v WHERE v.dataVenda BETWEEN :dataInicio AND :dataFim")
    List<ItemVendaCliente> findByVendaDataVendaBetween(@Param("dataInicio") LocalDateTime dataInicio, 
                                                       @Param("dataFim") LocalDateTime dataFim);
    
    @Query("SELECT i FROM ItemVendaCliente i WHERE i.produto.idProduto = :produtoId")
    List<ItemVendaCliente> findByProdutoId(@Param("produtoId") Long produtoId);
}