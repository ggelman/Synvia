import { useEffect, useCallback } from 'react';
import { useSecurityAlerts } from '../components/security/SecurityAlertsProvider';

// Hook principal para monitoramento de segurança
export const useSecurityMonitoring = () => {
  const { addAlert } = useSecurityAlerts();

  // Verificar ameaças de segurança
  const checkSecurityThreats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/security/check-threats');
      const data = await response.json();

      if (data.threats && data.threats.length > 0) {
        data.threats.forEach(threat => {
          addAlert({
            type: threat.severity || 'warning',
            title: `Ameaça Detectada: ${threat.type}`,
            message: threat.description,
            source: 'SecurityMonitor'
          });
        });
      }

      if (data.blocked_ips && data.blocked_ips.length > 0) {
        addAlert({
          type: 'critical',
          title: 'IPs Bloqueados',
          message: `${data.blocked_ips.length} novos IPs foram bloqueados por atividade suspeita`,
          source: 'RateLimiting'
        });
      }

      if (data.rate_limit_exceeded && data.rate_limit_exceeded > 0) {
        addAlert({
          type: 'warning',
          title: 'Rate Limit Excedido',
          message: `${data.rate_limit_exceeded} tentativas de excesso de rate limit detectadas`,
          source: 'RateLimiting'
        });
      }

    } catch (error) {
      console.error('Erro ao verificar ameaças:', error);
    }
  }, [addAlert]);

  // Iniciar monitoramento automático
  const startMonitoring = useCallback(() => {
    // Verificação inicial
    checkSecurityThreats();

    // Verificação a cada 1 minuto
    const interval = setInterval(checkSecurityThreats, 60000);

    return () => clearInterval(interval);
  }, [checkSecurityThreats]);

  return { startMonitoring, checkSecurityThreats };
};

// Hook para notificações do navegador
export const useBrowserNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return Notification.permission === 'granted';
  }, []);

  const showNotification = useCallback(async (title, options = {}) => {
    const hasPermission = await requestPermission();
    
    if (hasPermission) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'security-alert',
        renotify: true,
        requireInteraction: true,
        ...options
      });

      // Auto-fechar após 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }

    return null;
  }, [requestPermission]);

  const showSecurityAlert = useCallback((alert) => {
    const alertTypeIcons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };

    showNotification(`${alertTypeIcons[alert.type] || '🔒'} ${alert.title}`, {
      body: alert.message,
      tag: `security-${alert.type}`,
      data: alert
    });
  }, [showNotification]);

  return { requestPermission, showNotification, showSecurityAlert };
};

// Hook para integração com sistema de logs
export const useSecurityLogging = () => {
  const logSecurityEvent = useCallback(async (event) => {
    try {
      await fetch('/api/ai/security/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          source: 'frontend'
        })
      });
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  }, []);

  const logUserAction = useCallback((action, details = {}) => {
    logSecurityEvent({
      type: 'user_action',
      action,
      details,
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  }, [logSecurityEvent]);

  const logSecurityIncident = useCallback((incident) => {
    logSecurityEvent({
      type: 'security_incident',
      severity: incident.severity || 'warning',
      description: incident.description,
      additional_data: incident.data || {}
    });
  }, [logSecurityEvent]);

  return { logSecurityEvent, logUserAction, logSecurityIncident };
};

// Hook para métricas em tempo real
export const useSecurityMetrics = () => {
  const fetchRealTimeMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/security/real-time-metrics');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar métricas em tempo real:', error);
      return null;
    }
  }, []);

  const subscribeToMetrics = useCallback((callback, interval = 30000) => {
    const fetchAndCallback = async () => {
      const metrics = await fetchRealTimeMetrics();
      if (metrics) {
        callback(metrics);
      }
    };

    // Buscar dados iniciais
    fetchAndCallback();

    // Configurar interval
    const intervalId = setInterval(fetchAndCallback, interval);

    return () => clearInterval(intervalId);
  }, [fetchRealTimeMetrics]);

  return { fetchRealTimeMetrics, subscribeToMetrics };
};

// Hook combinado para monitoramento completo
export const useComprehensiveSecurityMonitoring = () => {
  const { addAlert } = useSecurityAlerts();
  const { startMonitoring } = useSecurityMonitoring();
  const { showSecurityAlert } = useBrowserNotifications();
  const { logSecurityIncident } = useSecurityLogging();
  const { subscribeToMetrics } = useSecurityMetrics();

  useEffect(() => {
    // Iniciar monitoramento automático
    const stopMonitoring = startMonitoring();

    // Inscrever-se em métricas em tempo real
    const stopMetricsSubscription = subscribeToMetrics((metrics) => {
      // Verificar métricas críticas
      if (metrics.blocked_ips_count > 0) {
        const alert = {
          type: 'critical',
          title: 'Novos IPs Bloqueados',
          message: `${metrics.blocked_ips_count} IPs foram bloqueados recentemente`,
          source: 'RealTimeMetrics'
        };
        
        addAlert(alert);
        showSecurityAlert(alert);
        logSecurityIncident({
          severity: 'critical',
          description: `${metrics.blocked_ips_count} IPs bloqueados detectados`,
          data: { blocked_ips_count: metrics.blocked_ips_count }
        });
      }

      if (metrics.rate_limit_violations > 10) {
        const alert = {
          type: 'warning',
          title: 'Alto Número de Violações de Rate Limit',
          message: `${metrics.rate_limit_violations} violações detectadas`,
          source: 'RealTimeMetrics'
        };
        
        addAlert(alert);
        logSecurityIncident({
          severity: 'warning',
          description: 'Alto número de violações de rate limit',
          data: { violations: metrics.rate_limit_violations }
        });
      }
    });

    return () => {
      stopMonitoring();
      stopMetricsSubscription();
    };
  }, [addAlert, startMonitoring, showSecurityAlert, logSecurityIncident, subscribeToMetrics]);

  return {
    // Funções de monitoramento
    startMonitoring,
    
    // Funções de notificação
    showSecurityAlert,
    
    // Funções de logging
    logSecurityIncident,
    
    // Funções de métricas
    subscribeToMetrics
  };
};

export default useSecurityMonitoring;