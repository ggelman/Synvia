package com.synvia.core.repository;

import com.synvia.core.model.VendaCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaClienteRepository extends JpaRepository<VendaCliente, Long> {
    
    List<VendaCliente> findByClienteIdClienteOrderByDataVendaDesc(Long clienteId);
    
    List<VendaCliente> findByDataVendaBetweenOrderByDataVendaDesc(LocalDateTime dataInicio, LocalDateTime dataFim);
    
    List<VendaCliente> findByStatusPedidoOrderByDataVendaDesc(String statusPedido);
}