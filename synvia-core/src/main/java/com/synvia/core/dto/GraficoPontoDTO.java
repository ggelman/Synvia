package com.synvia.core.dto;

import java.math.BigDecimal;

public record GraficoPontoDTO(
    String label, 
    BigDecimal valor 
) {}