package com.synvia.core.controller;

import com.synvia.core.dto.NovaVendaRequest;
import com.synvia.core.exception.ValidacaoNegocioException;
import com.synvia.core.model.Venda;
import com.synvia.core.repository.VendaRepository;
import com.synvia.core.service.VendaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/vendas")
@CrossOrigin(origins = "http://localhost:3000")
public class VendaController {

    private static final String ERROR_MESSAGE_KEY = "error";
    
    private final VendaRepository vendaRepository;
    private final VendaService vendaService;

    public VendaController(VendaRepository vendaRepository, VendaService vendaService) {
        this.vendaRepository = vendaRepository;
        this.vendaService = vendaService;
    }

    @GetMapping("/historico")
    public List<Venda> getHistoricoVendas() {
        List<Venda> vendas = vendaRepository.findAllWithDetails();
        return vendas.isEmpty() ? Collections.emptyList() : vendas;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venda> getVendaDetalhes(@PathVariable Long id) {
        Optional<Venda> venda = vendaRepository.findById(id);
        return venda.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Object> createVenda(@RequestBody NovaVendaRequest novaVendaRequest) {
        try {
            Venda vendaSalva = vendaService.processarNovaVenda(novaVendaRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(vendaSalva);
        } catch (ValidacaoNegocioException e) {
            return createErrorResponse(e.getMessage());
        }
    }
    
    private ResponseEntity<Object> createErrorResponse(String errorMessage) {
        return ResponseEntity.badRequest()
                           .body(Collections.singletonMap(ERROR_MESSAGE_KEY, errorMessage));
    }
}