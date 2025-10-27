package com.synvia.core.service;

import com.synvia.core.dto.ClienteUpdateRequest;
import com.synvia.core.dto.ItemVendaPortabilidadeDTO;
import com.synvia.core.dto.PortabilidadeClienteDTO;
import com.synvia.core.dto.VendaPortabilidadeDTO;
import com.synvia.core.exception.RecursoNaoEncontradoException;
import com.synvia.core.exception.ValidacaoNegocioException;
import com.synvia.core.model.Cliente;
import com.synvia.core.model.Fidelidade;
import com.synvia.core.model.Venda;
import com.synvia.core.repository.ClienteRepository;
import com.synvia.core.repository.VendaRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final VendaRepository vendaRepository;
    private final AuditoriaService auditoriaService;

    public ClienteService(ClienteRepository clienteRepository, VendaRepository vendaRepository,
            AuditoriaService auditoriaService) {
        this.clienteRepository = clienteRepository;
        this.vendaRepository = vendaRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public Cliente criarCliente(Cliente novoCliente) {
        if (!novoCliente.isConsentimentoLgpd()) {
            throw new ValidacaoNegocioException("O consentimento para o tratamento de dados é obrigatório.");
        }
        if (novoCliente.getCpf() == null || novoCliente.getCpf().trim().isEmpty()) {
            throw new ValidacaoNegocioException("O campo CPF é obrigatório.");
        }
        if (novoCliente.getDataNascimento() != null
                && Period.between(novoCliente.getDataNascimento(), LocalDate.now()).getYears() < 10) {
            throw new ValidacaoNegocioException("O cliente deve ter no mínimo 10 anos.");
        }
        if (clienteRepository.findByCpf(novoCliente.getCpf()).isPresent()) {
            throw new ValidacaoNegocioException("Já existe um cliente cadastrado com o CPF informado.");
        }
        if (novoCliente.getEmail() != null && !novoCliente.getEmail().isEmpty()
                && clienteRepository.findByEmail(novoCliente.getEmail()).isPresent()) {
            throw new ValidacaoNegocioException("Já existe um cliente cadastrado com o E-mail informado.");
        }

        if (novoCliente.isParticipaFidelidade()) {
            Fidelidade fidelidade = new Fidelidade();
            fidelidade.setCliente(novoCliente);
            novoCliente.setFidelidade(fidelidade);
        }

        return clienteRepository.save(novoCliente);
    }

    @Transactional
    public void anonimizarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id));

        if ("00000000000".equals(cliente.getCpf())) {
            throw new ValidacaoNegocioException("Este cliente já foi anonimizado.");
        }

        String detalhes = String.format("Cliente ID %d (Nome: %s, CPF: %s) foi anonimizado.",
                cliente.getIdCliente(), cliente.getNome(), cliente.getCpf());

        cliente.setNome("Cliente Removido");
        cliente.setCpf("00000000000");
        cliente.setTelefone("00000000000");
        cliente.setEmail(null);
        cliente.setDataNascimento(null);
        cliente.setObservacoes("Dados removidos por solicitação do titular em " + LocalDate.now());
        cliente.setConsentimentoLgpd(false);
        cliente.setParticipaFidelidade(false);
        cliente.setFidelidade(null);

        clienteRepository.save(cliente);

        auditoriaService.registrarLog("ANONIMIZACAO_CLIENTE", detalhes);
    }

    @Transactional
    public Cliente atualizarCliente(Long id, ClienteUpdateRequest updateRequest) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id));

        if ("00000000000".equals(cliente.getCpf())) {
            throw new ValidacaoNegocioException("Não é possível editar um cliente anonimizado.");
        }

        StringBuilder detalhesMudanca = new StringBuilder("Cliente ID " + id + " atualizado: ");
        boolean mudou = false;

        if (updateRequest.nome() != null && !updateRequest.nome().equals(cliente.getNome())) {
            detalhesMudanca.append(String.format("Nome de '%s' para '%s'. ", cliente.getNome(), updateRequest.nome()));
            cliente.setNome(updateRequest.nome());
            mudou = true;
        }
        if (updateRequest.telefone() != null && !updateRequest.telefone().equals(cliente.getTelefone())) {
            detalhesMudanca.append(
                    String.format("Telefone de '%s' para '%s'. ", cliente.getTelefone(), updateRequest.telefone()));
            cliente.setTelefone(updateRequest.telefone());
            mudou = true;
        }
        if (updateRequest.email() != null && !updateRequest.email().equals(cliente.getEmail())) {
            clienteRepository.findByEmail(updateRequest.email()).ifPresent(outroCliente -> {
                if (!outroCliente.getIdCliente().equals(id)) {
                    throw new ValidacaoNegocioException("Este e-mail já está em uso por outro cliente.");
                }
            });
            detalhesMudanca
                    .append(String.format("Email de '%s' para '%s'. ", cliente.getEmail(), updateRequest.email()));
            cliente.setEmail(updateRequest.email());
            mudou = true;
        }

        if (updateRequest.dataNascimento() != null
                && !updateRequest.dataNascimento().equals(cliente.getDataNascimento())) {
            detalhesMudanca.append(String.format("Data de Nascimento de '%s' para '%s'. ", cliente.getDataNascimento(),
                    updateRequest.dataNascimento()));
            cliente.setDataNascimento(updateRequest.dataNascimento());
            mudou = true;
        }

        if (updateRequest.observacoes() != null && !updateRequest.observacoes().equals(cliente.getObservacoes())) {
            detalhesMudanca.append("Observações foram atualizadas. ");
            cliente.setObservacoes(updateRequest.observacoes());
            mudou = true;
        }

        if (mudou) {
            auditoriaService.registrarLog("EDICAO_CLIENTE", detalhesMudanca.toString());
        }

        return clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public PortabilidadeClienteDTO gerarDadosPortabilidade(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id));

        List<Venda> vendas = vendaRepository.findByPedidoCliente(cliente);

        List<VendaPortabilidadeDTO> historicoVendasDTO = vendas.stream()
                .map(venda -> new VendaPortabilidadeDTO(
                        venda.getIdVenda(),
                        venda.getData(),
                        venda.getValorTotal(),
                        venda.getPedido().getItens().stream()
                                .map(item -> new ItemVendaPortabilidadeDTO(
                                        item.getProduto().getNome(),
                                        item.getQuantidade(),
                                        item.getPrecoUnitario()))
                                .toList()))
                .toList();

        return new PortabilidadeClienteDTO(
                cliente.getIdCliente(),
                cliente.getNome(),
                cliente.getCpf(),
                cliente.getTelefone(),
                cliente.getEmail(),
                cliente.getObservacoes(),
                cliente.isParticipaFidelidade(),
                historicoVendasDTO);
    }

    public String hashSenha(String senha) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(senha);
    }
}