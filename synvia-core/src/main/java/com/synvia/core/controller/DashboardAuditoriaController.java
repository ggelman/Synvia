package com.synvia.core.controller;

import com.synvia.core.repository.*;
import com.synvia.core.model.*;
import com.synvia.core.model.SolicitacaoLGPD.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard/auditoria")
@CrossOrigin(origins = "*")
public class DashboardAuditoriaController {
    
    private static final Logger logger = LoggerFactory.getLogger(DashboardAuditoriaController.class);
    
    // Constantes para evitar duplicação de strings
    private static final String SUCCESS_KEY = "success";
    private static final String MESSAGE_KEY = "message";
    private static final String DATA_KEY = "data";
    private static final String TOTAL_KEY = "total";
    private static final String COUNT_KEY = "count";
    private static final String TIMESTAMP_KEY = "timestamp";
    private static final String PERIODO_KEY = "periodo";
    private static final String PERIODO_DEFAULT = "7d";
    
    private final LogAuditoriaRepository logAuditoriaRepository;
    private final SolicitacaoLGPDRepository solicitacaoLGPDRepository;
    private final ConsentimentoLGPDRepository consentimentoLGPDRepository;
    private final ClienteRepository clienteRepository;

    public DashboardAuditoriaController(LogAuditoriaRepository logAuditoriaRepository,
                                       SolicitacaoLGPDRepository solicitacaoLGPDRepository,
                                       ConsentimentoLGPDRepository consentimentoLGPDRepository,
                                       ClienteRepository clienteRepository) {
        this.logAuditoriaRepository = logAuditoriaRepository;
        this.solicitacaoLGPDRepository = solicitacaoLGPDRepository;
        this.consentimentoLGPDRepository = consentimentoLGPDRepository;
        this.clienteRepository = clienteRepository;
    }

