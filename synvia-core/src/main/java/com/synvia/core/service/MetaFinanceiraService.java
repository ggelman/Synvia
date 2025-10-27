package com.synvia.core.service;

import com.synvia.core.exception.ValidacaoNegocioException;
import com.synvia.core.model.MetaFinanceira;
import com.synvia.core.repository.MetaFinanceiraRepository;
import com.synvia.core.repository.VendaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class MetaFinanceiraService {

    private final MetaFinanceiraRepository metaRepository;
    private final VendaRepository vendaRepository;

    public MetaFinanceiraService(MetaFinanceiraRepository metaRepository, VendaRepository vendaRepository) {
        this.metaRepository = metaRepository;
        this.vendaRepository = vendaRepository;
    }

    @Transactional
    public MetaFinanceira criarMeta(MetaFinanceira novaMeta) {
        if (novaMeta.getDataFim().isBefore(novaMeta.getDataInicio())) {
            throw new ValidacaoNegocioException("A data final da meta não pode ser anterior à data de início.");
        }
        return metaRepository.save(novaMeta);
    }

    public List<MetaFinanceira> getMetasAtivasComProgresso() {
        List<MetaFinanceira> metasAtivas = metaRepository.findMetasAtivas(LocalDate.now());

        for (MetaFinanceira meta : metasAtivas) {
            BigDecimal valorAtual = vendaRepository.sumValorTotalByDataBetween(
                    meta.getDataInicio().atStartOfDay(),
                    meta.getDataFim().atTime(23, 59, 59)).orElse(BigDecimal.ZERO);

            meta.setValorAtual(valorAtual);

            if (meta.getValorAlvo().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal progresso = valorAtual.divide(meta.getValorAlvo(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                meta.setProgressoPercentual(progresso.intValue());
            } else {
                meta.setProgressoPercentual(0);
            }
        }
        return metasAtivas;
    }
}