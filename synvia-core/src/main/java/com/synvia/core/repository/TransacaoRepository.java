package com.synvia.core.repository;

import com.synvia.core.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByDataBetween(LocalDateTime dataInicio, LocalDateTime dataFim);
}