package com.synvia.core.controller;

import com.synvia.core.config.CacheConfig;
import com.synvia.core.model.Produto;
import com.synvia.core.repository.ProdutoRepository;
import io.micrometer.observation.annotation.Observed;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/cardapio")
@CrossOrigin(origins = "*")
public class CardapioPublicoController {

    // Constantes para strings literals duplicadas
    private static final String SUCCESS_KEY = "success";
    private static final String PRODUTOS_KEY = "produtos";
    private static final String MESSAGE_KEY = "message";

    private final ProdutoRepository produtoRepository;

    public CardapioPublicoController(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @GetMapping
    @Observed(name = "public.cardapio.listar", contextualName = "listar-cardapio")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:listar'",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> listarProdutosCardapio() {
        try {
            List<Produto> produtos = produtoRepository.findAll();
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                PRODUTOS_KEY, produtos
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar produtos: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/produtos")
    @Observed(name = "public.cardapio.listar.paginado", contextualName = "listar-cardapio-paginado")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:paginado:' + #page + ':' + #size + ':' + (#categoria != null ? #categoria : 'all') + ':' + (#busca != null ? #busca : 'all')",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> listarProdutos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String busca) {
        try {
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by("categoria").and(Sort.by("nome")));
            Page<Produto> produtosPage;

            if (categoria != null && !categoria.isEmpty()) {
                if (busca != null && !busca.isEmpty()) {
                    produtosPage = produtoRepository.findByCategoriaAndNomeContainingIgnoreCase(categoria, busca, pageRequest);
                } else {
                    produtosPage = produtoRepository.findByCategoria(categoria, pageRequest);
                }
            } else if (busca != null && !busca.isEmpty()) {
                produtosPage = produtoRepository.findByNomeContainingIgnoreCase(busca, pageRequest);
            } else {
                produtosPage = produtoRepository.findAll(pageRequest);
            }

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                PRODUTOS_KEY, produtosPage.getContent(),
                "totalPages", produtosPage.getTotalPages(),
                "totalElements", produtosPage.getTotalElements(),
                "currentPage", page,
                "hasNext", produtosPage.hasNext(),
                "hasPrevious", produtosPage.hasPrevious()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar produtos: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/categorias")
    @Observed(name = "public.cardapio.categorias", contextualName = "listar-categorias")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:categorias'",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> listarCategorias() {
        try {
            List<String> categorias = produtoRepository.findDistinctCategorias();
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                "categorias", categorias
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar categorias: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/categoria/{categoria}")
    @Observed(name = "public.cardapio.categoria", contextualName = "listar-categoria")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:categoria:' + #categoria",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> listarProdutosPorCategoria(@PathVariable String categoria) {
        try {
            List<Produto> produtos = produtoRepository.findByCategoriaOrderByNome(categoria);
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                PRODUTOS_KEY, produtos,
                "categoria", categoria,
                "total", produtos.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar produtos da categoria: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/destaque")
    @Observed(name = "public.cardapio.destaque", contextualName = "listar-destaques")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:destaques:' + #limite",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> listarProdutosDestaque(@RequestParam(defaultValue = "6") int limite) {
        try {
            PageRequest pageRequest = PageRequest.of(0, limite, Sort.by("nome"));
            Page<Produto> produtosPage = produtoRepository.findAll(pageRequest);
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                PRODUTOS_KEY, produtosPage.getContent(),
                "total", produtosPage.getContent().size()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao listar produtos em destaque: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    @Observed(name = "public.cardapio.obter", contextualName = "obter-produto")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:produto:' + #id",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> obterProduto(@PathVariable Long id) {
        try {
            Produto produto = produtoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                "produto", produto
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao obter produto: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/buscar")
    @Observed(name = "public.cardapio.buscar", contextualName = "buscar-produtos")
    @Cacheable(cacheNames = CacheConfig.PUBLIC_CARDAPIO_CACHE,
            key = "'cardapio:buscar:' + #termo + ':' + #page + ':' + #size",
            unless = "#result == null || !#result.getStatusCode().is2xxSuccessful()")
    public ResponseEntity<Map<String, Object>> buscarProdutos(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by("nome"));
            Page<Produto> produtosPage = produtoRepository.findByNomeContainingIgnoreCaseOrDescricaoContainingIgnoreCase(
                    termo, termo, pageRequest);
            
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                PRODUTOS_KEY, produtosPage.getContent(),
                "totalPages", produtosPage.getTotalPages(),
                "totalElements", produtosPage.getTotalElements(),
                "currentPage", page,
                "termoBusca", termo
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao buscar produtos: " + e.getMessage()
            ));
        }
    }
}
