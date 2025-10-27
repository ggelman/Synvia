package com.synvia.core.controller;

import com.synvia.core.dto.ConfiguracaoBackupDTO;
import com.synvia.core.model.Configuracao;
import com.synvia.core.repository.ConfiguracaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracoes/backup")
@CrossOrigin(origins = "http://localhost:3000")
public class ConfiguracaoController {

    private final ConfiguracaoRepository configuracaoRepository;

    public ConfiguracaoController(ConfiguracaoRepository configuracaoRepository) {
        this.configuracaoRepository = configuracaoRepository;
    }

    @GetMapping
    public ResponseEntity<ConfiguracaoBackupDTO> getConfigs() {
        boolean diario = Boolean.parseBoolean(configuracaoRepository.findById("BACKUP_DIARIO_ATIVO")
                .orElse(new Configuracao("", "false")).getValor());
        boolean semanal = Boolean.parseBoolean(configuracaoRepository.findById("BACKUP_SEMANAL_ATIVO")
                .orElse(new Configuracao("", "false")).getValor());
        boolean email = Boolean.parseBoolean(configuracaoRepository.findById("BACKUP_NOTIFICAR_EMAIL")
                .orElse(new Configuracao("", "false")).getValor());
        return ResponseEntity.ok(new ConfiguracaoBackupDTO(diario, semanal, email));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Void> saveConfigs(@RequestBody ConfiguracaoBackupDTO dto) {
        configuracaoRepository.save(new Configuracao("BACKUP_DIARIO_ATIVO", String.valueOf(dto.backupDiarioAtivo())));
        configuracaoRepository.save(new Configuracao("BACKUP_SEMANAL_ATIVO", String.valueOf(dto.backupSemanalAtivo())));
        configuracaoRepository
                .save(new Configuracao("BACKUP_NOTIFICAR_EMAIL", String.valueOf(dto.notificarPorEmail())));
        return ResponseEntity.ok().build();
    }
}