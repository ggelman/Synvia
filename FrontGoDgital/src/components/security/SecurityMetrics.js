import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Shield } from 'lucide-react';
import api from '../../services/api';

const SecurityMetrics = () => {
  const [metricsData, setMetricsData] = useState({
    requests: [],
    rateLimits: [],
    ipActivity: [],
    threatTrends: []
  });
  const [timeRange, setTimeRange] = useState('1h');
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para determinar cor baseada na porcentagem
  const getBarColor = (percentage) => {
    if (percentage > 80) return '#EF4444'; // Vermelho
    if (percentage > 60) return '#F59E0B'; // Amarelo
    return '#10B981'; // Verde
  };

  useEffect(() => {
    fetchMetricsData();
    const interval = setInterval(fetchMetricsData, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMetricsData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/ai/security/metrics?range=${timeRange}`);
      setMetricsData(response.data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      // Dados mock para demonstração
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const now = new Date();
    
    // Definir configurações de tempo usando mapeamento
    const timeConfig = {
      '1h': { hours: 1, intervals: 12 },
      '24h': { hours: 24, intervals: 24 },
      default: { hours: 168, intervals: 168 }
    };
    
    const config = timeConfig[timeRange] || timeConfig.default;
    const { hours, intervals } = config;

    // Dados de requisições por intervalo de tempo
    const requests = Array.from({ length: intervals }, (_, i) => {
      const time = new Date(now.getTime() - (intervals - i - 1) * (hours * 60 * 60 * 1000 / intervals));
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requests: Math.floor(Math.random() * 100) + 20,
        blocked: Math.floor(Math.random() * 10),
        allowed: Math.floor(Math.random() * 90) + 10
      };
    });

    // Dados de rate limiting por endpoint
    const rateLimits = [
      { endpoint: '/api/login', limit: 5, current: 3, percentage: 60 },
      { endpoint: '/api/ai/predict', limit: 10, current: 8, percentage: 80 },
      { endpoint: '/api/data', limit: 100, current: 45, percentage: 45 },
      { endpoint: '/api/heavy-ops', limit: 20, current: 12, percentage: 60 }
    ];

    // Atividade por IP (top 10)
    const ipActivity = Array.from({ length: 10 }, (_, i) => {
      const randomValue = Math.random();
      let status = 'normal';
      if (randomValue > 0.8) {
        status = 'blocked';
      } else if (randomValue > 0.6) {
        status = 'warning';
      }
      
      return {
        ip: `192.168.1.${100 + i}`,
        requests: Math.floor(Math.random() * 500) + 50,
        blocked: Math.floor(Math.random() * 20),
        status
      };
    });

    // Tendências de ameaças
    const threatTrends = [
      { type: 'Rate Limit Exceeded', count: 15, severity: 'warning' },
      { type: 'Suspicious Pattern', count: 8, severity: 'critical' },
      { type: 'Blocked IP', count: 3, severity: 'critical' },
      { type: 'High Traffic', count: 12, severity: 'info' }
    ];

    setMetricsData({ requests, rateLimits, ipActivity, threatTrends });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-spin text-blue-600" />
          <span>Carregando métricas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Métricas de Segurança</h2>
        </div>
        
        <div className="flex space-x-2">
          {['1h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 text-sm rounded ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Requisições ao Longo do Tempo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Tráfego ao Longo do Tempo</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metricsData.requests}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="requests" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Total de Requisições"
            />
            <Line 
              type="monotone" 
              dataKey="blocked" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Requisições Bloqueadas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Limiting por Endpoint */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Rate Limiting por Endpoint</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricsData.rateLimits} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="endpoint" type="category" width={120} />
              <Tooltip formatter={(value) => [`${value}%`, 'Uso do Limite']} />
              <Bar 
                dataKey="percentage" 
                fill={getBarColor}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top IPs por Atividade */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Top IPs por Atividade</h3>
          </div>
          
          <div className="space-y-3">
            {metricsData.ipActivity.slice(0, 8).map((ip, index) => (
              <div key={ip.ip} className="flex items-center justify-between p-2 rounded bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-700">{ip.ip}</span>
                  <StatusBadge status={ip.status} />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{ip.requests} reqs</div>
                  {ip.blocked > 0 && (
                    <div className="text-xs text-red-600">{ip.blocked} bloqueadas</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribuição de Tipos de Ameaças */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">Distribuição de Ameaças Detectadas</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metricsData.threatTrends}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metricsData.threatTrends.map((entry, index) => (
                  <Cell 
                    key={`${entry.severity}-${entry.value}-${index}`} 
                    fill={getThreatColor(entry.severity)}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Lista de Ameaças */}
          <div className="space-y-3">
            {metricsData.threatTrends.map((threat, index) => (
              <div key={threat.type} className="flex items-center justify-between p-3 rounded bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getThreatColor(threat.severity) }}
                  />
                  <span className="text-sm font-medium">{threat.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{threat.count}</span>
                  <SeverityBadge severity={threat.severity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Estatístico ({timeRange})</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Requisições"
            value={metricsData.requests.reduce((sum, item) => sum + item.requests, 0)}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Requisições Bloqueadas"
            value={metricsData.requests.reduce((sum, item) => sum + item.blocked, 0)}
            icon={Shield}
            color="red"
          />
          <StatCard
            title="IPs Únicos"
            value={metricsData.ipActivity.length}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Ameaças Detectadas"
            value={metricsData.threatTrends.reduce((sum, item) => sum + item.count, 0)}
            icon={Shield}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares
const StatusBadge = ({ status }) => {
  const statusConfig = {
    normal: { bg: 'bg-green-100', text: 'text-green-800', label: 'Normal' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Atenção' },
    blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bloqueado' }
  };

  const config = statusConfig[status] || statusConfig.normal;

  return (
    <span className={`px-2 py-1 text-xs rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['normal', 'warning', 'blocked']).isRequired
};

const SeverityBadge = ({ severity }) => {
  const severityConfig = {
    critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Atenção' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Info' }
  };

  const config = severityConfig[severity] || severityConfig.info;

  return (
    <span className={`px-2 py-1 text-xs rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

SeverityBadge.propTypes = {
  severity: PropTypes.oneOf(['critical', 'warning', 'info']).isRequired
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color]} mb-2`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

const getThreatColor = (severity) => {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'info': return '#3B82F6';
    default: return '#6B7280';
  }
};

SecurityMetrics.propTypes = {
  // Component doesn't receive props, uses internal state
};

export default SecurityMetrics;