import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import api from "../services/api";


const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`

const QuickActionCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 {
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 12px;
    font-size: 18px;
  }
  
  p {
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    margin-bottom: 20px;
  }
`

const SummaryCard = styled(Card)`
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 600;
      color: ${(props) => props.theme.colors.textPrimary};
    }
    
    .value {
      font-size: 18px;
      font-weight: 700;
      color: ${(props) => props.theme.colors.primary};
    }
  }
`

const AlertsContainer = styled(Card)`
  margin-bottom: 30px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;

  .alert-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #fff0c7;
    
    &:last-child {
      border-bottom: none;
    }
    
    .alert-icon {
      font-size: 24px;
      margin-right: 15px;
    }
    
    .alert-text {
      flex: 1;
      color: #856404;
      font-size: 14px;

      strong {
        color: #5b4602;
      }
    }
  }
`;


// Helper component for individual summary items
const SummaryItem = ({ label, value }) => (
  <div className="summary-item">
    <span className="label">{label}</span>
    <span className="value">{value}</span>
  </div>
);

// Component to display today's summary or a loading state
const TodaySummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <SummaryCard>
        <CardHeader><h2>Carregando resumo...</h2></CardHeader>
      </SummaryCard>
    );
  }

  const {
    totalFaturamento = 0,
    quantidadeVendas = 0,
    produtosMaisVendidos = [],
  } = summary || {};

  const topProduct = produtosMaisVendidos[0]?.nome ?? "Nenhum produto vendido";

  return (
    <SummaryCard>
      <CardHeader><h2>Resumo de Hoje</h2></CardHeader>
      <SummaryItem label="Total de Vendas" value={`R$ ${totalFaturamento.toFixed(2)}`} />
      <SummaryItem label="Quantidade de Vendas" value={quantidadeVendas} />
      <SummaryItem label="Produto Mais Vendido" value={topProduct} />
    </SummaryCard>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [alertasEstoqueBaixo, setAlertasEstoqueBaixo] = useState([]);
  const [alertasEstoqueZerado, setAlertasEstoqueZerado] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Verificar se o usuário está autenticado
      if (!isAuthenticated) {
        console.log("Usuário não autenticado. Redirecionando para login...");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const hoje = new Date().toISOString().split('T')[0];
        const params = { inicio: hoje, fim: hoje };

        const [
          summaryRes,
          estoqueBaixoRes,
          estoqueZeradoRes,
          aniversariantesRes
        ] = await Promise.all([
          api.get('/relatorios/resumo-diario', { params }),  
          api.get('/relatorios/estoque/baixo'),
          api.get('/relatorios/estoque/zerado'),
          api.get('/relatorios/aniversariantes')  
        ]);

        setSummary(summaryRes.data);
        setAlertasEstoqueBaixo(estoqueBaixoRes.data);
        setAlertasEstoqueZerado(estoqueZeradoRes.data);
        setAniversariantes(aniversariantesRes.data);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        
        // Se erro 401/403, redirecionar para login
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Token inválido ou expirado. Redirecionando para login...");
          navigate("/login");
          return;
        }
        
        setSummary({
          totalFaturamento: 0,
          quantidadeVendas: 0,
          produtosMaisVendidos: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const quickActions = [
    {
      title: "Registrar Nova Venda",
      description: "Processar vendas no PDV",
      icon: "🛒",
      path: "/vendas/nova",
      color: "#4A7C59",
    },
    {
      title: "Cadastrar Produto",
      description: "Adicionar novos produtos",
      icon: "📦",
      path: "/produtos/novo",
      color: "#28a745",
    },
    {
      title: "Ver Relatórios",
      description: "Acompanhar vendas e performance",
      icon: "📊",
      path: "/relatorios",
      color: "#17a2b8",
    },
  ];

  const hasAlerts = alertasEstoqueBaixo.length > 0 || alertasEstoqueZerado.length > 0 || aniversariantes.length > 0;

  return (
    <div>
      <CardHeader>
        <h2>Dashboard</h2>
      </CardHeader>

      {!loading && hasAlerts && (
        <AlertsContainer>
          <CardHeader><h3>Alertas e Notificações</h3></CardHeader>
          {alertasEstoqueBaixo.map(produto => (
            <div key={`estoque-${produto.idProduto}`} className="alert-item">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">
                Estoque baixo para <strong>{produto.nome}</strong>. Atual: {produto.qtdAtual}
              </span>
              <Button size="sm" onClick={() => navigate('/estoque')}>Ver Estoque</Button>
            </div>
          ))}
          {alertasEstoqueZerado.map(produto => (
            <div key={`zerado-${produto.idProduto}`} className="alert-item">
              <span className="alert-icon" style={{ color: '#dc3545' }}>🚫</span>
              <span className="alert-text" style={{ color: '#721c24', fontWeight: 'bold' }}>
                {produto.nome} está com estoque zerado!
              </span>
              <Button size="sm" onClick={() => navigate('/estoque')}>Ver Estoque</Button>
            </div>
          ))}
          {aniversariantes.map(cliente => (
            <div key={`aniv-${cliente.idCliente}`} className="alert-item">
              <span className="alert-icon">🎉</span>
              <span className="alert-text">
                Hoje é aniversário de <strong>{cliente.nome}</strong>!
              </span>
              <Button size="sm" onClick={() => navigate('/clientes')}>Ver Clientes</Button>
            </div>
          ))}
        </AlertsContainer>
      )}


      <DashboardGrid>
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} onClick={() => navigate(action.path)}>
            <div className="icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <Button variant="primary">Acessar</Button>
          </QuickActionCard>
        ))}
      </DashboardGrid>

      <TodaySummary summary={summary} loading={loading} />
    </div>
  );
};
