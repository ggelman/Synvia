package com.synvia.core.controller;

import com.synvia.core.model.MetaFinanceira;
import com.synvia.core.service.MetaFinanceiraService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/metas-financeiras")
@CrossOrigin(origins = "http://localhost:3000")
public class MetaFinanceiraController {

    private final MetaFinanceiraService metaService;

    public MetaFinanceiraController(MetaFinanceiraService metaService) {
        this.metaService = metaService;
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<MetaFinanceira>> getMetasAtivas() {
        return ResponseEntity.ok(metaService.getMetasAtivasComProgresso());
    }

    @PostMapping
    public ResponseEntity<MetaFinanceira> criarMeta(@RequestBody MetaFinanceira novaMeta) {
        MetaFinanceira metaSalva = metaService.criarMeta(novaMeta);
        return ResponseEntity.status(HttpStatus.CREATED).body(metaSalva);
    }
}