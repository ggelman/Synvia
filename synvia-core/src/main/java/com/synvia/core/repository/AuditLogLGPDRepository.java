package com.synvia.core.repository;

import com.synvia.core.model.AuditLogLGPD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogLGPDRepository extends JpaRepository<AuditLogLGPD, Long> {
    
    List<AuditLogLGPD> findByUsuarioIdOrderByTimestampDesc(Long usuarioId);
    
    List<AuditLogLGPD> findByAcaoOrderByTimestampDesc(String acao);
    
    @Query("SELECT a FROM AuditLogLGPD a WHERE a.timestamp BETWEEN :inicio AND :fim ORDER BY a.timestamp DESC")
    List<AuditLogLGPD> findByPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
    
    @Query("SELECT a FROM AuditLogLGPD a WHERE a.usuarioId = :usuarioId AND a.acao = :acao ORDER BY a.timestamp DESC")
    List<AuditLogLGPD> findByUsuarioAndAcao(@Param("usuarioId") Long usuarioId, @Param("acao") String acao);
    
    @Query("SELECT COUNT(a) FROM AuditLogLGPD a WHERE a.acao = :acao AND a.timestamp >= :dataInicio")
    Long countByAcaoSince(@Param("acao") String acao, @Param("dataInicio") LocalDateTime dataInicio);
}