import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "./Card"
import { Button } from "./Button"
import api from "../services/api";

const AlertContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
`

const AlertCard = styled(Card)`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  margin-bottom: 12px;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .alert-title {
      font-weight: 700;
      color: #856404;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .close-btn {
      background: none;
      color: #856404;
      font-size: 18px;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        background-color: rgba(133, 100, 4, 0.1);
      }
    }
  }
  
  .alert-content {
    color: #856404;
    font-size: 14px;
    line-height: 1.4;
    
    .produto-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid rgba(133, 100, 4, 0.2);
      
      &:last-child {
        border-bottom: none;
      }
      
      .produto-nome {
        font-weight: 600;
      }
      
      .produto-qtd {
        color: #dc3545;
        font-weight: 600;
      }
    }
  }
`

const AlertBadge = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background-color: ${(props) => props.theme.colors.danger};
  color: white;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  &:hover {
    background-color: #c82333;
  }
`

const AlertModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`

const ModalContent = styled(Card)`
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`

const ProdutoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  
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
  
  .qtd-baixa {
    color: ${(props) => props.theme.colors.danger};
    font-weight: 600;
  }
  
  .qtd-zerada {
    color: ${(props) => props.theme.colors.danger};
    font-weight: 700;
    background-color: #f8d7da;
  }
`

export const AlertasEstoque = () => {
  const [alertas, setAlertas] = useState([])
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  useEffect(() => {
    const checkEstoque = async () => {
      try {
        const response = await api.get('/relatorios/estoque/baixo');
        const produtosBaixos = response.data; 

        setProdutosBaixoEstoque(produtosBaixos);
        const novosAlertas = produtosBaixos
            .filter((produto) => !dismissedAlerts.has(produto.id))
            .map((produto) => ({
                id: produto.id,
                tipo: produto.qtdAtual === 0 ? "estoque-zerado" : "estoque-baixo",
                produto: produto.nome,
                qtdAtual: produto.qtdAtual,
                qtdMinima: produto.qtdMinima || 5,
                timestamp: Date.now(),
            }));

        setAlertas(novosAlertas);
      } catch (error) {
          console.error("Erro ao verificar estoque baixo:", error.response?.data || error.message);
      }
    }

    checkEstoque()

    const interval = setInterval(checkEstoque, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [dismissedAlerts])

  const dismissAlert = (alertId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]))
    setAlertas((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case "estoque-zerado":
        return "🚨"
      case "estoque-baixo":
        return "⚠️"
      default:
        return "📦"
    }
  }

  const getAlertTitle = (tipo) => {
    switch (tipo) {
      case "estoque-zerado":
        return "Estoque Zerado!"
      case "estoque-baixo":
        return "Estoque Baixo!"
      default:
        return "Alerta de Estoque"
    }
  }

  return (
    <>
      <AlertContainer>
        {alertas.slice(0, 3).map((alerta) => (
          <AlertCard key={alerta.id}>
            <div className="alert-header">
              <div className="alert-title">
                {getAlertIcon(alerta.tipo)}
                {getAlertTitle(alerta.tipo)}
              </div>
              <button className="close-btn" onClick={() => dismissAlert(alerta.id)}>
                ×
              </button>
            </div>
            <div className="alert-content">
              <div className="produto-item">
                <span className="produto-nome">{alerta.produto}</span>
                <span className="produto-qtd">{alerta.qtdAtual} unidades</span>
              </div>
              {alerta.tipo === "estoque-zerado" ? (
                <p style={{ marginTop: "8px", fontSize: "12px" }}>Produto sem estoque! Reponha imediatamente.</p>
              ) : (
                <p style={{ marginTop: "8px", fontSize: "12px" }}>
                  Estoque abaixo do mínimo ({alerta.qtdMinima} unidades).
                </p>
              )}
            </div>
          </AlertCard>
        ))}
      </AlertContainer>

      {produtosBaixoEstoque.length > 0 && (
        <AlertBadge onClick={() => setShowModal(true)}>
          {produtosBaixoEstoque.length} alerta{produtosBaixoEstoque.length > 1 ? "s" : ""}
        </AlertBadge>
      )}

      {showModal && (
        <AlertModal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <h2>Alertas de Estoque</h2>
            </CardHeader>

            <p style={{ marginBottom: "16px", color: "#856404" }}>
              Os seguintes produtos estão com estoque baixo ou zerado:
            </p>

            <ProdutoTable>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd Atual</th>
                  <th>Qtd Mínima</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtosBaixoEstoque.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td className={produto.qtdAtual === 0 ? "qtd-zerada" : "qtd-baixa"}>{produto.qtdAtual}</td>
                    <td>{produto.qtdMinima || 5}</td>
                    <td>
                      {produto.qtdAtual === 0 ? (
                        <span style={{ color: "#dc3545", fontWeight: "600" }}>🚨 Zerado</span>
                      ) : (
                        <span style={{ color: "#ffc107", fontWeight: "600" }}>⚠️ Baixo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ProdutoTable>

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Fechar
              </Button>
            </div>
          </ModalContent>
        </AlertModal>
      )}
    </>
  )
}
