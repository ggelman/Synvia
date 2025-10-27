package com.synvia.core.service;

import com.synvia.core.dto.BackupDTO;
import com.synvia.core.dto.UsuarioBackupDTO;
import com.synvia.core.exception.RecursoNaoEncontradoException;
import com.synvia.core.model.*;
import com.synvia.core.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final VendaRepository vendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final BackupMetadataRepository metadataRepository;
    private final String backupLocation;

    public BackupService(ClienteRepository cRepo, ProdutoRepository pRepo, VendaRepository vRepo,
            UsuarioRepository uRepo, PedidoRepository pedRepo, ItemPedidoRepository iRepo,
            BackupMetadataRepository metaRepo, @Value("${backup.storage.location}") String backupLocation) {
        this.clienteRepository = cRepo;
        this.produtoRepository = pRepo;
        this.vendaRepository = vRepo;
        this.usuarioRepository = uRepo;
        this.pedidoRepository = pedRepo;
        this.itemPedidoRepository = iRepo;
        this.metadataRepository = metaRepo;
        this.backupLocation = backupLocation;
    }

    @Transactional(readOnly = true)
    public BackupDTO gerarDadosParaBackup() {
        List<Cliente> clientes = clienteRepository.findAll();
        List<Produto> produtos = produtoRepository.findAll();
        List<Venda> vendas = vendaRepository.findAllWithDetails();

        List<UsuarioBackupDTO> usuariosDTO = usuarioRepository.findAll().stream()
                .map(u -> new UsuarioBackupDTO(u.getId(), u.getNome(), u.getEmail(), u.getRole(), u.getUltimoAcesso(),
                        u.isAtivo()))
                .collect(Collectors.toList());

        return new BackupDTO(clientes, produtos, vendas, usuariosDTO);
    }

    @Transactional
    public void restaurarBackup(BackupDTO backupData) {
        vendaRepository.deleteAllInBatch();
        itemPedidoRepository.deleteAllInBatch();
        pedidoRepository.deleteAllInBatch();
        clienteRepository.deleteAllInBatch();
        produtoRepository.deleteAllInBatch();

        clienteRepository.saveAll(backupData.clientes());
        produtoRepository.saveAll(backupData.produtos());
        vendaRepository.saveAll(backupData.vendas());
    }

    @Transactional
    public void salvarMetadata(String nomeArquivo, long tamanhoBytes) {
        BackupMetadata metadata = new BackupMetadata();
        metadata.setNomeArquivo(nomeArquivo);
        metadata.setDataCriacao(LocalDateTime.now());

        double tamanhoEmMb = (double) tamanhoBytes / (1024 * 1024);
        metadata.setTamanho(String.format("%.1f MB", tamanhoEmMb));

        metadataRepository.save(metadata);
    }

    @Transactional(readOnly = true)
    public List<BackupMetadata> listarBackups() {
        return metadataRepository.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "dataCriacao"));
    }

    public void salvarArquivoDeBackup(String nomeArquivo, byte[] conteudo) throws IOException {
        Path destinationFile = Paths.get(backupLocation).resolve(
                Paths.get(nomeArquivo)).normalize().toAbsolutePath();
        Files.write(destinationFile, conteudo);
    }

    public Resource carregarArquivoDeBackup(String nomeArquivo) throws MalformedURLException {
        Path filePath = Paths.get(backupLocation).resolve(nomeArquivo).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Não foi possível ler o arquivo: " + nomeArquivo);
        }
    }

    public void deletarArquivoDeBackup(String nomeArquivo) throws IOException {
        Path fileToDelete = Paths.get(backupLocation).resolve(nomeArquivo).normalize();
        Files.deleteIfExists(fileToDelete);
    }

    @Transactional
    public void excluirBackup(Long id) throws IOException {
        BackupMetadata metadata = metadataRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de backup não encontrado."));

        deletarArquivoDeBackup(metadata.getNomeArquivo());
        metadataRepository.deleteById(id);
    }
}