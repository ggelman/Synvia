import { useState } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import { Button } from "./Button"
import { Spinner } from "./Spinner"

const PrintModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const PrintContent = styled.div`
  background-color: white;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

const PrintHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    padding: 4px;
    cursor: pointer;
    
    &:hover {
      color: #333;
    }
  }
`

const CupomContainer = styled.div`
  padding: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  
  @media print {
    padding: 0;
    font-size: 10px;
  }
`

const CupomHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px dashed #333;
  padding-bottom: 15px;
  
  .logo {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .empresa-nome {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .empresa-info {
    font-size: 10px;
    color: #666;
  }
`

const CupomInfo = styled.div`
  margin-bottom: 15px;
  font-size: 10px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
`

const ItemsTable = styled.div`
  margin-bottom: 15px;
  
  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    font-weight: bold;
    border-bottom: 1px solid #333;
    padding-bottom: 4px;
    margin-bottom: 8px;
    font-size: 10px;
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 10px;
  }
`

const CupomTotal = styled.div`
  border-top: 1px dashed #333;
  padding-top: 10px;
  margin-bottom: 15px;
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    &.desconto {
      color: #28a745;
      font-weight: 600;
    }
    
    &.final {
      font-weight: bold;
      font-size: 14px;
      border-top: 1px solid #333;
      padding-top: 8px;
      margin-top: 8px;
    }
  }
