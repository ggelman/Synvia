package com.synvia.core.repository;

import com.synvia.core.model.SolicitacaoLGPD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoLGPDRepository extends JpaRepository<SolicitacaoLGPD, Long> {
    
    Optional<SolicitacaoLGPD> findByProtocolo(String protocolo);
    
    List<SolicitacaoLGPD> findByUsuarioIdOrderByDataSolicitacaoDesc(Long usuarioId);
    
    List<SolicitacaoLGPD> findByStatusOrderByDataSolicitacaoDesc(SolicitacaoLGPD.Status status);
    
    @Query("SELECT s FROM SolicitacaoLGPD s WHERE s.dataSolicitacao < :dataLimite AND s.status = 'PENDENTE'")
    List<SolicitacaoLGPD> findSolicitacoesPendentesVencidas(@Param("dataLimite") LocalDateTime dataLimite);
    
    @Query("SELECT COUNT(s) FROM SolicitacaoLGPD s WHERE s.tipoSolicitacao = :tipo AND s.dataSolicitacao >= :dataInicio")
    Long countByTipoSince(@Param("tipo") SolicitacaoLGPD.TipoSolicitacao tipo, @Param("dataInicio") LocalDateTime dataInicio);
    
    @Query("SELECT s FROM SolicitacaoLGPD s WHERE s.usuarioId = :usuarioId AND s.tipoSolicitacao = :tipo AND s.status IN ('PENDENTE', 'EM_ANALISE')")
    List<SolicitacaoLGPD> findSolicitacoesAtivasByUsuarioAndTipo(@Param("usuarioId") Long usuarioId, @Param("tipo") SolicitacaoLGPD.TipoSolicitacao tipo);
    
    // Métodos para Dashboard de Auditoria
    List<SolicitacaoLGPD> findByDataSolicitacaoGreaterThanEqual(LocalDateTime dataInicio);
    
    long countByDataSolicitacaoGreaterThanEqual(LocalDateTime dataInicio);
    
    long countByStatusAndDataSolicitacaoLessThan(SolicitacaoLGPD.Status status, LocalDateTime dataLimite);
}