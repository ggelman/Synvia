import { useState, useEffect } from "react"
import styled from "styled-components"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader } from "../components/Card"
import api from "../services/api";

const RelatoriosContainer = styled.div`
  display: grid;
  gap: 24px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`

const StatCard = styled(Card)`
  text-align: center;
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: ${(props) => props.theme.colors.textPrimary};
    font-weight: 600;
  }
`

const ChartContainer = styled.div`
  height: 300px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.secondary};
  font-style: italic;
`

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
`

export const Relatorios = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [relatorio, setRelatorio] = useState({
    totalFaturamento: 0,
    quantidadeVendas: 0,
    produtosMaisVendidos: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const loadRelatorio = async () => {
      // Verificar se o usuário está autenticado
      if (!isAuthenticated) {
        console.log("Usuário não autenticado. Redirecionando para login...");
        navigate("/login");
        return;
      }

      try {
        const today = new Date();
        const inicioDoMes = new Date(today.getFullYear(), today.getMonth(), 1);
        const fimDoMes = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const response = await api.get(`/relatorios/resumo-diario`, {
          params: {
            inicio: formatDate(inicioDoMes),
            fim: formatDate(fimDoMes)
          }
        });

        setRelatorio(response.data);

      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
        
        // Se erro 401/403, redirecionar para login
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Token inválido ou expirado. Redirecionando para login...");
          navigate("/login");
          return;
        }
        
        setError("Não foi possível carregar os dados. Verifique a conexão com a API.");
        setRelatorio({ totalFaturamento: 0, quantidadeVendas: 0, produtosMaisVendidos: [] });
      } finally {
        setLoading(false);
      }
    };

    loadRelatorio();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div>Carregando relatórios...</div>;
  }

  if (!relatorio) {
    return <div>Erro ao carregar relatórios. Verifique a conexão com a API.</div>;
  }

  const ticketMedio = relatorio.quantidadeVendas > 0
    ? (relatorio.totalFaturamento / relatorio.quantidadeVendas).toFixed(2)
    : "0.00";

  if (error) {
    return <div>{error}</div>;
  }
  
  return (
    <RelatoriosContainer>
      <CardHeader>
        <h2>Relatórios do Mês</h2>
      </CardHeader>

      <StatsGrid>
        <StatCard>
          <div className="stat-value">R$ {(relatorio.totalFaturamento || 0).toFixed(2)}</div>
          <div className="stat-label">Total de Vendas</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{relatorio.quantidadeVendas || 0}</div>
          <div className="stat-label">Quantidade de Vendas</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">R$ {ticketMedio}</div>
          <div className="stat-label">Ticket Médio</div>
        </StatCard>
      </StatsGrid>

      <Card>
        <CardHeader>
          <h3>Produtos Mais Vendidos</h3>
        </CardHeader>
        <ProductTable>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade Vendida</th>
              <th>Posição</th>
            </tr>
          </thead>
          <tbody>
            {relatorio.produtosMaisVendidos && relatorio.produtosMaisVendidos.length > 0 ? (
              relatorio.produtosMaisVendidos.map((produto, index) => (
                <tr key={produto.nome}>
                  <td>{produto.nome}</td>
                  <td>{produto.quantidade}</td>
                  <td>#{index + 1}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  Não há dados de vendas de produtos para o período.
                </td>
              </tr>
            )}
          </tbody>
        </ProductTable>
      </Card>
    </RelatoriosContainer>
  )
}