`

const CupomFooter = styled.div`
  text-align: center;
  border-top: 1px dashed #333;
  padding-top: 15px;
  font-size: 10px;
  color: #666;
  
  .agradecimento {
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .fidelidade-info {
    margin-top: 8px;
    background-color: #f0f8ff;
    padding: 8px;
    border-radius: 4px;
    color: #333;
  }
`

const PrintActions = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`

export const CupomImpressao = ({ venda, onClose, onPrint }) => {
  const [printing, setPrinting] = useState(false)

  const handlePrint = async () => {
    setPrinting(true)

    try {
      const printWindow = window.open("", "_blank")

      const subtotal = venda.valorTotal + venda.descontoFidelidade;

      const descontoSection =
        venda.descontoFidelidade > 0
          ? `
        <div class="total-row desconto">
          <span>Desconto (Pontos):</span>
          <span>- R$ ${venda.descontoFidelidade.toFixed(2)}</span>
        </div>
      `
          : "";

      const fidelidadeInfo = venda.pedido.cliente
        ? `
        <div class="fidelidade-info">
          <div><strong>PROGRAMA DE FIDELIDADE</strong></div>
          ${venda.pontosUtilizados > 0 ? `<div>Pontos Utilizados: ${venda.pontosUtilizados}</div>` : ""}
          ${venda.pontosGanhos > 0 ? `<div>Pontos Ganhos: ${venda.pontosGanhos}</div>` : ""}
          <div>Saldo de Pontos: ${venda.pedido.cliente.fidelidade.pontos}</div>
        </div>
      `
        : "";

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cupom de Venda</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              width: 300px;
            }
            .cupom-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px dashed #333;
              padding-bottom: 15px;
            }
            .logo { font-size: 20px; margin-bottom: 8px; }
            .empresa-nome { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .empresa-info { font-size: 10px; color: #666; }
            .cupom-info { margin-bottom: 15px; font-size: 10px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .items-table { margin-bottom: 15px; }
            .table-header {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr 1fr;
              gap: 8px;
              font-weight: bold;
              border-bottom: 1px solid #333;
              padding-bottom: 4px;
              margin-bottom: 8px;
              font-size: 10px;
            }
            .table-row {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr 1fr;
              gap: 8px;
              margin-bottom: 4px;
              font-size: 10px;
            }
            .cupom-total {
              border-top: 1px dashed #333;
              padding-top: 10px;
              margin-bottom: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .total-row.desconto {
              color: #28a745;
              font-weight: 600;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #333;
              padding-top: 8px;
              margin-top: 8px;
            }
            .cupom-footer {
              text-align: center;
              border-top: 1px dashed #333;
              padding-top: 15px;
              font-size: 10px;
              color: #666;
            }
            .agradecimento { font-weight: bold; margin-bottom: 8px; }
            .fidelidade-info {
              margin-top: 8px;
              background-color: #f0f8ff;
              padding: 8px;
              border-radius: 4px;
              color: #333;
            }
            @media print {
              body { padding: 0; font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="cupom-header">
            <div class="logo">🥖</div>
            <div class="empresa-nome">SYNVIA ENTERPRISES</div>
            <div class="empresa-info">
              Rua das Flores, 123 - Centro<br>
              Tel: (11) 3456-7890<br>
              CNPJ: 12.345.678/0001-90
            </div>
          </div>

          <div class="cupom-info">
            <div class="info-row">
              <span>Data:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span>Hora:</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span>Venda:</span>
              <span>#${venda.idVenda || "001"}</span>
            </div>
            <div class="info-row">
              <span>Operador:</span>
              <span>Sistema</span>
            </div>
            ${venda.pedido.cliente
          ? `
            <div class="info-row">
              <span>Cliente:</span>
              <span>${venda.pedido.cliente.nome}</span>
            </div>
            `
          : ""
        }
          </div>

          <div class="items-table">
            <div class="table-header">
                <span>PRODUTO</span>
                <span>QTD</span>
                <span>VALOR</span>
                <span>TOTAL</span>
            </div>
            ${venda.pedido.itens
          .map(item => `
                    <div class="table-row">
                        <span>${item.produto.nome}</span>
                        <span>${item.quantidade}</span>
                        <span>R$ ${item.precoUnitario.toFixed(2)}</span>
                        <span>R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</span>
                    </div>
                `).join("")}
          </div>

          <div class="cupom-total">
              <div class="total-row">
                  <span>Subtotal:</span>
                  <span>R$ ${subtotal.toFixed(2)}</span>
              </div>
              ${descontoSection}
              <div class="total-row final">
                  <span>TOTAL:</span>
                  <span>R$ ${venda.valorTotal.toFixed(2)}</span>
              </div>
          </div>

          <div class="cupom-info">
            <div class="info-row">
              <span>Forma de Pagamento:</span>
              <span>${venda.metodoPagamento}</span>
            </div>
          </div>

          <div class="cupom-footer">
            <div class="agradecimento">OBRIGADO PELA PREFERÊNCIA!</div>
            <div>Volte sempre!</div>
            <div>www.synvia.io</div>
            ${fidelidadeInfo}
          </div>
        </body>
        </html>
      `

      printWindow.document.documentElement.innerHTML = printContent
      printWindow.document.close()

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }

      if (onPrint) {
        onPrint()
      }
    } catch (error) {
      console.error("Erro ao imprimir:", error)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <PrintModal onClick={onClose}>
      <PrintContent onClick={(e) => e.stopPropagation()}>
        <PrintHeader>
          <h3>Cupom de Venda</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </PrintHeader>

        <CupomContainer>
          <CupomHeader>
            <div className="logo">🥖</div>
            <div className="empresa-nome">SYNVIA ENTERPRISES</div>
            <div className="empresa-info">
              Rua das Flores, 123 - Centro
              <br />
              Tel: (11) 3456-7890
              <br />
              CNPJ: 12.345.678/0001-90
            </div>
          </CupomHeader>

          <CupomInfo>
            <div className="info-row">
              <span>Data:</span>
              <span>{new Date(venda.data).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span>Hora:</span>
              <span>{new Date(venda.data).toLocaleTimeString()}</span>
            </div>
            <div className="info-row">
              <span>Venda:</span>
              <span>#{venda.idVenda || "001"}</span>
            </div>
            <div className="info-row">
              <span>Operador:</span>
              <span>Sistema</span>
            </div>
            {venda.pedido.cliente && (
              <div className="info-row">
                <span>Cliente:</span>
                <span>{venda.pedido.cliente.nome}</span>
              </div>
            )}
          </CupomInfo>

          <ItemsTable>
            <div className="table-header">
              <span>PRODUTO</span>
              <span>QTD</span>
              <span>VALOR</span>
              <span>TOTAL</span>
            </div>
            {venda.pedido.itens.map((item, index) => (
              <div key={`${item.produto.id || item.produto.nome}-${index}`} className="table-row">
                <span>{item.produto.nome}</span>
                <span>{item.quantidade}</span>
                <span>R$ {item.precoUnitario.toFixed(2)}</span>
                <span>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </ItemsTable>

          <CupomTotal>
            <div className="total-row">
              <span>Subtotal:</span>
              <span>R$ {(venda.valorTotal + venda.descontoFidelidade).toFixed(2)}</span>
            </div>
            {venda.descontoFidelidade > 0 && (
              <div className="total-row desconto">
                <span>Desconto (Pontos):</span>
                <span>- R$ {venda.descontoFidelidade.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row final">
              <span>TOTAL:</span>
              <span>R$ {venda.valorTotal.toFixed(2)}</span>
            </div>
          </CupomTotal>

          <CupomInfo>
            <div className="info-row">
              <span>Forma de Pagamento:</span>
              <span>{venda.metodoPagamento}</span>
            </div>
          </CupomInfo>

          <CupomFooter>
            <div className="agradecimento">OBRIGADO PELA PREFERÊNCIA!</div>
            <div>Volte sempre!</div>
            <div>www.synvia.io</div>

            {venda.pedido.cliente && (
              <div className="fidelidade-info">
                <div>
                  <strong>PROGRAMA DE FIDELIDADE</strong>
                </div>
                {venda.pontosUtilizados > 0 && <div>Pontos Utilizados: {venda.pontosUtilizados}</div>}
                {venda.pontosGanhos > 0 && <div>Pontos Ganhos: {venda.pontosGanhos}</div>}
                <div>Saldo de Pontos: {venda.pedido.cliente.fidelidade.pontos}</div>
              </div>
            )}
          </CupomFooter>
        </CupomContainer>

        <PrintActions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handlePrint} disabled={printing}>
            {printing ? <Spinner /> : "🖨️ Imprimir"}
          </Button>
        </PrintActions>
      </PrintContent>
    </PrintModal>
  )
}

// PropTypes para validação
CupomImpressao.propTypes = {
  venda: PropTypes.shape({
    id: PropTypes.string.isRequired,
    idVenda: PropTypes.string,
    data: PropTypes.string,
    valorTotal: PropTypes.number.isRequired,
    metodoPagamento: PropTypes.string,
    descontoFidelidade: PropTypes.number,
    pontosUtilizados: PropTypes.number,
    pontosGanhos: PropTypes.number,
    pedido: PropTypes.shape({
      itens: PropTypes.array.isRequired,
      cliente: PropTypes.shape({
        nome: PropTypes.string,
        telefone: PropTypes.string,
        fidelidade: PropTypes.shape({
          pontos: PropTypes.number
        })
      })
    }).isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired
};
