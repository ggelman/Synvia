package com.synvia.core.controller;

import com.synvia.core.dto.BackupDTO;
import com.synvia.core.model.BackupMetadata;
import com.synvia.core.service.BackupService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/backup")
@CrossOrigin(origins = "http://localhost:3000")
public class BackupController {

    private final BackupService backupService;
    private final ObjectMapper objectMapper;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @GetMapping("/create")
    public ResponseEntity<byte[]> createBackup() {
        try {
            BackupDTO backupData = backupService.gerarDadosParaBackup();
            byte[] jsonBytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(backupData);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "backup_" + timestamp + ".json";

            backupService.salvarArquivoDeBackup(filename, jsonBytes);

            backupService.salvarMetadata(filename, jsonBytes.length);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", filename);

            return new ResponseEntity<>(jsonBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/restore")
    public ResponseEntity<String> restoreBackup(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo para upload.");
        }
        try {
            BackupDTO backupData = objectMapper.readValue(file.getBytes(), BackupDTO.class);
            backupService.restaurarBackup(backupData);
            return ResponseEntity.ok("Backup restaurado com sucesso.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro de formatação no arquivo JSON. Verifique se o arquivo não está corrompido.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro de banco de dados ao restaurar: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<BackupMetadata>> getBackupHistory() {
        return ResponseEntity.ok(backupService.listarBackups());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBackup(@PathVariable Long id) {
        try {
            backupService.excluirBackup(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}