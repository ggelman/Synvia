import { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import api from "../services/api";

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
  h1 {
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 28px;
    font-weight: 600;
    margin: 0;
  }
  
  .subtitle {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    margin-top: 4px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled(Card)`
  text-align: center;
  
  .metric-icon {
    font-size: 40px;
    margin-bottom: 16px;
    color: ${(props) => props.theme.colors.primary};
  }
  
  .metric-value {
    font-size: 32px;
    font-weight: 700;
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 8px;
  }
  
  .metric-label {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .metric-change {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    
    &.positive {
      background-color: ${(props) => props.theme.colors.success}15;
      color: ${(props) => props.theme.colors.success};
    }
    
    &.negative {
      background-color: ${(props) => props.theme.colors.danger}15;
      color: ${(props) => props.theme.colors.danger};
    }
    
    &.neutral {
      background-color: ${(props) => props.theme.colors.secondary}15;
      color: ${(props) => props.theme.colors.secondary};
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled(Card)`
  .chart-wrapper {
    height: 350px;
    width: 100%;
  }
`;

const AlertsContainer = styled(Card)`
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    
    &.alto {
      background-color: ${(props) => props.theme.colors.danger}08;
      border-left: 4px solid ${(props) => props.theme.colors.danger};
    }
    
    &.medio {
      background-color: ${(props) => props.theme.colors.warning}08;
      border-left: 4px solid ${(props) => props.theme.colors.warning};
    }
    
    &.baixo {
      background-color: ${(props) => props.theme.colors.info}08;
      border-left: 4px solid ${(props) => props.theme.colors.info};
    }
    
    .alert-icon {
      font-size: 20px;
      margin-top: 2px;
    }
    
    .alert-content {
      flex: 1;
      
      .alert-title {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
        margin-bottom: 4px;
      }
      
      .alert-message {
        color: ${(props) => props.theme.colors.secondary};
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .alert-action {
        color: ${(props) => props.theme.colors.primary};
        font-size: 12px;
        font-style: italic;
      }
    }
  }
`;

const LogsContainer = styled(Card)`
  .log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: ${(props) => props.theme.colors.secondary};
      font-size: 12px;
      min-width: 80px;
    }
    
    .log-user {
      color: ${(props) => props.theme.colors.textPrimary};
      font-weight: 500;
      min-width: 120px;
    }
    
    .log-action {
      color: ${(props) => props.theme.colors.primary};
      font-size: 14px;
      flex: 1;
    }
    
    .log-criticidade {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      
      &.alto {
        background-color: ${(props) => props.theme.colors.danger};
        color: white;
      }
      
      &.medio {
        background-color: ${(props) => props.theme.colors.warning};
        color: white;
      }
      
      &.baixo {
        background-color: ${(props) => props.theme.colors.info};
        color: white;
      }
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  
  select {
    padding: 8px 12px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 6px;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 14px;
  }
  
  .filter-label {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    font-weight: 500;
  }
`;

const CORES_GRAFICO = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87d068'
];

const DashboardAuditoria = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7d');
  const [metricas, setMetricas] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [distribuicaoTipos, setDistribuicaoTipos] = useState([]);
  const [logsRecentes, setLogsRecentes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [
        metricasRes,
        graficoRes,
        distribuicaoRes,
        logsRes,
        alertasRes
      ] = await Promise.all([
        api.get(`/dashboard/auditoria/metricas-gerais?periodo=${periodo}`),
        api.get(`/dashboard/auditoria/grafico-solicitacoes?periodo=${periodo}`),
        api.get('/dashboard/auditoria/distribuicao-tipos'),
        api.get('/dashboard/auditoria/logs-recentes?limite=20'),
        api.get('/dashboard/auditoria/alertas-conformidade')
      ]);

      if (metricasRes.data.success) {
        setMetricas(metricasRes.data.data);
      }
      
      if (graficoRes.data.success) {
        setDadosGrafico(graficoRes.data.data);
      }
      
      if (distribuicaoRes.data.success) {
        setDistribuicaoTipos(distribuicaoRes.data.data);
      }
      
      if (logsRes.data.success) {
        setLogsRecentes(logsRes.data.data);
      }
      
      if (alertasRes.data.success) {
        setAlertas(alertasRes.data.data);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const formatarDataHora = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obterClasseCriticidade = (criticidade) => {
    return criticidade?.toLowerCase() || 'baixo';
  };

  const obterIconeAlerta = (severidade) => {
    switch (severidade) {
      case 'ALTO': return '🚨';
      case 'MEDIO': return '⚠️';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Carregando Dashboard de Auditoria...</h3>
          <p style={{ color: '#666' }}>Coletando métricas de conformidade LGPD</p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageHeader>
        <div>
          <h1>Dashboard de Auditoria LGPD</h1>
          <div className="subtitle">
            Monitoramento de conformidade e métricas de privacidade • 
            Última atualização: {formatarDataHora(lastUpdate.toISOString())}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={carregarDados} variant="outline">
            🔄 Atualizar
          </Button>
        </div>
      </PageHeader>

      {/* Métricas Principais */}
      {metricas && (
        <MetricsGrid>
          <MetricCard>
            <div className="metric-icon">📋</div>
            <div className="metric-value">{metricas.solicitacoes.total}</div>
            <div className="metric-label">Total de Solicitações LGPD</div>
            <div className={`metric-change ${metricas.solicitacoes.taxa_crescimento > 0 ? 'positive' : 'neutral'}`}>
              {metricas.solicitacoes.periodo} no período ({metricas.solicitacoes.taxa_crescimento.toFixed(1)}%)
            </div>
          </MetricCard>

          <MetricCard>
            <div className="metric-icon">✅</div>
            <div className="metric-value">{metricas.consentimentos.ativos}</div>
            <div className="metric-label">Consentimentos Ativos</div>
            <div className={`metric-change ${metricas.consentimentos.taxa_ativacao > 50 ? 'positive' : 'negative'}`}>
              {metricas.consentimentos.taxa_ativacao.toFixed(1)}% de ativação
            </div>
          </MetricCard>

          <MetricCard>
            <div className="metric-icon">🔍</div>
            <div className="metric-value">{metricas.auditoria.total}</div>
            <div className="metric-label">Logs de Auditoria</div>
            <div className={`metric-change ${metricas.auditoria.atividade_recente ? 'positive' : 'neutral'}`}>
              {metricas.auditoria.periodo} no período
            </div>
          </MetricCard>

          <MetricCard>
            <div className="metric-icon">👥</div>
            <div className="metric-value">{metricas.clientes.total}</div>
            <div className="metric-label">Total de Clientes</div>
            <div className="metric-change neutral">
              {metricas.clientes.anonimizados} anonimizados ({metricas.clientes.taxa_anonimizacao.toFixed(1)}%)
            </div>
          </MetricCard>
        </MetricsGrid>
      )}

      {/* Filtros */}
      <FilterContainer>
        <span className="filter-label">Período:</span>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option value="1d">Último dia</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </FilterContainer>

      {/* Gráficos */}
      <ChartsGrid>
        <ChartContainer>
          <CardHeader>
            <h3>📈 Solicitações por Período</h3>
            <p>Evolução das solicitações LGPD ao longo do tempo</p>
          </CardHeader>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Data: ${value}`}
                  formatter={(value) => [value, 'Solicitações']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer>
          <CardHeader>
            <h3>🥧 Distribuição por Tipos</h3>
            <p>Tipos de solicitações mais frequentes</p>
          </CardHeader>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoTipos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percentual }) => `${tipo} (${percentual.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distribuicaoTipos.map((entry) => (
                    <Cell key={`cell-${entry.tipo}`} fill={CORES_GRAFICO[distribuicaoTipos.indexOf(entry) % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Solicitações']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </ChartsGrid>

      {/* Alertas e Logs */}
      <ChartsGrid>
        <LogsContainer>
          <CardHeader>
            <h3>📋 Logs Recentes de Auditoria</h3>
            <p>Últimas atividades registradas no sistema</p>
          </CardHeader>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {logsRecentes.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-time">{formatarDataHora(log.dataHora)}</div>
                <div className="log-user">{log.usuario}</div>
                <div className="log-action">{log.acao}</div>
                <div className={`log-criticidade ${obterClasseCriticidade(log.criticidade)}`}>
                  {log.criticidade}
                </div>
              </div>
            ))}
          </div>
        </LogsContainer>

        <AlertsContainer>
          <CardHeader>
            <h3>🚨 Alertas de Conformidade</h3>
            <p>Monitoramento de compliance LGPD</p>
          </CardHeader>
          {alertas.length > 0 ? (
            alertas.map((alerta) => (
              <div key={`${alerta.tipo}-${alerta.severidade}`} className={`alert-item ${alerta.severidade.toLowerCase()}`}>
                <div className="alert-icon">{obterIconeAlerta(alerta.severidade)}</div>
                <div className="alert-content">
                  <div className="alert-title">{alerta.tipo.replace(/_/g, ' ')}</div>
                  <div className="alert-message">{alerta.message}</div>
                  <div className="alert-action">{alerta.acao_recomendada}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h4>Sistema em Conformidade</h4>
              <p>Nenhum alerta crítico identificado no momento</p>
            </div>
          )}
        </AlertsContainer>
      </ChartsGrid>
    </DashboardContainer>
  );
};

export default DashboardAuditoria;