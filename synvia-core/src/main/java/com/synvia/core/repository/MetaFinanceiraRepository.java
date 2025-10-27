package com.synvia.core.repository;

import com.synvia.core.model.MetaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MetaFinanceiraRepository extends JpaRepository<MetaFinanceira, Long> {

    // Busca metas que estão ativas no período atual
    @Query("SELECT m FROM MetaFinanceira m WHERE m.dataInicio <= :dataAtual AND m.dataFim >= :dataAtual")
    List<MetaFinanceira> findMetasAtivas(@Param("dataAtual") LocalDate dataAtual);
}