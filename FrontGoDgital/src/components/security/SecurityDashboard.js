import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, Shield, Activity, Users, Clock, Ban } from 'lucide-react';
import api from '../../services/api';

// Helper functions
const getBlockedIpsColor = (blockedIps) => {
  return blockedIps > 0 ? "red" : "green";
};

const getIpStatus = (ip, blockedIpsList, count) => {
  const isBlocked = blockedIpsList?.includes(ip);
  const isHighTraffic = count > 100;
  
  if (isBlocked) {
    return {
      className: 'bg-red-100 text-red-800',
      text: 'Bloqueado'
    };
  }
  
  if (isHighTraffic) {
    return {
      className: 'bg-yellow-100 text-yellow-800',
      text: 'Monitorado'
    };
  }
  
  return {
    className: 'bg-green-100 text-green-800',
    text: 'Normal'
  };
};

const SecurityDashboard = () => {
  const [securityStats, setSecurityStats] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Buscar dados de segurança
  const fetchSecurityData = useCallback(async () => {
    try {
      // Dados do AI Module
      const [securityResponse, rateLimitResponse] = await Promise.all([
        api.get('/ai/security/stats'),
        api.get('/ai/rate-limits')
      ]);

      setSecurityStats(securityResponse.data);
      setRateLimitInfo(rateLimitResponse.data);
      setLastUpdate(new Date());
      
      // Processar alertas
      processSecurityAlerts(securityResponse.data);
      
    } catch (error) {
      console.error('Erro ao buscar dados de segurança:', error);
    } finally {
      setIsLoading(false);
    }
  }, [processSecurityAlerts]);

  // Processar alertas de segurança
  const processSecurityAlerts = useCallback((data) => {
    const newAlerts = [];
    
    if (data.security_monitoring?.blocked_ips > 0) {
      newAlerts.push({
        id: `blocked-ips-${Date.now()}`,
        type: 'critical',
        title: 'IPs Bloqueados Detectados',
        message: `${data.security_monitoring.blocked_ips} IPs foram bloqueados por atividade suspeita`,
        timestamp: new Date(),
        icon: Ban
      });
    }

    if (data.security_monitoring?.total_requests_logged > 10000) {
      newAlerts.push({
        id: `high-traffic-${Date.now()}`,
        type: 'warning',
        title: 'Alto Volume de Tráfego',
        message: `${data.security_monitoring.total_requests_logged} requisições registradas`,
        timestamp: new Date(),
        icon: Activity
      });
    }

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Manter últimos 10 alertas
  }, []);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [fetchSecurityData]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Carregando dados de segurança...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard de Segurança</h2>
              <p className="text-gray-600">Monitoramento em tempo real</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Última atualização</div>
            <div className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Rate Limiting"
            value="Ativo"
            icon={Shield}
            color="green"
            subtitle="Sistema protegido"
          />
          <MetricCard
            title="IPs Monitorados"
            value={securityStats?.security_monitoring?.total_ips_monitored || 0}
            icon={Users}
            color="blue"
            subtitle="Endereços únicos"
          />
          <MetricCard
            title="IPs Bloqueados"
            value={securityStats?.security_monitoring?.blocked_ips || 0}
            icon={Ban}
            color={getBlockedIpsColor(securityStats?.security_monitoring?.blocked_ips)}
            subtitle="Atividade suspeita"
          />
          <MetricCard
            title="Requests Total"
            value={securityStats?.security_monitoring?.total_requests_logged || 0}
            icon={Activity}
            color="purple"
            subtitle="Requisições registradas"
          />
        </div>
      </div>

      {/* Alertas em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Alertas Recentes</h3>
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>Nenhum alerta de segurança</p>
              <p className="text-sm">Sistema funcionando normalmente</p>
            </div>
          )}
        </div>

        {/* Rate Limiting Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Políticas de Rate Limiting</h3>
          </div>
          
          {rateLimitInfo && (
            <div className="space-y-3">
              {Object.entries(rateLimitInfo.rate_limits || {}).map(([endpoint, limit]) => (
                <div key={endpoint} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{endpoint}</span>
                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">{limit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top IPs por Volume */}
      {securityStats?.security_monitoring?.top_ips_by_volume && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Top IPs por Volume de Requisições</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">IP Address</th>
                  <th className="text-left py-2">Requisições</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {securityStats.security_monitoring.top_ips_by_volume.map(([ip, count], index) => (
                  <tr key={ip} className="border-b">
                    <td className="py-2 font-mono">{ip}</td>
                    <td className="py-2">{count}</td>
                    <td className="py-2">
                      {(() => {
                        const status = getIpStatus(ip, securityStats.security_monitoring.blocked_ips_list, count);
                        return (
                          <span className={`px-2 py-1 rounded text-xs ${status.className}`}>
                            {status.text}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para métricas
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-700">{title}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'red', 'purple', 'orange']).isRequired,
  subtitle: PropTypes.string.isRequired
};

// Componente para alertas individuais
const AlertItem = ({ alert }) => {
  const typeColors = {
    critical: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const iconColors = {
    critical: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`border-l-4 p-3 rounded ${typeColors[alert.type]}`}>
      <div className="flex items-start space-x-3">
        <alert.icon className={`w-5 h-5 mt-0.5 ${iconColors[alert.type]}`} />
        <div className="flex-1">
          <div className="font-medium text-gray-900">{alert.title}</div>
          <div className="text-sm text-gray-600">{alert.message}</div>
          <div className="text-xs text-gray-500 mt-1">
            {alert.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

AlertItem.propTypes = {
  alert: PropTypes.shape({
    type: PropTypes.oneOf(['critical', 'warning', 'info']).isRequired,
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired
  }).isRequired
};

export default SecurityDashboard;