    /**
     * Endpoint principal para métricas gerais do dashboard
     */
    @GetMapping("/metricas-gerais")
    public ResponseEntity<Map<String, Object>> getMetricasGerais(
            @RequestParam(defaultValue = PERIODO_DEFAULT) String periodo) {
        try {
            LocalDateTime dataInicio = calcularDataInicio(periodo);
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> metricas = new HashMap<>();
            
            // Métricas de Solicitações LGPD
            long totalSolicitacoes = solicitacaoLGPDRepository.count();
            long solicitacoesPeriodo = contarSolicitacoesPorPeriodo(dataInicio);
            
            // Métricas de Consentimentos
            long totalConsentimentos = consentimentoLGPDRepository.count();
            long consentimentosAtivos = contarConsentimentosAtivos();
            
            // Métricas de Auditoria
            long totalLogsAuditoria = logAuditoriaRepository.count();
            long logsPeriodo = contarLogsPorPeriodo(dataInicio);
            
            // Métricas de Clientes
            long totalClientes = clienteRepository.count();
            long clientesAnonimizados = contarClientesAnonimizados();
            
            metricas.put("solicitacoes", Map.of(
                TOTAL_KEY, totalSolicitacoes,
                PERIODO_KEY, solicitacoesPeriodo,
                "taxa_crescimento", calcularTaxaCrescimento(solicitacoesPeriodo, totalSolicitacoes)
            ));
            
            metricas.put("consentimentos", Map.of(
                TOTAL_KEY, totalConsentimentos,
                "ativos", consentimentosAtivos,
                "taxa_ativacao", calcularTaxaAtivacao(consentimentosAtivos, totalConsentimentos)
            ));
            
            metricas.put("auditoria", Map.of(
                TOTAL_KEY, totalLogsAuditoria,
                PERIODO_KEY, logsPeriodo,
                "atividade_recente", logsPeriodo > 0
            ));
            
            metricas.put("clientes", Map.of(
                TOTAL_KEY, totalClientes,
                "anonimizados", clientesAnonimizados,
                "taxa_anonimizacao", calcularTaxaAnonimizacao(clientesAnonimizados, totalClientes)
            ));
            
            response.put(SUCCESS_KEY, true);
            response.put(DATA_KEY, metricas);
            response.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter métricas gerais: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao carregar métricas: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para gráfico de solicitações por período
     */
    @GetMapping("/grafico-solicitacoes")
    public ResponseEntity<Map<String, Object>> getGraficoSolicitacoes(
            @RequestParam(defaultValue = PERIODO_DEFAULT) String periodo) {
        try {
            LocalDateTime dataInicio = calcularDataInicio(periodo);
            List<Map<String, Object>> dados = new ArrayList<>();
            
            // Buscar todas as solicitações do período
            List<SolicitacaoLGPD> solicitacoes = solicitacaoLGPDRepository
                .findByDataSolicitacaoGreaterThanEqual(dataInicio);
            
            // Agrupar por data
            Map<String, Long> solicitacoesPorData = solicitacoes.stream()
                .collect(Collectors.groupingBy(
                    s -> s.getDataSolicitacao().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                    Collectors.counting()
                ));
            
            // Converter para formato do gráfico
            for (Map.Entry<String, Long> entry : solicitacoesPorData.entrySet()) {
                Map<String, Object> item = new HashMap<>();
                item.put("data", entry.getKey());
                item.put(COUNT_KEY, entry.getValue());
                item.put("tipo", "solicitacoes");
                dados.add(item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put(SUCCESS_KEY, true);
            response.put(DATA_KEY, dados);
            response.put(PERIODO_KEY, periodo);
            response.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao gerar gráfico de solicitações: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao gerar gráfico: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para distribuição de tipos de solicitações
     */
    @GetMapping("/distribuicao-tipos")
    public ResponseEntity<Map<String, Object>> getDistribuicaoTipos() {
        try {
            List<SolicitacaoLGPD> todasSolicitacoes = solicitacaoLGPDRepository.findAll();
            
            Map<String, Long> distribuicao = todasSolicitacoes.stream()
                .collect(Collectors.groupingBy(
                    s -> s.getTipoSolicitacao().toString(),
                    Collectors.counting()
                ));
            
            List<Map<String, Object>> dados = new ArrayList<>();
            for (Map.Entry<String, Long> entry : distribuicao.entrySet()) {
                Map<String, Object> item = new HashMap<>();
                item.put("tipo", entry.getKey());
                item.put(COUNT_KEY, entry.getValue());
                item.put("percentual", calcularPercentual(entry.getValue(), todasSolicitacoes.size()));
                dados.add(item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put(SUCCESS_KEY, true);
            response.put(DATA_KEY, dados);
            response.put(TOTAL_KEY, todasSolicitacoes.size());
            response.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter distribuição de tipos: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao carregar distribuição: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para logs de auditoria recentes
     */
    @GetMapping("/logs-recentes")
    public ResponseEntity<Map<String, Object>> getLogsRecentes(
            @RequestParam(defaultValue = "50") int limite) {
        try {
            List<LogAuditoria> logs = logAuditoriaRepository
                .findTop50ByOrderByTimestampDesc()
                .stream()
                .limit(limite)
                .toList();
            
            List<Map<String, Object>> dadosLogs = new ArrayList<>();
            for (LogAuditoria log : logs) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", log.getId());
                item.put("usuario", log.getUsuario());
                item.put("acao", log.getAcao());
                item.put("detalhes", log.getDetalhes());
                item.put("dataHora", log.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                item.put("criticidade", determinarCriticidade(log.getAcao()));
                dadosLogs.add(item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put(SUCCESS_KEY, true);
            response.put(DATA_KEY, dadosLogs);
            response.put("limite", limite);
            response.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter logs recentes: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao carregar logs: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para alertas de conformidade
     */
    @GetMapping("/alertas-conformidade")
    public ResponseEntity<Map<String, Object>> getAlertasConformidade() {
        try {
            List<Map<String, Object>> alertas = new ArrayList<>();
            
            // Verificar solicitações pendentes há muito tempo
            LocalDateTime limiteTempo = LocalDateTime.now().minus(15, ChronoUnit.DAYS);
            long solicitacoesPendentes = solicitacaoLGPDRepository
                .countByStatusAndDataSolicitacaoLessThan(Status.PENDENTE, limiteTempo);
            
            if (solicitacoesPendentes > 0) {
                alertas.add(Map.of(
                    "tipo", "PRAZO_LGPD",
                    "severidade", "ALTO",
                    MESSAGE_KEY, String.format("%d solicitações pendentes há mais de 15 dias", solicitacoesPendentes),
                    "acao_recomendada", "Revisar e processar solicitações em atraso",
                    TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                ));
            }
            
            // Verificar taxa de consentimentos
            long totalConsentimentos = consentimentoLGPDRepository.count();
            long consentimentosAtivos = contarConsentimentosAtivos();
            double taxaConsentimento = calcularTaxaAtivacao(consentimentosAtivos, totalConsentimentos);
            
            if (taxaConsentimento < 50.0) {
                alertas.add(Map.of(
                    "tipo", "BAIXA_TAXA_CONSENTIMENTO",
                    "severidade", "MEDIO",
                    MESSAGE_KEY, String.format("Taxa de consentimento baixa: %.1f%%", taxaConsentimento),
                    "acao_recomendada", "Revisar processo de obtenção de consentimentos",
                    TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                ));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put(SUCCESS_KEY, true);
            response.put(DATA_KEY, alertas);
            response.put("total_alertas", alertas.size());
            response.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao gerar alertas de conformidade: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                SUCCESS_KEY, false,
                MESSAGE_KEY, "Erro ao gerar alertas: " + e.getMessage()
            ));
        }
    }

    // Métodos auxiliares privados
    
    private LocalDateTime calcularDataInicio(String periodo) {
        LocalDateTime agora = LocalDateTime.now();
        return switch (periodo) {
            case "1d" -> agora.minus(1, ChronoUnit.DAYS);
            case "7d" -> agora.minus(7, ChronoUnit.DAYS);
            case "30d" -> agora.minus(30, ChronoUnit.DAYS);
            case "90d" -> agora.minus(90, ChronoUnit.DAYS);
            default -> agora.minus(7, ChronoUnit.DAYS);
        };
    }
    
    private long contarSolicitacoesPorPeriodo(LocalDateTime dataInicio) {
        return solicitacaoLGPDRepository.countByDataSolicitacaoGreaterThanEqual(dataInicio);
    }
    
    private long contarConsentimentosAtivos() {
        return consentimentoLGPDRepository.countByConsentimentoDadoTrueAndRevogadoFalse();
    }
    
    private long contarLogsPorPeriodo(LocalDateTime dataInicio) {
        return logAuditoriaRepository.countByTimestampGreaterThanEqual(dataInicio);
    }
    
    private long contarClientesAnonimizados() {
        // Assumindo que clientes anonimizados têm nome "ANONIMIZADO"
        return clienteRepository.countByNomeContaining("ANONIMIZADO");
    }
    
    private double calcularTaxaCrescimento(long valorPeriodo, long valorTotal) {
        if (valorTotal == 0) return 0.0;
        return (double) valorPeriodo / valorTotal * 100.0;
    }
    
    private double calcularTaxaAtivacao(long ativos, long total) {
        if (total == 0) return 0.0;
        return (double) ativos / total * 100.0;
    }
    
    private double calcularTaxaAnonimizacao(long anonimizados, long total) {
        if (total == 0) return 0.0;
        return (double) anonimizados / total * 100.0;
    }
    
    private double calcularPercentual(long valor, long total) {
        if (total == 0) return 0.0;
        return (double) valor / total * 100.0;
    }
    
    private String determinarCriticidade(String acao) {
        if (acao.contains("EXCLUSAO") || acao.contains("ANONIMIZACAO")) {
            return "ALTO";
        } else if (acao.contains("SOLICITACAO") || acao.contains("CONSENTIMENTO")) {
            return "MEDIO";
        } else {
            return "BAIXO";
        }
    }
}