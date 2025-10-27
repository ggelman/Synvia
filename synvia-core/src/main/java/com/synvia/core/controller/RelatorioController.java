package com.synvia.core.controller;

import com.synvia.core.dto.GraficoPontoDTO;
import com.synvia.core.dto.ResumoFinanceiroDTO;
import com.synvia.core.dto.ResumoVendasDTO;
import com.synvia.core.model.Cliente;
import com.synvia.core.model.Produto;
import com.synvia.core.model.Transacao;
import com.synvia.core.model.Venda;
import com.synvia.core.service.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/relatorios")
@CrossOrigin(origins = "http://localhost:3000")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/transacoes")
    public ResponseEntity<List<Transacao>> getTransacoes(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        List<Transacao> transacoes = relatorioService.buscarTransacoesPorPeriodo(inicio, fim);
        return ResponseEntity.ok(ensureNotEmptyTransacoes(transacoes));
    }

    @GetMapping("/vendas")
    public ResponseEntity<List<Venda>> getRelatorioVendas(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        List<Venda> relatorio = relatorioService.gerarRelatorioVendas(inicio, fim);
        return ResponseEntity.ok(ensureNotEmptyVendas(relatorio));
    }

    @GetMapping("/estoque/baixo")
    public ResponseEntity<List<Produto>> getRelatorioEstoqueBaixo() {
        List<Produto> relatorio = relatorioService.gerarRelatorioEstoqueBaixo();
        return ResponseEntity.ok(ensureNotEmptyProdutos(relatorio));
    }

    @GetMapping("/estoque/zerado")
    public ResponseEntity<List<Produto>> getRelatorioEstoqueZerado() {
        List<Produto> relatorio = relatorioService.gerarRelatorioEstoqueZerado();
        return ResponseEntity.ok(ensureNotEmptyProdutos(relatorio));
    }

    @GetMapping("/resumo-diario")
    public ResponseEntity<ResumoVendasDTO> getResumoDiario(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        ResumoVendasDTO resumo = relatorioService.getResumoDiario(inicio, fim);
        return ResponseEntity.ok(resumo);
    }

    @GetMapping("/financeiro")
    public ResponseEntity<ResumoFinanceiroDTO> getFinanceiro(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        ResumoFinanceiroDTO financeiro = relatorioService.getFinanceiro(inicio, fim);
        return ResponseEntity.ok(financeiro);
    }

    @GetMapping("/vendas-por-produto")
    public ResponseEntity<List<Map<String, Object>>> getVendasPorProduto() {
        List<Map<String, Object>> vendasPorProduto = relatorioService.getVendasPorProduto();
        return ResponseEntity.ok(ensureNotEmptyVendasPorProduto(vendasPorProduto));
    }

    @GetMapping("/aniversariantes")
    public ResponseEntity<List<Cliente>> getAniversariantes() {
        List<Cliente> aniversariantes = relatorioService.getAniversariantesDoDia();
        return ResponseEntity.ok(ensureNotEmptyClientes(aniversariantes));
    }

    @GetMapping("/evolucao-financeira")
    public ResponseEntity<List<GraficoPontoDTO>> getEvolucaoFinanceira(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        List<GraficoPontoDTO> evolucao = relatorioService.getEvolucaoFinanceira(inicio, fim);
        return ResponseEntity.ok(ensureNotEmptyGrafico(evolucao));
    }
    
    private List<Transacao> ensureNotEmptyTransacoes(List<Transacao> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
    
    private List<Venda> ensureNotEmptyVendas(List<Venda> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
    
    private List<Produto> ensureNotEmptyProdutos(List<Produto> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
    
    private List<Cliente> ensureNotEmptyClientes(List<Cliente> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
    
    private List<Map<String, Object>> ensureNotEmptyVendasPorProduto(List<Map<String, Object>> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
    
    private List<GraficoPontoDTO> ensureNotEmptyGrafico(List<GraficoPontoDTO> list) {
        return list.isEmpty() ? Collections.emptyList() : list;
    }
}