package com.synvia.core.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/ai/security")
@CrossOrigin(origins = "*")
public class SecurityController {
    
    // Constants for duplicate string literals
    private static final String STATUS_KEY = "status";
    private static final String HEALTHY_STATUS = "healthy";
    private static final String CRITICAL_STATUS = "critical";
    private static final String LIMIT_KEY = "limit";
    private static final String CURRENT_KEY = "current";
    private static final String LOGIN_KEY = "login";
    private static final String API_KEY = "api";
    private static final String COUNT_KEY = "count";
    private static final String MESSAGE_KEY = "message";
    private static final String TIMESTAMP_KEY = "timestamp";
    private static final String DETAILS_KEY = "details";
    private static final String VALUE_KEY = "value";
    private static final String ERROR_STATUS = "error";
    
    // Random instance for secure random number generation
    private static final Random RANDOM = new Random();
    

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealthStatus() {
        Map<String, String> healthStatus = new HashMap<>();
        
        // Simular verificação de saúde do sistema
        try {
            // Aqui você pode adicionar verificações reais do sistema
            // Por exemplo: conectividade com banco, status de serviços, etc.
            healthStatus.put(STATUS_KEY, HEALTHY_STATUS);
            return ResponseEntity.ok(healthStatus);
        } catch (Exception e) {
            healthStatus.put(STATUS_KEY, CRITICAL_STATUS);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(healthStatus);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSecurityStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Rate limits
        Map<String, Map<String, Integer>> rateLimits = new HashMap<>();
        Map<String, Integer> loginLimits = new HashMap<>();
        loginLimits.put(LIMIT_KEY, 5);
        loginLimits.put(CURRENT_KEY, 2);
        rateLimits.put(LOGIN_KEY, loginLimits);
        
        Map<String, Integer> apiLimits = new HashMap<>();
        apiLimits.put(LIMIT_KEY, 100);
        apiLimits.put(CURRENT_KEY, 45);
        rateLimits.put(API_KEY, apiLimits);
        
        stats.put("rate_limits", rateLimits);
        
        // IPs bloqueados (simulado)
        List<String> blockedIPs = new ArrayList<>();
        blockedIPs.add("203.0.113.15");
        blockedIPs.add("198.51.100.42");
        stats.put("blocked_ips", blockedIPs);
        
        // Total de requisições (simulado)
        stats.put("total_requests", 15847);
        stats.put("rate_limit_hits", 23);
        
        // Top IPs por volume
        List<Map<String, Object>> topIPs = new ArrayList<>();
        Map<String, Object> ip1 = new HashMap<>();
        ip1.put("ip", "192.168.1.100");
        ip1.put(COUNT_KEY, 1204);
        topIPs.add(ip1);
        
        Map<String, Object> ip2 = new HashMap<>();
        ip2.put("ip", "10.0.0.45");
        ip2.put(COUNT_KEY, 892);
        topIPs.add(ip2);
        
        stats.put("top_ips_by_volume", topIPs);
        
        // Alertas
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        Map<String, Object> alert1 = new HashMap<>();
        alert1.put("type", "warning");
        alert1.put(MESSAGE_KEY, "Alto volume de tráfego detectado");
        alert1.put(TIMESTAMP_KEY, LocalDateTime.now().minusMinutes(15).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        alert1.put(DETAILS_KEY, "Aumento de 40% no tráfego nas últimas 2 horas");
        alert1.put("read", false);
        alerts.add(alert1);
        
        Map<String, Object> alert2 = new HashMap<>();
        alert2.put("type", "info");
        alert2.put(MESSAGE_KEY, "Sistema de monitoramento ativo");
        alert2.put(TIMESTAMP_KEY, LocalDateTime.now().minusHours(1).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        alert2.put(DETAILS_KEY, "Todos os sistemas funcionando normalmente");
        alert2.put("read", true);
        alerts.add(alert2);
        
        Map<String, Object> alert3 = new HashMap<>();
        alert3.put("type", CRITICAL_STATUS);
        alert3.put(MESSAGE_KEY, "Tentativa de acesso suspeito bloqueada");
        alert3.put(TIMESTAMP_KEY, LocalDateTime.now().minusMinutes(45).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        alert3.put(DETAILS_KEY, "IP 203.0.113.15 bloqueado por múltiplas tentativas de login");
        alert3.put("read", false);
        alerts.add(alert3);
        
        stats.put("alerts", alerts);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSecurityMetrics(@RequestParam(defaultValue = "24h") String range) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Dados de tráfego simulados
        List<Map<String, Object>> traffic = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 23; i >= 0; i--) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("ts", now.minusHours(i).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            dataPoint.put(COUNT_KEY, 450 + RANDOM.nextInt(200));
            traffic.add(dataPoint);
        }
        metrics.put("traffic", traffic);
        
        // Rate limiter data
        List<Map<String, Object>> rateLimiterData = new ArrayList<>();
        Map<String, Object> apiData = new HashMap<>();
        apiData.put("bucket", "api");
        apiData.put("used", 45);
        apiData.put(LIMIT_KEY, 100);
        rateLimiterData.add(apiData);
        
        Map<String, Object> loginData = new HashMap<>();
        loginData.put("bucket", LOGIN_KEY);
        loginData.put("used", 2);
        loginData.put(LIMIT_KEY, 5);
        rateLimiterData.add(loginData);
        
        metrics.put("rateLimiter", rateLimiterData);
        
        // Threats data
        List<Map<String, Object>> threats = new ArrayList<>();
        Map<String, Object> botThreat = new HashMap<>();
        botThreat.put("name", "Bot");
        botThreat.put(VALUE_KEY, 12);
        threats.add(botThreat);
        
        Map<String, Object> bruteforceThreat = new HashMap<>();
        bruteforceThreat.put("name", "Força Bruta");
        bruteforceThreat.put(VALUE_KEY, 7);
        threats.add(bruteforceThreat);
        
        Map<String, Object> ddosThreat = new HashMap<>();
        ddosThreat.put("name", "DDoS");
        ddosThreat.put(VALUE_KEY, 3);
        threats.add(ddosThreat);
        
        metrics.put("threats", threats);
        
        // Top IPs
        List<Map<String, Object>> topIps = new ArrayList<>();
        Map<String, Object> topIp1 = new HashMap<>();
        topIp1.put("ip", "192.168.1.100");
        topIp1.put(COUNT_KEY, 1204);
        topIps.add(topIp1);
        
        Map<String, Object> topIp2 = new HashMap<>();
        topIp2.put("ip", "10.0.0.45");
        topIp2.put(COUNT_KEY, 892);
        topIps.add(topIp2);
        
        metrics.put("topIps", topIps);
        
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSecuritySettings() {
        Map<String, Object> settings = new HashMap<>();
        
        // Rate limiting settings
        Map<String, Object> rateLimiting = new HashMap<>();
        rateLimiting.put("enabled", true);
        rateLimiting.put("loginLimit", 5);
        rateLimiting.put("apiLimit", 100);
        rateLimiting.put("aiLimit", 10);
        rateLimiting.put("heavyOpsLimit", 20);
        settings.put("rateLimiting", rateLimiting);
        
        // Monitoring settings
        Map<String, Object> monitoring = new HashMap<>();
        monitoring.put("enableAlerts", true);
        monitoring.put("alertThreshold", 100);
        monitoring.put("autoBlock", true);
        monitoring.put("blockDuration", 3600);
        settings.put("monitoring", monitoring);
        
        // Notification settings
        Map<String, Object> notifications = new HashMap<>();
        notifications.put("email", true);
        notifications.put("browser", true);
        notifications.put("criticalOnly", false);
        settings.put("notifications", notifications);
        
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSecuritySettings(@RequestBody Map<String, Object> newSettings) {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Aqui você salvaria as configurações no banco de dados ou arquivo de configuração
            
            response.put(STATUS_KEY, "success");
            response.put(MESSAGE_KEY, "Configurações de segurança atualizadas com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(STATUS_KEY, ERROR_STATUS);
            response.put(MESSAGE_KEY, "Erro ao salvar configurações: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/export-logs")
    public ResponseEntity<Map<String, Object>> exportSecurityLogs(@RequestBody Map<String, Object> exportRequest) {
        Map<String, Object> logs = new HashMap<>();
        
        try {
            String timeRange = (String) exportRequest.getOrDefault("timeRange", "24h");
            Boolean includeMetrics = (Boolean) exportRequest.getOrDefault("includeMetrics", true);
            
            // Simular dados de logs
            List<Map<String, Object>> logEntries = new ArrayList<>();
            
            for (int i = 0; i < 50; i++) {
                Map<String, Object> logEntry = new HashMap<>();
                logEntry.put(TIMESTAMP_KEY, LocalDateTime.now().minusHours(i).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                logEntry.put("level", getLogLevel(i));
                logEntry.put("source", "SecurityMonitor");
                logEntry.put(MESSAGE_KEY, "Event " + i + " - Security check completed");
                logEntry.put("ip", "192.168.1." + (100 + (i % 50)));
                logEntries.add(logEntry);
            }
            
            logs.put("timeRange", timeRange);
            logs.put("exportedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            logs.put("totalEntries", logEntries.size());
            logs.put("logs", logEntries);
            
            if (Boolean.TRUE.equals(includeMetrics)) {
                Map<String, Object> summary = new HashMap<>();
                summary.put("totalRequests", 15847);
                summary.put("blockedRequests", 234);
                summary.put("blockedIPs", 12);
                summary.put("alertsGenerated", 45);
                logs.put("summary", summary);
            }
            
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put(STATUS_KEY, ERROR_STATUS);
            errorResponse.put(MESSAGE_KEY, "Erro ao exportar logs: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/check-threats")
    public ResponseEntity<Map<String, Object>> checkThreats() {
        Map<String, Object> threatCheck = new HashMap<>();
        
        try {
            // Simular verificação de ameaças
            List<Map<String, Object>> detectedThreats = new ArrayList<>();
            
            if (RANDOM.nextDouble() > 0.7) { // 30% chance de detectar ameaça
                Map<String, Object> threat = new HashMap<>();
                threat.put("type", "suspicious_activity");
                threat.put("severity", "medium");
                threat.put("source", "192.168.1.150");
                threat.put("description", "Múltiplas tentativas de acesso detectadas");
                threat.put(TIMESTAMP_KEY, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                detectedThreats.add(threat);
            }
            
            threatCheck.put(STATUS_KEY, "completed");
            threatCheck.put("threatsDetected", detectedThreats.size());
            threatCheck.put("threats", detectedThreats);
            threatCheck.put("lastCheck", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(threatCheck);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put(STATUS_KEY, ERROR_STATUS);
            errorResponse.put(MESSAGE_KEY, "Erro ao verificar ameaças: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Determines the log level based on the index.
     * @param i the index
     * @return the log level string
     */
    private String getLogLevel(int i) {
        if (i % 10 == 0) {
            return "ERROR";
        } else if (i % 5 == 0) {
            return "WARN";
        } else {
            return "INFO";
        }
    }
}