package com.synvia.core.service;

import com.synvia.core.model.RefreshToken;
import com.synvia.core.model.Usuario;
import com.synvia.core.repository.RefreshTokenRepository;
import com.synvia.core.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final int maxActiveSessions;
    private final int retentionDays;

    public record IssuedToken(String tokenId, String tokenValue) { }

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               JwtUtil jwtUtil,
                               PasswordEncoder passwordEncoder,
                               @Value("${security.refresh-token.max-active:3}") int maxActiveSessions,
                               @Value("${security.refresh-token.retention-days:30}") int retentionDays) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.maxActiveSessions = Math.max(1, maxActiveSessions);
        this.retentionDays = Math.max(1, retentionDays);
    }

    @Transactional
    public IssuedToken issueToken(Usuario usuario) {
        IssuedToken issuedToken = createToken(usuario);
        enforceSessionLimit(usuario.getId());
        purgeExpired(usuario.getId());
        return issuedToken;
    }

    @Transactional
    public IssuedToken rotateToken(String existingTokenValue, Usuario usuario) {
        RefreshToken existing = validateToken(existingTokenValue, usuario);
        existing.setRevoked(true);

        IssuedToken newToken = createToken(usuario);
        existing.setReplacedByTokenId(newToken.tokenId());
        refreshTokenRepository.save(existing);

        enforceSessionLimit(usuario.getId());
        purgeExpired(usuario.getId());
        return newToken;
    }

    public boolean isValid(String tokenValue, Usuario usuario) {
        try {
            validateToken(tokenValue, usuario);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private IssuedToken createToken(Usuario usuario) {
        String tokenId = UUID.randomUUID().toString();
        String tokenValue = jwtUtil.generateRefreshToken(usuario, tokenId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenId(tokenId);
        refreshToken.setTokenHash(passwordEncoder.encode(tokenValue));
        refreshToken.setUsuario(usuario);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setExpiresAt(LocalDateTime.ofInstant(
                jwtUtil.extractRefreshExpiration(tokenValue).toInstant(), ZoneId.systemDefault()));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);
        return new IssuedToken(tokenId, tokenValue);
    }

    private RefreshToken validateToken(String tokenValue, Usuario usuario) {
        String tokenId = jwtUtil.extractTokenIdFromRefreshToken(tokenValue);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token não registrado"));

        if (!refreshToken.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Refresh token pertence a outro usuário");
        }

        if (refreshToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token revogado");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expirado");
        }

        if (!passwordEncoder.matches(tokenValue, refreshToken.getTokenHash())) {
            throw new IllegalArgumentException("Refresh token inválido");
        }

        return refreshToken;
    }

    private void enforceSessionLimit(Long usuarioId) {
        List<RefreshToken> activeTokens = refreshTokenRepository
                .findByUsuarioIdAndRevokedFalseOrderByCreatedAtAsc(usuarioId);

        if (activeTokens.size() <= maxActiveSessions) {
            return;
        }

        int tokensToRevoke = activeTokens.size() - maxActiveSessions;
        activeTokens.stream()
                .sorted(Comparator.comparing(RefreshToken::getCreatedAt))
                .limit(tokensToRevoke)
                .forEach(token -> {
                    token.setRevoked(true);
                    token.setReplacedByTokenId("session-limit");
                    refreshTokenRepository.save(token);
                });
    }

    private void purgeExpired(Long usuarioId) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        refreshTokenRepository.deleteByUsuarioIdAndCreatedAtBefore(usuarioId, cutoff);
    }
}
