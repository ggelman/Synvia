
package com.synvia.core.repository;

import com.synvia.core.model.Cliente;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByCpf(String cpf);

    Optional<Cliente> findByEmail(String email);

    @Query(value = "SELECT * FROM cliente WHERE MONTH(data_nascimento) = MONTH(CURDATE()) AND DAY(data_nascimento) = DAY(CURDATE()) AND cpf != '00000000000'", nativeQuery = true)
    List<Cliente> findAniversariantesDoDia();
    
    // Métodos para Dashboard de Auditoria
    long countByNomeContaining(String nome);
}