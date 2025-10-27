package com.synvia.core.dto;

import java.util.List;

public record PortabilidadeClienteDTO(
        Long idCliente,
        String nome,
        String cpf,
        String telefone,
        String email,
        String observacoes,
        boolean participaFidelidade,

        List<VendaPortabilidadeDTO> historicoVendas) {
}