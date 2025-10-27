package com.synvia.core.config;

import com.synvia.core.model.Usuario;
import com.synvia.core.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            System.out.println(">>> BANCO DE USUÁRIOS VAZIO. CRIANDO USUÁRIO ADMIN PADRÃO...");

            Usuario admin = new Usuario();
            admin.setNome("Admin Principal");
            admin.setEmail("admin@synvia.io");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setRole("ADMINISTRADOR");
            admin.setAtivo(true);

            usuarioRepository.save(admin);
            System.out.println(">>> USUÁRIO ADMIN CRIADO: admin@synvia.io / senha: admin123");
        }
    }
}
