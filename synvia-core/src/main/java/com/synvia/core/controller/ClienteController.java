package com.synvia.core.controller;

import com.synvia.core.dto.ClienteUpdateRequest;
import com.synvia.core.dto.PortabilidadeClienteDTO;
import com.synvia.core.model.Cliente;
import com.synvia.core.repository.ClienteRepository;
import com.synvia.core.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "http://localhost:3000")
public class ClienteController {

    private static final String CPF_REGEX = "[.\\-]";

    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    public ClienteController(ClienteRepository clienteRepository, ClienteService clienteService) {
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<Cliente> listarTodosClientes() {
        List<Cliente> clientes = clienteRepository.findAll();
        return clientes.isEmpty() ? Collections.emptyList() : clientes;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarClientePorId(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        return cliente.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cliente> criarCliente(@Valid @RequestBody Cliente novoCliente) {
        String cpfSemFormatacao = formatarCpf(novoCliente.getCpf());
        novoCliente.setCpf(cpfSemFormatacao);

        Cliente clienteSalvo = clienteService.criarCliente(novoCliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteSalvo);
    }

    @PostMapping("/publico")
    public ResponseEntity<Cliente> criarClientePublico(@Valid @RequestBody Cliente novoCliente) {
        try {
            if (novoCliente.getSenha() == null || !validarSenha(novoCliente.getSenha())) {
                return ResponseEntity.badRequest().body(null);
            }

            String senhaHash = clienteService.hashSenha(novoCliente.getSenha());
            novoCliente.setSenha(senhaHash);

            String cpfSemFormatacao = formatarCpf(novoCliente.getCpf());
            System.out.println("CPF sem formatação: " + cpfSemFormatacao);
            novoCliente.setCpf(cpfSemFormatacao);

            Cliente clienteSalvo = clienteService.criarCliente(novoCliente);
            System.out.println("Cliente salvo com sucesso, ID: " + clienteSalvo.getIdCliente());
            return ResponseEntity.status(HttpStatus.CREATED).body(clienteSalvo);
        } catch (Exception e) {
            System.err.println("Erro ao criar cliente público: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean validarSenha(String senha) {
        return senha.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");
    }

    @PostMapping("/{id}/anonymize")
    public ResponseEntity<Void> anonimizarCliente(@PathVariable Long id) {
        clienteService.anonimizarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/portabilidade")
    public ResponseEntity<PortabilidadeClienteDTO> portabilidadeCliente(@PathVariable Long id) {
        PortabilidadeClienteDTO dados = clienteService.gerarDadosPortabilidade(id);
        return ResponseEntity.ok(dados);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizarCliente(@PathVariable Long id,
            @RequestBody ClienteUpdateRequest updateRequest) {
        Cliente clienteAtualizado = clienteService.atualizarCliente(id, updateRequest);
        return ResponseEntity.ok(clienteAtualizado);
    }

    private String formatarCpf(String cpf) {
        return cpf != null ? cpf.replaceAll(CPF_REGEX, "") : "";
    }

    @PostMapping("/auth/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String senha = loginRequest.get("senha");

        Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos.");
        }

        Cliente cliente = clienteOpt.get();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (!encoder.matches(senha, cliente.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos.");
        }

        return ResponseEntity.ok("Login bem-sucedido.");
    }
}