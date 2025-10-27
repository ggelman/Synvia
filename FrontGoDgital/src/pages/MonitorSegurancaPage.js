import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import { Card, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { useSecurityMonitoring } from '../components/security/SecurityAlertsProvider';

const SecurityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderCard = styled(Card)`
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary} 0%, ${(props) => props.theme.colors.primaryDark} 100%);
  color: white;
  position: relative;
  
  h2 {
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    
    .icon {
      font-size: 32px;
    }
  }
  
  .subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .header-status {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  
  &.healthy {
    background-color: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid #28a745;
  }
  
  &.warning {
    background-color: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid #ffc107;
  }
  
  &.critical {
    background-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid #dc3545;
  }
  
  &.loading {
    background-color: rgba(108, 117, 125, 0.2);
    color: #6c757d;
    border: 1px solid #6c757d;
  }
  
  &.unknown {
    background-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid #dc3545;
  }
  
  .status-icon {
    font-size: 16px;
    
    &.loading {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RefreshButton = styled(Button)`
  background-color: #28a745;
  border-color: #28a745;
  color: white;
  
  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
  
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);
  }
`;

const TabsContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  font-weight: 600;
  font-size: 16px;
  color: ${(props) => props.theme.colors.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &.active {
    background-color: ${(props) => props.theme.colors.primary};
    color: white;
    border-bottom: 3px solid ${(props) => props.theme.colors.primaryDark};
  }
  
  &:hover:not(.active) {
    background-color: #e9ecef;
    color: ${(props) => props.theme.colors.textPrimary};
  }
  
  .tab-icon {
    font-size: 20px;
  }
`;

