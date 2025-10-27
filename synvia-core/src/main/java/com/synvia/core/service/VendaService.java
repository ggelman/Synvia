package com.synvia.core.service;

import com.synvia.core.dto.ItemVendaRequest;
import com.synvia.core.dto.NovaVendaRequest;
import com.synvia.core.exception.RecursoNaoEncontradoException;
import com.synvia.core.exception.ValidacaoNegocioException;
import com.synvia.core.model.*;
import com.synvia.core.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final TransacaoRepository transacaoRepository;
    private final FidelidadeService fidelidadeService;

    public VendaService(VendaRepository vendaRepository, ProdutoRepository produtoRepository,
            ClienteRepository clienteRepository, TransacaoRepository transacaoRepository,
            FidelidadeService fidelidadeService) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.transacaoRepository = transacaoRepository;
        this.fidelidadeService = fidelidadeService;
    }

    @Transactional
    public Venda processarNovaVenda(NovaVendaRequest request) {
        // 1. Validação inicial
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new ValidacaoNegocioException("A venda deve conter pelo menos um item.");
        }

        // 2. Cálculo do subtotal e validação de estoque
        BigDecimal subtotal = BigDecimal.ZERO;
        List<ItemPedido> itensPedido = new ArrayList<>();
        for (ItemVendaRequest itemReq : request.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com ID: " + itemReq.getProdutoId()));

            if (produto.getQtdAtual() < itemReq.getQuantidade()) {
                throw new ValidacaoNegocioException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            produto.setQtdAtual(produto.getQtdAtual() - itemReq.getQuantidade());
            produtoRepository.save(produto);

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemReq.getQuantidade());
            itemPedido.setPrecoUnitario(produto.getPreco());
            itensPedido.add(itemPedido);

            subtotal = subtotal.add(produto.getPreco().multiply(new BigDecimal(itemReq.getQuantidade())));
        }

        // 3. Lógica de Fidelidade (Cálculo de Desconto)
        Cliente cliente = null;
        BigDecimal descontoFidelidade = BigDecimal.ZERO;
        int pontosUtilizados = 0;

        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com ID: " + request.getClienteId()));

            if (cliente.isParticipaFidelidade() && request.getPontosParaUtilizar() != null && request.getPontosParaUtilizar() > 0) {
                pontosUtilizados = request.getPontosParaUtilizar();
                Fidelidade fidelidade = cliente.getFidelidade();

                if (fidelidade == null || fidelidade.getPontos() < pontosUtilizados) {
                    throw new ValidacaoNegocioException("Cliente não possui pontos suficientes.");
                }

                descontoFidelidade = new BigDecimal(pontosUtilizados).multiply(new BigDecimal("0.05"));
                if (descontoFidelidade.compareTo(subtotal) > 0) {
                    descontoFidelidade = subtotal;
                    // Recalcular pontos utilizados se o desconto for limitado pelo subtotal
                    pontosUtilizados = descontoFidelidade.divide(new BigDecimal("0.05"), 0, RoundingMode.DOWN).intValue();
                }

                fidelidadeService.ajustarPontos(cliente.getIdCliente(), -pontosUtilizados);
            }
        }

        // 4. Cálculo do Valor Final
        BigDecimal valorFinal = subtotal.subtract(descontoFidelidade);

        // 5. Criação do Pedido e da Venda
        Pedido pedido = new Pedido();
        pedido.setData(LocalDateTime.now());
        pedido.setStatus("FINALIZADO");
        pedido.setCanal("LOJA_FISICA");
        if (cliente != null) {
            pedido.setCliente(cliente);
        }
        itensPedido.forEach(pedido::adicionarItem);

        Venda venda = new Venda();
        venda.setPedido(pedido);
        venda.setData(LocalDateTime.now());
        venda.setMetodoPagamento(request.getMetodoPagamento());
        venda.setValorTotal(valorFinal);

        // 6. Lógica de Fidelidade (Ganho de Pontos)
        int pontosGanhos = 0;
        if (cliente != null && cliente.isParticipaFidelidade()) {
            pontosGanhos = valorFinal.intValue(); // 1 ponto por real gasto
            if (pontosGanhos > 0) {
                fidelidadeService.ajustarPontos(cliente.getIdCliente(), pontosGanhos);
            }
        }

        // 7. Popula campos transient para o DTO de resposta
        venda.setPontosGanhos(pontosGanhos);
        venda.setPontosUtilizados(pontosUtilizados);
        venda.setDescontoFidelidade(descontoFidelidade);

        Venda vendaSalva = vendaRepository.save(venda);

        // 8. Criação da Transação Financeira
        Transacao transacao = new Transacao();
        transacao.setTipo(Transacao.TipoTransacao.RECEITA);
        transacao.setData(vendaSalva.getData());
        transacao.setDescricao("Venda #" + vendaSalva.getIdVenda());
        transacao.setValor(vendaSalva.getValorTotal());
        transacaoRepository.save(transacao);

        return vendaSalva;
    }
}