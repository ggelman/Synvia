package com.synvia.core.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    @Value("${jwt.refresh.expiration}")
    private Long refreshExpiration;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Refresh Token Methods
    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(userDetails, java.util.UUID.randomUUID().toString());
    }

    public String generateRefreshToken(UserDetails userDetails, String tokenId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        claims.put("jti", tokenId);
        return createRefreshToken(claims, userDetails.getUsername());
    }

    private String createRefreshToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getRefreshSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getRefreshSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(refreshSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsernameFromRefreshToken(String refreshToken) {
        return extractRefreshClaim(refreshToken, Claims::getSubject);
    }

    public Date extractRefreshExpiration(String refreshToken) {
        return extractRefreshClaim(refreshToken, Claims::getExpiration);
    }

    public <T> T extractRefreshClaim(String refreshToken, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllRefreshClaims(refreshToken);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllRefreshClaims(String refreshToken) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getRefreshSignKey())
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();
    }

    private Boolean isRefreshTokenExpired(String refreshToken) {
        return extractRefreshExpiration(refreshToken).before(new Date());
    }

    public Boolean validateRefreshToken(String refreshToken, UserDetails userDetails) {
        final String username = extractUsernameFromRefreshToken(refreshToken);
        final Claims claims = extractAllRefreshClaims(refreshToken);
        final String tokenType = (String) claims.get("tokenType");

        return (username.equals(userDetails.getUsername())
                && !isRefreshTokenExpired(refreshToken)
                && "refresh".equals(tokenType));
    }

    public Boolean isValidRefreshToken(String refreshToken) {
        try {
            extractAllRefreshClaims(refreshToken);
            return !isRefreshTokenExpired(refreshToken);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractTokenIdFromRefreshToken(String refreshToken) {
        final Claims claims = extractAllRefreshClaims(refreshToken);
        Object tokenId = claims.get("jti");
        if (tokenId == null) {
            throw new IllegalArgumentException("Refresh token sem identificador único");
        }
        return tokenId.toString();
    }
}