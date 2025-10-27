package com.synvia.core.dto;

import java.math.BigDecimal;

public record ItemVendaPortabilidadeDTO(
        String nomeProduto,
        int quantidade,
        BigDecimal precoUnitario) {
}