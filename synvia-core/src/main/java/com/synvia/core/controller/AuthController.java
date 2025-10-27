package com.synvia.core.controller;

import com.synvia.core.dto.RefreshTokenRequest;
import com.synvia.core.model.Usuario;
import com.synvia.core.repository.UsuarioRepository;
import com.synvia.core.service.MfaService;
import com.synvia.core.service.RefreshTokenService;
import com.synvia.core.service.RefreshTokenService.IssuedToken;
import com.synvia.core.util.JwtUtil;
import io.micrometer.observation.annotation.Observed;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final String ERROR_KEY = "error";
    private static final String ACCESS_TOKEN_KEY = "accessToken";
    private static final String REFRESH_TOKEN_KEY = "refreshToken";
    private static final String TOKEN_TYPE_KEY = "tokenType";
    private static final String BEARER = "Bearer";
    private static final String EXPIRES_IN_KEY = "expiresIn";
    private static final int TOKEN_EXPIRY_SECONDS = 86400; // 24 hours
    private static final String INVALID_REFRESH_TOKEN = "Invalid refresh token";
    private static final String INVALID_MFA_CODE = "Invalid or missing MFA code";
    private static final String MFA_REQUIRED_KEY = "mfaRequired";
    private static final String MFA_SETUP_KEY = "mfaSetupRequired";
    private static final String OTP_AUTH_URL_KEY = "otpauthUrl";
    private static final String SECRET_KEY = "secret";

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;
    private final MfaService mfaService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService, RefreshTokenService refreshTokenService,
            MfaService mfaService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.refreshTokenService = refreshTokenService;
        this.mfaService = mfaService;
    }

    @PostMapping("/login")
    @Observed(name = "auth.login", contextualName = "login-administrativo")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getSenha()));

        Usuario usuario = (Usuario) authentication.getPrincipal();

        ResponseEntity<Map<String, Object>> mfaResponse = handleMfaFlow(usuario, authRequest.getOtp());
        if (mfaResponse != null) {
            return mfaResponse;
        }

        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String accessToken = jwtUtil.generateToken(usuario);
        IssuedToken refreshToken = refreshTokenService.issueToken(usuario);

        Map<String, Object> userResponse = createUserResponse(usuario);
        Map<String, Object> response = createTokenResponse(accessToken, refreshToken.tokenValue(), userResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Observed(name = "auth.refresh", contextualName = "refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody RefreshTokenRequest refreshRequest) {
        try {
            String refreshToken = refreshRequest.getRefreshToken();
            
            if (refreshToken == null || !jwtUtil.isValidRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, INVALID_REFRESH_TOKEN));
            }

            String username = jwtUtil.extractUsernameFromRefreshToken(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (!jwtUtil.validateRefreshToken(refreshToken, userDetails)) {
                return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, INVALID_REFRESH_TOKEN));
            }

            IssuedToken rotatedToken = refreshTokenService.rotateToken(refreshToken, (Usuario) userDetails);

            String newAccessToken = jwtUtil.generateToken(userDetails);

            Map<String, Object> response = createTokenResponse(newAccessToken, rotatedToken.tokenValue(), null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, INVALID_REFRESH_TOKEN));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: O email já está em uso!");
        }
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuário registrado com sucesso!");
    }

    private Map<String, Object> createUserResponse(Usuario usuario) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", usuario.getId());
        userResponse.put("nome", usuario.getNome());
        userResponse.put("email", usuario.getEmail());
        userResponse.put("perfil", usuario.getRole() != null ? usuario.getRole().toLowerCase() : null);
        userResponse.put("permissoes", getPermissionsFromRole(usuario.getRole()));
        return userResponse;
    }

    private Map<String, Object> createTokenResponse(String accessToken, String refreshToken, Map<String, Object> userResponse) {
        Map<String, Object> response = new HashMap<>();
        response.put(ACCESS_TOKEN_KEY, accessToken);
        response.put(REFRESH_TOKEN_KEY, refreshToken);
        response.put(TOKEN_TYPE_KEY, BEARER);
        response.put(EXPIRES_IN_KEY, TOKEN_EXPIRY_SECONDS);
        if (userResponse != null) {
            response.put("user", userResponse);
        }
        return response;
    }

    private List<String> getPermissionsFromRole(String role) {
        if ("ADMINISTRADOR".equalsIgnoreCase(role)) {
            return List.of("vendas", "produtos", "clientes", "estoque", "relatorios", "usuarios", "backup",
                    "configuracoes", "ia/previsao");
        } else if ("GERENTE".equalsIgnoreCase(role)) {
            return List.of("vendas", "produtos", "clientes", "estoque", "relatorios", "backup");
        } else if ("FUNCIONARIO".equalsIgnoreCase(role)) {
            return List.of("vendas", "clientes");
        }
        return Collections.emptyList();
    }

    public static class AuthRequest {
        private String email;
        private String senha;
        private String otp;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }

    private ResponseEntity<Map<String, Object>> handleMfaFlow(Usuario usuario, String otp) {
        if (!"ADMINISTRADOR".equalsIgnoreCase(usuario.getRole())) {
            return null;
        }

        if (usuario.getMfaSecret() == null || usuario.getMfaSecret().isBlank()) {
            usuario.setMfaSecret(mfaService.generateNewSecret());
            usuarioRepository.save(usuario);
        }

        if (!usuario.isMfaEnabled()) {
            if (otp == null || otp.isBlank()) {
                Map<String, Object> response = new HashMap<>();
                response.put(MFA_SETUP_KEY, true);
                response.put(SECRET_KEY, usuario.getMfaSecret());
                response.put(OTP_AUTH_URL_KEY,
                        mfaService.buildOtpAuthUrl("Synvia Platform", usuario.getEmail(), usuario.getMfaSecret()));
                response.put("user", createUserResponse(usuario));
                return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(response);
            }

            if (mfaService.isCodeValid(usuario.getMfaSecret(), otp)) {
                usuario.setMfaEnabled(true);
                usuario.setLastMfaEnrollment(LocalDateTime.now());
                usuarioRepository.save(usuario);
                return null;
            }

            return ResponseEntity.status(401).body(Map.of(ERROR_KEY, INVALID_MFA_CODE));
        }

        if (otp == null || otp.isBlank()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(MFA_REQUIRED_KEY, true));
        }

        if (!mfaService.isCodeValid(usuario.getMfaSecret(), otp)) {
            return ResponseEntity.status(401).body(Map.of(ERROR_KEY, INVALID_MFA_CODE));
        }

        return null;
    }
}