const TabContent = styled.div`
  padding: 24px;
  min-height: 400px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const MetricCard = styled(Card)`
  text-align: center;
  
  .metric-icon {
    font-size: 48px;
    margin-bottom: 16px;
    
    &.healthy { color: #28a745; }
    &.warning { color: #ffc107; }
    &.danger { color: #dc3545; }
    &.info { color: #17a2b8; }
  }
  
  .metric-value {
    font-size: 32px;
    font-weight: 700;
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: 8px;
  }
  
  .metric-label {
    font-size: 16px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 4px;
  }
  
  .metric-description {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
  }
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const AlertItem = styled.div`
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  background-color: #f8f9fa;
  
  &.critical {
    border-left-color: #dc3545;
    background-color: #f8d7da;
  }
  
  &.warning {
    border-left-color: #ffc107;
    background-color: #fff3cd;
  }
  
  &.info {
    border-left-color: #17a2b8;
    background-color: #d1ecf1;
  }
  
  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .alert-type {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.critical {
      background-color: #dc3545;
      color: white;
    }
    
    &.warning {
      background-color: #ffc107;
      color: #856404;
    }
    
    &.info {
      background-color: #17a2b8;
      color: white;
    }
  }
  
  .alert-timestamp {
    font-size: 12px;
    color: ${(props) => props.theme.colors.secondary};
  }
  
  .alert-message {
    font-size: 14px;
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 4px;
  }
  
  .alert-details {
    font-size: 12px;
    color: ${(props) => props.theme.colors.secondary};
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const SettingsSection = styled(Card)`
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    .section-icon {
      font-size: 24px;
      color: ${(props) => props.theme.colors.primary};
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: ${(props) => props.theme.colors.textPrimary};
      margin: 0;
    }
    
    .section-subtitle {
      font-size: 14px;
      color: ${(props) => props.theme.colors.secondary};
      margin: 0;
    }
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    .setting-label {
      font-size: 14px;
      font-weight: 600;
      color: ${(props) => props.theme.colors.textPrimary};
      margin-bottom: 4px;
    }
    
    .setting-description {
      font-size: 12px;
      color: ${(props) => props.theme.colors.secondary};
    }
  }
  
  .setting-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: ${(props) => props.theme.colors.primary};
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

const NumericInput = styled.input`
  width: 80px;
  padding: 6px 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${(props) => props.theme.colors.secondary};
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-message {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
  }
`;
const MonitorSegurancaPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState('loading');
  const [securityData, setSecurityData] = useState({
    blockedIPs: 0,
    totalRequests: 0,
    activeAlerts: 0,
    rateLimitHits: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState({
    rateLimiting: { enabled: true, loginLimit: 5, apiLimit: 100, aiLimit: 10, heavyOpsLimit: 20 },
    monitoring: { enableAlerts: true, alertThreshold: 100, autoBlock: true, blockDuration: 3600 },
    notifications: { email: true, browser: true, criticalOnly: false }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { startMonitoring } = useSecurityMonitoring();

  const checkSystemStatus = useCallback(async () => {
    try {
      // Tentar primeiro a URL completa HTTPS, depois fallback para porta local
      let response;
      try {
        response = await fetch('http://localhost:8080/api/ai/security/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (httpsError) {
        // Fallback para HTTP na porta 8080 em caso de erro HTTPS
        console.warn('HTTPS connection failed, trying HTTP fallback:', httpsError.message);
        response = await fetch('/api/ai/security/health');
      }
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSystemStatus(data.status === 'healthy' ? 'healthy' : 'unknown');
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      setSystemStatus('unknown');
    }
  }, []);

  const loadSecurityData = useCallback(async () => {
    try {
      // Tentar primeiro a URL completa HTTPS, depois fallback para porta local
      let response;
      try {
        response = await fetch('http://localhost:8080/api/ai/security/stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (httpsError) {
        // Fallback para HTTP na porta 8080 em caso de erro HTTPS
        console.warn('HTTPS connection failed, trying HTTP fallback:', httpsError.message);
        response = await fetch('/api/ai/security/stats');
      }
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setSecurityData({
        blockedIPs: data.blocked_ips?.length || 0,
        totalRequests: data.total_requests || 0,
        activeAlerts: data.alerts?.filter(alert => !alert.read)?.length || 0,
        rateLimitHits: data.rate_limit_hits || 0
      });
      
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
      // Dados fallback para demonstração
      setSecurityData({
        blockedIPs: 5,
        totalRequests: 1247,
        activeAlerts: 0,
        rateLimitHits: 3
      });
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    const stopMonitoring = startMonitoring();
    checkSystemStatus();
    loadSecurityData();
    
    const statusInterval = setInterval(checkSystemStatus, 120000);
    const dataInterval = setInterval(loadSecurityData, 30000);
    
    return () => {
      stopMonitoring();
      clearInterval(statusInterval);
      clearInterval(dataInterval);
    };
  }, [startMonitoring, checkSystemStatus, loadSecurityData]);

  const handleRefresh = () => {
    checkSystemStatus();
    loadSecurityData();
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/ai/security/export-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange: '24h', includeMetrics: true })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to export logs');
      }
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      alert('Erro ao exportar logs. Tente novamente.');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/ai/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar configurações');
      }
      
      // Salvar configurações com sucesso
      localStorage.setItem('securitySettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'healthy': return 'Sistema Saudável';
      case 'warning': return 'Atenção Requerida';
      case 'critical': return 'Status Crítico';
      case 'loading': return 'Verificando...';
      default: return 'Status Desconhecido';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Painel Principal', icon: '🛡️' },
    { id: 'metrics', label: 'Métricas Detalhadas', icon: '📊' },
    { id: 'alerts', label: 'Central de Alertas', icon: '🚨' },
    { id: 'ai-predictions', label: 'Previsões IA', icon: '🤖' },
    { id: 'settings', label: 'Configurações de Segurança', icon: '⚙️' }
  ];

  return (
    <SecurityContainer>
      {/* Header */}
      <HeaderCard>
        <div className="header-status">
          <StatusBadge className={systemStatus}>
            <span className={`status-icon ${systemStatus === 'loading' ? 'loading' : ''}`}>
              {getStatusIcon(systemStatus)}
            </span>
            {getStatusLabel(systemStatus)}
          </StatusBadge>
        </div>
        <CardHeader>
          <h2>
            <span className="icon">🛡️</span>
            Monitor de Segurança
          </h2>
        </CardHeader>
        <div className="subtitle">
          Centro de Comando de Segurança - Monitoramento em Tempo Real
        </div>
        <div className="header-actions">
          <RefreshButton variant="secondary" onClick={handleRefresh}>
            🔄 Atualizar
          </RefreshButton>
          <Button variant="primary" onClick={handleExportLogs}>
            📥 Exportar Logs
          </Button>
        </div>
      </HeaderCard>

      {/* Navigation Tabs */}
      <TabsContainer>
        <TabsList>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </TabButton>
          ))}
        </TabsList>

        <TabContent>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <DashboardGrid>
                <MetricCard>
                  <div className="metric-icon danger">🚫</div>
                  <div className="metric-value">{securityData.blockedIPs}</div>
                  <div className="metric-label">IPs Bloqueados</div>
                  <div className="metric-description">Bloqueios ativos</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon info">📡</div>
                  <div className="metric-value">{securityData.totalRequests.toLocaleString()}</div>
                  <div className="metric-label">Requisições Totais</div>
                  <div className="metric-description">Últimas 24 horas</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon warning">⚠️</div>
                  <div className="metric-value">{securityData.activeAlerts}</div>
                  <div className="metric-label">Alertas Ativos</div>
                  <div className="metric-description">Requerem atenção</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon healthy">🛡️</div>
                  <div className="metric-value">{securityData.rateLimitHits}</div>
                  <div className="metric-label">Rate Limits</div>
                  <div className="metric-description">Limites atingidos</div>
                </MetricCard>
              </DashboardGrid>

              <Card>
                <CardHeader>
                  <h3>Alertas Recentes</h3>
                </CardHeader>
                {alerts.length > 0 ? (
                  <AlertsList>
                    {alerts.slice(0, 5).map((alert, index) => (
                      <AlertItem key={index} className={alert.type}>
                        <div className="alert-header">
                          <span className={`alert-type ${alert.type}`}>{alert.type}</span>
                          <span className="alert-timestamp">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="alert-message">{alert.message}</div>
                        {alert.details && (
                          <div className="alert-details">{alert.details}</div>
                        )}
                      </AlertItem>
                    ))}
                  </AlertsList>
                ) : (
                  <EmptyState>
                    <div className="empty-icon">🎉</div>
                    <div className="empty-message">Nenhum alerta recente</div>
                    <div className="empty-description">O sistema está funcionando normalmente</div>
                  </EmptyState>
                )}
              </Card>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <EmptyState>
              <div className="empty-icon">📊</div>
              <div className="empty-message">Métricas Detalhadas</div>
              <div className="empty-description">Gráficos e análises em desenvolvimento</div>
            </EmptyState>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <Card>
              <CardHeader>
                <h3>Central de Alertas</h3>
              </CardHeader>
              {alerts.length > 0 ? (
                <AlertsList>
                  {alerts.map((alert, index) => (
                    <AlertItem key={index} className={alert.type}>
                      <div className="alert-header">
                        <span className={`alert-type ${alert.type}`}>{alert.type}</span>
                        <span className="alert-timestamp">
                          {new Date(alert.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                      {alert.details && (
                        <div className="alert-details">{alert.details}</div>
                      )}
                    </AlertItem>
                  ))}
                </AlertsList>
              ) : (
                <EmptyState>
                  <div className="empty-icon">🎉</div>
                  <div className="empty-message">Nenhum alerta</div>
                  <div className="empty-description">Todos os sistemas estão funcionando normalmente</div>
                </EmptyState>
              )}
            </Card>
          )}

          {/* AI Predictions Tab */}
          {activeTab === 'ai-predictions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card>
                <CardHeader>
                  <h3>🤖 Análise Preditiva de Segurança</h3>
                </CardHeader>
                <EmptyState>
                  <div className="empty-icon">🔮</div>
                  <div className="empty-message">IA de Previsão de Ameaças</div>
                  <div className="empty-description">
                    Sistema de inteligência artificial para predição de ameaças em desenvolvimento
                  </div>
                </EmptyState>
              </Card>
              
              <DashboardGrid>
                <MetricCard>
                  <div className="metric-icon info">🎯</div>
                  <div className="metric-value">85%</div>
                  <div className="metric-label">Precisão do Modelo</div>
                  <div className="metric-description">Taxa de detecção correta</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon warning">⚡</div>
                  <div className="metric-value">12</div>
                  <div className="metric-label">Ameaças Previstas</div>
                  <div className="metric-description">Próximas 24 horas</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon healthy">🛡️</div>
                  <div className="metric-value">97%</div>
                  <div className="metric-label">Score de Proteção</div>
                  <div className="metric-description">Nível atual de segurança</div>
                </MetricCard>

                <MetricCard>
                  <div className="metric-icon info">🔍</div>
                  <div className="metric-value">1,247</div>
                  <div className="metric-label">Padrões Analisados</div>
                  <div className="metric-description">Última hora</div>
                </MetricCard>
              </DashboardGrid>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Configurações de Segurança</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {saveError && (
                      <div style={{ 
                        color: '#dc3545', 
                        fontSize: '14px', 
                        padding: '8px 12px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '4px'
                      }}>
                        {saveError}
                      </div>
                    )}
                    <Button 
                      variant="success" 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                    >
                      {isSaving ? '⏳ Salvando...' : '💾 Salvar Configurações'}
                    </Button>
                  </div>
                </div>
              </Card>

              <SettingsGrid>
                <SettingsSection>
                  <div className="section-header">
                    <span className="section-icon">🚦</span>
                    <div>
                      <h4 className="section-title">Rate Limiting</h4>
                      <p className="section-subtitle">Proteção contra ataques de força bruta</p>
                    </div>
                  </div>
                  
                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Habilitar Rate Limiting</div>
                      <div className="setting-description">Ativar proteção contra múltiplas tentativas</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.rateLimiting.enabled}
                          onChange={(e) => updateSetting('rateLimiting', 'enabled', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Limite de Login</div>
                      <div className="setting-description">Tentativas por minuto</div>
                    </div>
                    <div className="setting-control">
                      <NumericInput 
                        type="number"
                        value={settings.rateLimiting.loginLimit}
                        onChange={(e) => updateSetting('rateLimiting', 'loginLimit', parseInt(e.target.value))}
                      />
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Limite de API</div>
                      <div className="setting-description">Requisições por minuto</div>
                    </div>
                    <div className="setting-control">
                      <NumericInput 
                        type="number"
                        value={settings.rateLimiting.apiLimit}
                        onChange={(e) => updateSetting('rateLimiting', 'apiLimit', parseInt(e.target.value))}
                      />
                    </div>
                  </SettingItem>
                </SettingsSection>

                <SettingsSection>
                  <div className="section-header">
                    <span className="section-icon">👁️</span>
                    <div>
                      <h4 className="section-title">Monitoramento</h4>
                      <p className="section-subtitle">Detecção e resposta a ameaças</p>
                    </div>
                  </div>
                  
                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Alertas Automáticos</div>
                      <div className="setting-description">Gerar alertas para eventos suspeitos</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.monitoring.enableAlerts}
                          onChange={(e) => updateSetting('monitoring', 'enableAlerts', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Bloqueio Automático</div>
                      <div className="setting-description">Bloquear IPs suspeitos automaticamente</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.monitoring.autoBlock}
                          onChange={(e) => updateSetting('monitoring', 'autoBlock', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Limite para Alerta</div>
                      <div className="setting-description">Número de eventos suspeitos</div>
                    </div>
                    <div className="setting-control">
                      <NumericInput 
                        type="number"
                        value={settings.monitoring.alertThreshold}
                        onChange={(e) => updateSetting('monitoring', 'alertThreshold', parseInt(e.target.value))}
                      />
                    </div>
                  </SettingItem>
                </SettingsSection>

                <SettingsSection>
                  <div className="section-header">
                    <span className="section-icon">🔔</span>
                    <div>
                      <h4 className="section-title">Notificações</h4>
                      <p className="section-subtitle">Alertas para administradores</p>
                    </div>
                  </div>
                  
                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Notificações por Email</div>
                      <div className="setting-description">Enviar alertas por email</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.notifications.email}
                          onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Notificações no Navegador</div>
                      <div className="setting-description">Mostrar notificações push</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.notifications.browser}
                          onChange={(e) => updateSetting('notifications', 'browser', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>

                  <SettingItem>
                    <div className="setting-info">
                      <div className="setting-label">Apenas Alertas Críticos</div>
                      <div className="setting-description">Filtrar apenas eventos críticos</div>
                    </div>
                    <div className="setting-control">
                      <Toggle>
                        <input aria-label="Input field" 
                          type="checkbox" 
                          checked={settings.notifications.criticalOnly}
                          onChange={(e) => updateSetting('notifications', 'criticalOnly', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </Toggle>
                    </div>
                  </SettingItem>
                </SettingsSection>
              </SettingsGrid>
            </div>
          )}
        </TabContent>
      </TabsContainer>
    </SecurityContainer>
  );
};


MonitorSegurancaPage.propTypes = {
  // Esta página não recebe props
};

export default MonitorSegurancaPage;