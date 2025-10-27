package com.synvia.core.dto;

import com.synvia.core.model.Cliente;
import com.synvia.core.model.Produto;
import com.synvia.core.model.Venda;

import java.util.List;

public record BackupDTO(
                List<Cliente> clientes,
                List<Produto> produtos,
                List<Venda> vendas,
                List<UsuarioBackupDTO> usuarios) {
}