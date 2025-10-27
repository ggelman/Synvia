package com.synvia.core.repository;

import com.synvia.core.model.ConsentimentoLGPD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentimentoLGPDRepository extends JpaRepository<ConsentimentoLGPD, Long> {
    
    List<ConsentimentoLGPD> findByUsuarioIdOrderByDataConsentimentoDesc(Long usuarioId);
    
    List<ConsentimentoLGPD> findByUsuarioIdAndFinalidade(Long usuarioId, ConsentimentoLGPD.TipoFinalidade finalidade);
    
    List<ConsentimentoLGPD> findByUsuarioIdAndRevogadoFalse(Long usuarioId);
    
    @Query("SELECT c FROM ConsentimentoLGPD c WHERE c.usuarioId = :usuarioId AND c.finalidade = :finalidade AND c.revogado = false ORDER BY c.dataConsentimento DESC")
    Optional<ConsentimentoLGPD> findConsentimentoAtivoByUsuarioAndFinalidade(@Param("usuarioId") Long usuarioId, @Param("finalidade") ConsentimentoLGPD.TipoFinalidade finalidade);
    
    @Query("SELECT c FROM ConsentimentoLGPD c WHERE c.usuarioId = :usuarioId AND c.revogado = false")
    List<ConsentimentoLGPD> findConsentimentosAtivosByUsuario(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(c) FROM ConsentimentoLGPD c WHERE c.finalidade = :finalidade AND c.consentimentoDado = true AND c.revogado = false")
    Long countConsentimentosAtivosByFinalidade(@Param("finalidade") ConsentimentoLGPD.TipoFinalidade finalidade);
    
    // Métodos para Dashboard de Auditoria
    long countByConsentimentoDadoTrueAndRevogadoFalse();
}