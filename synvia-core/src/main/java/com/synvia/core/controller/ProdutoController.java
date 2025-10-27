package com.synvia.core.controller;

import com.synvia.core.model.Categoria;
import com.synvia.core.model.Produto;
import com.synvia.core.repository.CategoriaRepository;
import com.synvia.core.repository.ProdutoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "http://localhost:3000")
public class ProdutoController {

    private static final String TIPO_ENTRADA = "entrada";
    private static final String TIPO_SAIDA = "saida";
    private static final String TIPO_KEY = "tipo";
    private static final String QUANTIDADE_KEY = "quantidade";
    private static final String PRODUTO_EXISTE_MSG = "Já existe um produto com este nome.";
    private static final int QUANTIDADE_MINIMA = 0;

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoController(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Produto> listarTodosProdutos() {
        List<Produto> produtos = produtoRepository.findAll();
        return produtos.isEmpty() ? Collections.emptyList() : produtos;
    }

    @GetMapping("/disponiveis")
    public List<Produto> listarProdutosDisponiveis() {
        List<Produto> produtos = produtoRepository.findProdutosDisponiveis();
        return produtos.isEmpty() ? Collections.emptyList() : produtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) {
        Optional<Produto> produto = produtoRepository.findById(id);
        return produto.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Object> criarProduto(@RequestBody Produto novoProduto) {
        if (produtoRepository.findByNomeIgnoreCase(novoProduto.getNome()).isPresent()) {
            return createErrorResponse(PRODUTO_EXISTE_MSG);
        }
        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
    }

    @PutMapping("/{produtoId}/categoria")
    public ResponseEntity<Produto> updateProdutoCategoria(
            @PathVariable Long produtoId,
            @RequestBody(required = false) Categoria categoria) {

        Optional<Produto> produtoOptional = produtoRepository.findById(produtoId);
        if (produtoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoOptional.get();
        
        if (isValidCategoria(categoria)) {
            Optional<Categoria> categoriaOptional = categoriaRepository.findById(categoria.getId());
            if (categoriaOptional.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            produto.setCategoria(categoriaOptional.get());
        } else {
            produto.setCategoria(null);
        }

        Produto updatedProduto = produtoRepository.save(produto);
        return ResponseEntity.ok(updatedProduto);
    }

    @PostMapping("/{id}/ajustar-estoque")
    public ResponseEntity<Produto> ajustarEstoque(@PathVariable Long id, @RequestBody Map<String, Object> ajuste) {

        Optional<Produto> produtoOptional = produtoRepository.findById(id);
        if (produtoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoOptional.get();

        String tipo = (String) ajuste.get(TIPO_KEY);
        Integer quantidade = (Integer) ajuste.get(QUANTIDADE_KEY);

        if (!isValidAjusteEstoque(tipo, quantidade)) {
            return ResponseEntity.badRequest().build();
        }

        processarAjusteEstoque(produto, tipo, quantidade);

        Produto produtoAtualizado = produtoRepository.save(produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        if (!produtoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        produtoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private ResponseEntity<Object> createErrorResponse(String errorMessage) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                           .body(Collections.singletonMap("error", errorMessage));
    }
    
    private boolean isValidCategoria(Categoria categoria) {
        return categoria != null && categoria.getId() != null;
    }
    
    private boolean isValidAjusteEstoque(String tipo, Integer quantidade) {
        return tipo != null && quantidade != null && quantidade > QUANTIDADE_MINIMA;
    }
    
    private void processarAjusteEstoque(Produto produto, String tipo, Integer quantidade) {
        if (TIPO_ENTRADA.equalsIgnoreCase(tipo)) {
            produto.setQtdAtual(produto.getQtdAtual() + quantidade);
        } else if (TIPO_SAIDA.equalsIgnoreCase(tipo)) {
            produto.setQtdAtual(Math.max(QUANTIDADE_MINIMA, produto.getQtdAtual() - quantidade));
        }
    }
}