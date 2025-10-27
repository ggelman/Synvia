package com.synvia.core.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs_lgpd")
public class AuditLogLGPD {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id")
    private Long usuarioId;
    
    @Column(nullable = false, length = 100)
    private String acao;
    
    @Column(columnDefinition = "TEXT")
    private String detalhes;
    
    @Column(name = "dados_antes", columnDefinition = "JSON")
    private String dadosAntes;
    
    @Column(name = "dados_depois", columnDefinition = "JSON")
    private String dadosDepois;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "ip_origem", length = 45)
    private String ipOrigem;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "sessao_id", length = 100)
    private String sessaoId;

    // Construtores
    public AuditLogLGPD() {}

    public AuditLogLGPD(Long usuarioId, String acao, String detalhes) {
        this.usuarioId = usuarioId;
        this.acao = acao;
        this.detalhes = detalhes;
        this.timestamp = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }

    public String getDetalhes() { return detalhes; }
    public void setDetalhes(String detalhes) { this.detalhes = detalhes; }

    public String getDadosAntes() { return dadosAntes; }
    public void setDadosAntes(String dadosAntes) { this.dadosAntes = dadosAntes; }

    public String getDadosDepois() { return dadosDepois; }
    public void setDadosDepois(String dadosDepois) { this.dadosDepois = dadosDepois; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getSessaoId() { return sessaoId; }
    public void setSessaoId(String sessaoId) { this.sessaoId = sessaoId; }
}