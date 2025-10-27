import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Button } from "../components/Button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const PrevisaoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PrevisaoCard = styled(Card)`
  .chart-container {
    height: 400px;
    margin-top: 20px;
  }
  
  .predictions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }
  
  .prediction-item {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    
    .product-name {
      font-weight: bold;
      color: #B8860B;
      margin-bottom: 8px;
    }
    
    .prediction-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    
    .prediction-range {
      font-size: 12px;
      color: #666;
    }
  }
`

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  
  &.healthy {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }
`

export const PrevisaoIA = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [previsoes, setPrevisoes] = useState(null)
  const [statusIA, setStatusIA] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diasAFrente, setDiasAFrente] = useState(1)

  const carregarPrevisoes = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Verifica status do serviço de IA
      const statusResponse = await api.get('/ia/status')
      setStatusIA(statusResponse.data)
      
      // Carrega previsões
      const previsoesResponse = await api.get(`/ia/previsoes?diasAFrente=${diasAFrente}`)
      setPrevisoes(previsoesResponse.data)
      
    } catch (err) {
      console.error('Erro ao carregar previsões:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login')
        return
      }
      setError('Erro ao carregar previsões de IA. Verifique se o serviço está funcionando.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    carregarPrevisoes()
  }, [diasAFrente, isAuthenticated, navigate])

  const formatarDadosBarras = () => {
    if (!previsoes || !previsoes.predictions) return []
    
    return Object.entries(previsoes.predictions).map(([produto, predicoes]) => ({
      produto: produto.length > 15 ? produto.substring(0, 15) + '...' : produto,
      demanda: predicoes[0]?.predicted_demand || 0
    }))
  }

  return (
    <PrevisaoContainer>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Previsão de Demanda com IA</h2>
          {statusIA && (
            <StatusIndicator className={statusIA.status === 'healthy' ? 'healthy' : 'error'}>
              <div className="status-dot"></div>
              {statusIA.status === 'healthy' ? 'IA Online' : 'IA Offline'}
            </StatusIndicator>
          )}
        </div>
      </CardHeader>

      <PrevisaoCard>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Configurações de Previsão</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>Dias à frente:</label>
              <select 
                value={diasAFrente} 
                onChange={(e) => setDiasAFrente(parseInt(e.target.value))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value={1}>1 dia</option>
                <option value={3}>3 dias</option>
                <option value={7}>7 dias</option>
              </select>
              <Button variant="primary" onClick={carregarPrevisoes} disabled={loading}>
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {error && (
          <div style={{ padding: '16px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', margin: '16px 0' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Carregando previsões...
          </div>
        )}

        {previsoes && !loading && (
          <>
            <div className="predictions-grid">
              {Object.entries(previsoes.predictions).map(([produto, predicoes]) => (
                <div key={produto} className="prediction-item">
                  <div className="product-name">{produto}</div>
                  <div className="prediction-value">{predicoes[0]?.predicted_demand || 0} unidades</div>
                  <div className="prediction-range">
                    Faixa: {predicoes[0]?.lower_bound || 0} - {predicoes[0]?.upper_bound || 0}
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-container">
              <h4 style={{ marginBottom: '16px' }}>Demanda Prevista por Produto</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatarDadosBarras()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="produto" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demanda" fill="#B8860B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </PrevisaoCard>
    </PrevisaoContainer>
  )
}

