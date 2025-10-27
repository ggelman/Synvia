package com.synvia.core.dto;

public record ConfiguracaoBackupDTO(
        boolean backupDiarioAtivo,
        boolean backupSemanalAtivo,
        boolean notificarPorEmail) {
}