package com.synvia.core.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consentimentos_lgpd")
public class ConsentimentoLGPD {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoFinalidade finalidade;
    
    @Column(name = "consentimento_dado", nullable = false)
    private Boolean consentimentoDado;
    
    @Column(name = "data_consentimento", nullable = false)
    private LocalDateTime dataConsentimento;
    
    @Column(name = "ip_origem", length = 45)
    private String ipOrigem;
    
    @Column(name = "detalhes_consentimento", length = 500)
    private String detalhesConsentimento;
    
    @Column(nullable = false)
    private Boolean revogado = false;
    
    @Column(name = "data_revogacao")
    private LocalDateTime dataRevogacao;
    
    @Column(name = "motivo_revogacao", length = 500)
    private String motivoRevogacao;

    // Construtores
    public ConsentimentoLGPD() {}

    public ConsentimentoLGPD(Long usuarioId, TipoFinalidade finalidade, Boolean consentimentoDado) {
        this.usuarioId = usuarioId;
        this.finalidade = finalidade;
        this.consentimentoDado = consentimentoDado;
        this.dataConsentimento = LocalDateTime.now();
        this.revogado = false;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public TipoFinalidade getFinalidade() { return finalidade; }
    public void setFinalidade(TipoFinalidade finalidade) { this.finalidade = finalidade; }

    public Boolean getConsentimentoDado() { return consentimentoDado; }
    public void setConsentimentoDado(Boolean consentimentoDado) { this.consentimentoDado = consentimentoDado; }

    public LocalDateTime getDataConsentimento() { return dataConsentimento; }
    public void setDataConsentimento(LocalDateTime dataConsentimento) { this.dataConsentimento = dataConsentimento; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }

    public String getDetalhesConsentimento() { return detalhesConsentimento; }
    public void setDetalhesConsentimento(String detalhesConsentimento) { this.detalhesConsentimento = detalhesConsentimento; }

    public Boolean getRevogado() { return revogado; }
    public void setRevogado(Boolean revogado) { this.revogado = revogado; }

    public LocalDateTime getDataRevogacao() { return dataRevogacao; }
    public void setDataRevogacao(LocalDateTime dataRevogacao) { this.dataRevogacao = dataRevogacao; }

    public String getMotivoRevogacao() { return motivoRevogacao; }
    public void setMotivoRevogacao(String motivoRevogacao) { this.motivoRevogacao = motivoRevogacao; }
    
    public enum TipoFinalidade {
        SERVICO_ESSENCIAL,
        MARKETING_EMAIL,
        MARKETING_SMS,
        ANALISES_PERSONALIZADAS,
        COMPARTILHAMENTO_TERCEIROS,
        COOKIES_ANALYTICS,
        IA_PREDICOES
    }
}