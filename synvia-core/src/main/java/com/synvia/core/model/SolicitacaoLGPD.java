package com.synvia.core.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacoes_lgpd")
public class SolicitacaoLGPD {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String protocolo;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_solicitacao", nullable = false)
    private TipoSolicitacao tipoSolicitacao;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDENTE;
    
    @Column(name = "data_solicitacao", nullable = false)
    private LocalDateTime dataSolicitacao;
    
    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;
    
    @Column(columnDefinition = "TEXT")
    private String motivo;
    
    @Column(columnDefinition = "TEXT")
    private String resposta;
    
    @Column(name = "responsavel_analise", length = 100)
    private String responsavelAnalise;
    
    @Column(name = "ip_origem", length = 45)
    private String ipOrigem;

    // Construtores
    public SolicitacaoLGPD() {}

    public SolicitacaoLGPD(String protocolo, Long usuarioId, TipoSolicitacao tipoSolicitacao, String motivo) {
        this.protocolo = protocolo;
        this.usuarioId = usuarioId;
        this.tipoSolicitacao = tipoSolicitacao;
        this.motivo = motivo;
        this.dataSolicitacao = LocalDateTime.now();
        this.status = Status.PENDENTE;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProtocolo() { return protocolo; }
    public void setProtocolo(String protocolo) { this.protocolo = protocolo; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public TipoSolicitacao getTipoSolicitacao() { return tipoSolicitacao; }
    public void setTipoSolicitacao(TipoSolicitacao tipoSolicitacao) { this.tipoSolicitacao = tipoSolicitacao; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getDataSolicitacao() { return dataSolicitacao; }
    public void setDataSolicitacao(LocalDateTime dataSolicitacao) { this.dataSolicitacao = dataSolicitacao; }

    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getResposta() { return resposta; }
    public void setResposta(String resposta) { this.resposta = resposta; }

    public String getResponsavelAnalise() { return responsavelAnalise; }
    public void setResponsavelAnalise(String responsavelAnalise) { this.responsavelAnalise = responsavelAnalise; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }
    
    public enum TipoSolicitacao {
        ACESSO,
        CORRECAO,
        EXCLUSAO,
        PORTABILIDADE,
        OPOSICAO
    }
    
    public enum Status {
        PENDENTE,
        EM_ANALISE,
        APROVADA,
        REJEITADA,
        CONCLUIDA
    }
}