import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle, Shield, Info, CheckCircle } from 'lucide-react';

const SecurityAlertsContext = createContext();

export const useSecurityAlerts = () => {
  const context = useContext(SecurityAlertsContext);
  if (!context) {
    throw new Error('useSecurityAlerts deve ser usado dentro de SecurityAlertsProvider');
  }
  return context;
};

export const SecurityAlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Adicionar novo alerta
  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...alert
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Manter últimos 50

    // Se for crítico, mostrar toast
    if (alert.type === 'critical' || alert.type === 'warning') {
      addToast(newAlert);
    }
  }, []);

  // Adicionar toast notification
  const addToast = useCallback((alert) => {
    const toast = {
      ...alert,
      toastId: Date.now() + Math.random()
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remover toast após 10 segundos
    setTimeout(() => {
      removeToast(toast.toastId);
    }, 10000);
  }, []);

  // Remover toast
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  // Limpar todos os alertas
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Marcar alerta como lido
  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const value = useMemo(() => ({
    alerts,
    toasts,
    addAlert,
    removeToast,
    clearAlerts,
    markAsRead
  }), [alerts, toasts, addAlert, removeToast, clearAlerts, markAsRead]);

  return (
    <SecurityAlertsContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </SecurityAlertsContext.Provider>
  );
};

// Container de toasts
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.toastId} toast={toast} onClose={() => removeToast(toast.toastId)} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    toastId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    timestamp: PropTypes.instanceOf(Date)
  })).isRequired,
  removeToast: PropTypes.func.isRequired
};

// Componente de toast individual
const Toast = ({ toast, onClose }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-600',
          border: 'border-red-700',
          icon: AlertTriangle,
          iconColor: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          border: 'border-yellow-700',
          icon: AlertTriangle,
          iconColor: 'text-white'
        };
      case 'success':
        return {
          bg: 'bg-green-600',
          border: 'border-green-700',
          icon: CheckCircle,
          iconColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-700',
          icon: Info,
          iconColor: 'text-white'
        };
    }
  };

  const styles = getToastStyles(toast.type);
  const Icon = styles.icon;

  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4 text-white animate-slide-in`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${styles.iconColor}`} />
        <div className="flex-1">
          <div className="font-semibold text-sm">{toast.title}</div>
          <div className="text-sm opacity-90 mt-1">{toast.message}</div>
          <div className="text-xs opacity-75 mt-2">
            {toast.timestamp.toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    timestamp: PropTypes.instanceOf(Date)
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

// Hook para monitoramento automático de segurança
export const useSecurityMonitoring = () => {
  const { addAlert } = useSecurityAlerts();

  const checkSecurityThreats = async () => {
    try {
      const response = await fetch('/api/ai/security/check-threats');
      const data = await response.json();

      if (data.threats && data.threats.length > 0) {
        data.threats.forEach(threat => {
          addAlert({
            type: threat.severity,
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

    } catch (error) {
      console.error('Erro ao verificar ameaças:', error);
    }
  };

  const startMonitoring = () => {
    // Verificação inicial
    checkSecurityThreats();

    // Verificação a cada 1 minuto
    const interval = setInterval(checkSecurityThreats, 60000);

    return () => clearInterval(interval);
  };

  return { startMonitoring, checkSecurityThreats };
};

// Componente para exibir alertas na sidebar ou modal
export const SecurityAlertsPanel = ({ className = "" }) => {
  const { alerts, markAsRead, clearAlerts } = useSecurityAlerts();
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter !== 'all') return alert.type === filter;
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Alertas de Segurança</h3>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={clearAlerts}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpar Todos
          </button>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 mt-3">
          {['all', 'critical', 'warning', 'info', 'unread'].map(filterType => {
            const getFilterLabel = (type) => {
              switch (type) {
                case 'all': return 'Todos';
                case 'unread': return 'Não Lidos';
                default: return type.charAt(0).toUpperCase() + type.slice(1);
              }
            };

            return (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-xs rounded ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getFilterLabel(filterType)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y">
            {filteredAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                onMarkAsRead={() => markAsRead(alert.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum alerta encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Item de alerta na lista
const AlertListItem = ({ alert, onMarkAsRead }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onMarkAsRead();
    }
  };

  const Icon = getAlertIcon(alert.type);

  return (
    <button
      className={`w-full text-left p-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
        !alert.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={onMarkAsRead}
      onKeyDown={handleKeyDown}
      aria-label={`Marcar alerta "${alert.title}" como lido`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${!alert.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
            {alert.title}
          </div>
          <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
          <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
            <span>{alert.timestamp.toLocaleString()}</span>
            {alert.source && <span>• {alert.source}</span>}
          </div>
        </div>
      </div>
    </button>
  );
};

AlertListItem.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    read: PropTypes.bool,
    source: PropTypes.string
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired
};

// PropTypes para validação
SecurityAlertsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

SecurityAlertsPanel.propTypes = {
  className: PropTypes.string
};

export default SecurityAlertsProvider;