package com.synvia.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VendaPortabilidadeDTO(
        Long idVenda,
        LocalDateTime dataVenda,
        BigDecimal totalVenda,
        List<ItemVendaPortabilidadeDTO> itens) {
}