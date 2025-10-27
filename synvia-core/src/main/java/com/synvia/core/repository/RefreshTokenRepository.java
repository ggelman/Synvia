package com.synvia.core.repository;

import com.synvia.core.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenId(String tokenId);

    List<RefreshToken> findByUsuarioIdAndRevokedFalseOrderByCreatedAtAsc(Long usuarioId);

    long deleteByUsuarioIdAndCreatedAtBefore(Long usuarioId, LocalDateTime cutoff);
}
