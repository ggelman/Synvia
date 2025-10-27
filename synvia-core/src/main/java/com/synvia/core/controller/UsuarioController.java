package com.synvia.core.controller;

import com.synvia.core.model.Usuario;
import com.synvia.core.repository.UsuarioRepository;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario createUsuario(@Valid @RequestBody Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetails) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNome(usuarioDetails.getNome());
                    usuario.setEmail(usuarioDetails.getEmail());
                    usuario.setRole(usuarioDetails.getRole());

                    if (usuarioDetails.getSenha() != null && !usuarioDetails.getSenha().isEmpty()) {
                        usuario.setSenha(passwordEncoder.encode(usuarioDetails.getSenha()));
                    }

                    Usuario updatedUsuario = usuarioRepository.save(usuario);
                    return ResponseEntity.ok(updatedUsuario);
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Usuario> toggleUsuarioStatus(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setAtivo(!usuario.isAtivo());
                    Usuario updatedUsuario = usuarioRepository.save(usuario);
                    return ResponseEntity.ok(updatedUsuario);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuarioRepository.delete(usuario);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hash/{senha}")
    public String getSenhaHash(@PathVariable String senha) {
        return passwordEncoder.encode(senha);
    }
}