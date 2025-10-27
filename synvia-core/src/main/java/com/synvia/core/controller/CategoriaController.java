package com.synvia.core.controller;

import com.synvia.core.model.Categoria;
import com.synvia.core.repository.CategoriaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Categoria> getAllCategorias() {
        return categoriaRepository.findAll();
    }

    @PostMapping
    public Categoria createCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> updateCategoria(@PathVariable Integer id,
            @RequestBody Categoria categoriaDetails) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    categoria.setNome(categoriaDetails.getNome());
                    categoria.setDescricao(categoriaDetails.getDescricao());
                    categoria.setCor(categoriaDetails.getCor());
                    Categoria updatedCategoria = categoriaRepository.save(categoria);
                    return ResponseEntity.ok(updatedCategoria);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategoria(@PathVariable Integer id) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    categoriaRepository.delete(categoria);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}