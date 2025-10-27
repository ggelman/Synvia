package com.synvia.core.controller;

import com.synvia.core.model.Transacao;
import com.synvia.core.service.TransacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/transacoes")
@CrossOrigin(origins = "http://localhost:3000")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @PostMapping
    public ResponseEntity<Transacao> registrarTransacao(@RequestBody Transacao transacao) {
        Transacao transacaoSalva = transacaoService.registrarTransacao(transacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(transacaoSalva);
    }
    
    @GetMapping
    public ResponseEntity<List<Transacao>> listarTodas() {
        return ResponseEntity.ok(transacaoService.listarTodas());
    }
}