package com.synvia.core.controller;

import com.synvia.core.model.Loja;
import com.synvia.core.repository.LojaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lojas")
@CrossOrigin(origins = "http://localhost:3000")
public class LojaController {

    private final LojaRepository lojaRepository;

    public LojaController(LojaRepository lojaRepository) {
        this.lojaRepository = lojaRepository;
    }

    @GetMapping
    public List<Loja> getAllLojas() {
        return lojaRepository.findAll();
    }

    @PostMapping
    public Loja createLoja(@RequestBody Loja loja) {
        // Inicializa valores padrão para novas lojas
        loja.setVendas(0);
        loja.setFaturamento(0.0);
        return lojaRepository.save(loja);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loja> updateLoja(@PathVariable Integer id, @RequestBody Loja lojaDetails) {
        return lojaRepository.findById(id)
                .map(loja -> {
                    loja.setNome(lojaDetails.getNome());
                    loja.setEndereco(lojaDetails.getEndereco());
                    loja.setTelefone(lojaDetails.getTelefone());
                    loja.setEmail(lojaDetails.getEmail());
                    loja.setCnpj(lojaDetails.getCnpj());
                    loja.setResponsavel(lojaDetails.getResponsavel());
                    loja.setAtiva(lojaDetails.isAtiva());
                    // Não atualizamos vendas/faturamento aqui, isso viria de outro processo
                    Loja updatedLoja = lojaRepository.save(loja);
                    return ResponseEntity.ok(updatedLoja);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoja(@PathVariable Integer id) {
        return lojaRepository.findById(id)
                .map(loja -> {
                    lojaRepository.delete(loja);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}