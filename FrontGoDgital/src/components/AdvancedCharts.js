import { useState, useEffect } from "react"
import styled from "styled-components"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardHeader } from "./Card"
import { Button } from "./Button"
import PropTypes from "prop-types"
import api from "../services/api";

const ChartsContainer = styled.div`
  display: grid;
  gap: 24px;
`

const ChartCard = styled(Card)`
  .chart-container {
    height: 400px;
    margin-top: 16px;
  }
  
  .chart-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    
    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
      
      label {
        font-size: 14px;
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
      }
      
      select {
        padding: 6px 12px;
        border: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 4px;
        font-size: 14px;
      }
    }
  }
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const MetricCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  .metric-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .metric-label {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
    margin-bottom: 4px;
  }
  
  .metric-change {
    font-size: 12px;
    font-weight: 600;
    
    &.positive {
      color: ${(props) => props.theme.colors.success};
    }
    
    &.negative {
      color: ${(props) => props.theme.colors.danger};
    }
  }
  
  &.revenue .metric-value {
    color: ${(props) => props.theme.colors.success};
  }
  
  &.orders .metric-value {
    color: ${(props) => props.theme.colors.primary};
  }
  
  &.customers .metric-value {
    color: #17a2b8;
  }
  
  &.products .metric-value {
    color: #ffc107;
  }
`

const COLORS = ["#4A7C59", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d"]
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey || entry.name} style={{ margin: "4px 0", color: entry.color }}>
            {entry.name}:{" "}
            {(() => {
              if (typeof entry.value === "number") {
                if (entry.dataKey.includes("valor") || entry.dataKey.includes("receita")) {
                  return `R$ ${entry.value.toFixed(2)}`;
                } else {
                  return entry.value.toLocaleString();
                }
              } else {
                return entry.value;
              }
            })()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export const AdvancedCharts = () => {
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30days")
  const [chartType, setChartType] = useState("line")

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadChartData = async () => {
    try {
      // const data = await mockHandlers.getChartData(period) // Linha original mockada
      const vendasPorProdutoResponse = await api.get('/relatorios/vendas-por-produto');
      const financeiroResponse = await api.get(`/relatorios/financeiro?inicio=2023-01-01&fim=2023-12-31`); // Exemplo de datas
      const resumoDiarioResponse = await api.get(`/relatorios/resumo-diario?inicio=2023-01-01&fim=2023-12-31`); // Exemplo de datas

      setChartData({
        ...chartData,
        produtosMaisVendidos: vendasPorProdutoResponse.data,
        metricas: {
          receita: financeiroResponse.data.receita,
          pedidos: resumoDiarioResponse.data.quantidadeVendas,
        },
        // Outros dados de gráficos (vendas, categorias, formasPagamento, vendasPorHora) ainda precisam ser implementados no backend
        // Por enquanto, vamos manter os dados mockados para esses, ou removê-los se não forem mais necessários.
        vendas: [], // Dados reais viriam de outro endpoint
        categorias: [], // Dados reais viriam de outro endpoint
        formasPagamento: [], // Dados reais viriam de outro endpoint
        vendasPorHora: [], // Dados reais viriam de outro endpoint
      });

    } catch (error) {
      console.error("Erro ao carregar dados dos gráficos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando gráficos...</div>
  }

  const renderSalesChart = () => {
    const Component = chartType === "area" ? AreaChart : LineChart
    const DataComponent = chartType === "area" ? Area : Line

    return (
      <ResponsiveContainer width="100%" height="100%">
        <Component data={chartData.vendas}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey="valor"
            stroke="#4A7C59"
            fill="#4A7C59"
            strokeWidth={2}
            name="Vendas (R$)"
          />
          <DataComponent
            type="monotone"
            dataKey="quantidade"
            stroke="#28a745"
            fill="#28a745"
            strokeWidth={2}
            name="Quantidade"
          />
        </Component>
      </ResponsiveContainer>
    )
  }

  return (
    <ChartsContainer>
      <CardHeader>
        <h2>Analytics Avançado</h2>
      </CardHeader>

      <MetricsGrid>
        <MetricCard className="revenue">
          <div className="metric-value">R$ {chartData.metricas?.receita?.toFixed(2) || "0.00"}</div>
          <div className="metric-label">Receita Total</div>
          <div className={`metric-change ${chartData.metricas?.receitaChange >= 0 ? "positive" : "negative"}`}>
            {chartData.metricas?.receitaChange >= 0 ? "↗" : "↘"} {Math.abs(chartData.metricas?.receitaChange || 0)}%
          </div>
        </MetricCard>

        <MetricCard className="orders">
          <div className="metric-value">{chartData.metricas?.pedidos || 0}</div>
          <div className="metric-label">Total de Pedidos</div>
          <div className={`metric-change ${chartData.metricas?.pedidosChange >= 0 ? "positive" : "negative"}`}>
            {chartData.metricas?.pedidosChange >= 0 ? "↗" : "↘"} {Math.abs(chartData.metricas?.pedidosChange || 0)}%
          </div>
        </MetricCard>

        <MetricCard className="customers">
          <div className="metric-value">{chartData.metricas?.clientes || 0}</div>
          <div className="metric-label">Clientes Ativos</div>
          <div className={`metric-change ${chartData.metricas?.clientesChange >= 0 ? "positive" : "negative"}`}>
            {chartData.metricas?.clientesChange >= 0 ? "↗" : "↘"} {Math.abs(chartData.metricas?.clientesChange || 0)}%
          </div>
        </MetricCard>

        <MetricCard className="products">
          <div className="metric-value">{chartData.metricas?.produtos || 0}</div>
          <div className="metric-label">Produtos Vendidos</div>
          <div className={`metric-change ${chartData.metricas?.produtosChange >= 0 ? "positive" : "negative"}`}>
            {chartData.metricas?.produtosChange >= 0 ? "↗" : "↘"} {Math.abs(chartData.metricas?.produtosChange || 0)}%
          </div>
        </MetricCard>
      </MetricsGrid>

      <ChartCard>
        <div className="chart-controls">
          <div className="control-group">
            <label htmlFor="period-select">Período:</label>
            <select
              id="period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="chart-type-select">Tipo:</label>
            <select
              id="chart-type-select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Linha</option>
              <option value="area">Área</option>
            </select>
          </div>

          <Button variant="secondary" onClick={loadChartData}>
            Atualizar
          </Button>
        </div>

        <CardHeader>
          <h3>Evolução de Vendas</h3>
        </CardHeader>
        <div className="chart-container">{renderSalesChart()}</div>
      </ChartCard>

      <ChartsGrid>
        <ChartCard>
          <CardHeader>
            <h3>Produtos Mais Vendidos</h3>
          </CardHeader>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.produtosMaisVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" fill="#4A7C59" name="Quantidade Vendida" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <CardHeader>
            <h3>Distribuição por Categoria</h3>
          </CardHeader>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.categorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {chartData.categorias?.map((entry, index) => (
                    <Cell key={entry.name || entry.id || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <CardHeader>
            <h3>Formas de Pagamento</h3>
          </CardHeader>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.formasPagamento} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metodo" type="category" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" fill="#28a745" name="Transações" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <CardHeader>
            <h3>Vendas por Hora</h3>
          </CardHeader>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.vendasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#17a2b8"
                  fill="#17a2b8"
                  fillOpacity={0.6}
                  name="Vendas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ChartsGrid>
    </ChartsContainer>
  )
}
