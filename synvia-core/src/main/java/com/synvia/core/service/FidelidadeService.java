package com.synvia.core.service;

import com.synvia.core.exception.RecursoNaoEncontradoException;
import com.synvia.core.exception.ValidacaoNegocioException;
import com.synvia.core.model.Fidelidade;
import com.synvia.core.repository.FidelidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FidelidadeService {

    private final FidelidadeRepository fidelidadeRepository;

    public FidelidadeService(FidelidadeRepository fidelidadeRepository) {
        this.fidelidadeRepository = fidelidadeRepository;
    }

    @Transactional
    public Fidelidade ajustarPontos(Long clienteId, int pontosParaAjustar) {
        Fidelidade fidelidade = fidelidadeRepository.findByClienteIdCliente(clienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Programa de fidelidade não encontrado para o cliente: " + clienteId));

        int novosPontos = fidelidade.getPontos() + pontosParaAjustar;

        if (novosPontos < 0) {
            throw new ValidacaoNegocioException("Pontos insuficientes para resgate.");
        }

        fidelidade.setPontos(novosPontos);

        return fidelidadeRepository.save(fidelidade);
    }
}