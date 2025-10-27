package com.synvia.core.dto;

import java.time.LocalDateTime;

public record UsuarioBackupDTO(
        Long id,
        String nome,
        String email,
        String role,
        LocalDateTime ultimoAcesso,
        boolean ativo) {
}