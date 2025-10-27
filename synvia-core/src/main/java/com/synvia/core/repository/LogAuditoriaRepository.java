package com.synvia.core.repository;

import com.synvia.core.model.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    
    // Métodos para Dashboard de Auditoria
    List<LogAuditoria> findTop50ByOrderByTimestampDesc();
    
    long countByTimestampGreaterThanEqual(LocalDateTime dataInicio);
}