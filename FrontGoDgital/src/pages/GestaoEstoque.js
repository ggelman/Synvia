import { useState, useEffect, useCallback } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
import api from "../services/api";

const EstoqueContainer = styled.div`
  display: grid;
  gap: 24px;
`

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 200px;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const EstoqueTable = styled.table`
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
    position: sticky;
    top: 0;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  .status-baixo {
    color: ${(props) => props.theme.colors.danger};
    font-weight: 600;
  }
  
  .status-ok {
    color: ${(props) => props.theme.colors.success};
    font-weight: 600;
  }
  
  .status-zerado {
    background-color: #f8d7da;
    color: ${(props) => props.theme.colors.danger};
    font-weight: 700;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    
    &.edit {
      background-color: ${(props) => props.theme.colors.primary};
      color: white;
    }
    
    &.adjust {
      background-color: ${(props) => props.theme.colors.secondary};
      color: white;
    }
  }
`

const Modal = styled.div`
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

const ModalContent = styled(Card)`
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`

const AjusteForm = styled.form`
  display: grid;
  gap: 16px;
  margin-top: 16px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const StatCard = styled(Card)`
  text-align: center;
  padding: 16px;
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .stat-label {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
  }
  
  &.danger .stat-value {
    color: ${(props) => props.theme.colors.danger};
  }
  
  &.success .stat-value {
    color: ${(props) => props.theme.colors.success};
  }
  
  &.warning .stat-value {
    color: #ffc107;
  }
`

export const GestaoEstoque = () => {
  const [produtos, setProdutos] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState(null)
  const [ajusteData, setAjusteData] = useState({
    tipo: "entrada",
    quantidade: "",
    motivo: "",
  })
  const [ajusteLoading, setAjusteLoading] = useState(false)

  const getEstoqueStatus = useCallback((produto) => {
    if (produto.qtdAtual === 0) return "zerado"
    if (produto.qtdAtual <= (produto.qtdMinima || 5)) return "baixo"
    return "ok"
  }, [])

  const filterProdutos = useCallback(() => {
    let filtered = produtos

    if (searchTerm) {
      filtered = filtered.filter((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((produto) => {
        const status = getEstoqueStatus(produto)
        return status === statusFilter
      })
    }

    setFilteredProdutos(filtered)
  }, [produtos, searchTerm, statusFilter, getEstoqueStatus])

  useEffect(() => {
    filterProdutos()
  }, [filterProdutos])

  const loadProdutos = useCallback(async () => { 
    setLoading(true);
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case "zerado":
        return "Zerado"
      case "baixo":
        return "Baixo"
      case "ok":
        return "OK"
      default:
        return status
    }
  }

  const openAjusteModal = (produto) => {
    setSelectedProduto(produto)
    setAjusteData({
      tipo: "entrada",
      quantidade: "",
      motivo: "",
    })
    setShowModal(true)
  }

  const handleAjusteSubmit = async (e) => {
    e.preventDefault();

    if (!ajusteData.quantidade || Number.parseInt(ajusteData.quantidade) <= 0) {
      alert("Quantidade deve ser maior que zero");
      return;
    }

    setAjusteLoading(true);

    const ajusteParaEnviar = {
      tipo: ajusteData.tipo,
      quantidade: Number.parseInt(ajusteData.quantidade),
      motivo: ajusteData.motivo
    };

    try {
      const response = await api.post(`/produtos/${selectedProduto.idProduto}/ajustar-estoque`, ajusteParaEnviar);
      const produtoAtualizado = response.data;

      setProdutos((prev) =>
        prev.map((p) => (p.idProduto === produtoAtualizado.idProduto ? produtoAtualizado : p))
      );

      setShowModal(false);
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error.response?.data || error.message);
      alert("Ocorreu um erro ao ajustar o estoque.");
    } finally {
      setAjusteLoading(false);
    }
  };

  const getStats = () => {
    const total = produtos.length
    const zerados = produtos.filter((p) => p.qtdAtual === 0).length
    const baixos = produtos.filter((p) => p.qtdAtual > 0 && p.qtdAtual <= (p.qtdMinima || 5)).length
    const ok = total - zerados - baixos

    return { total, zerados, baixos, ok }
  }

  const stats = getStats()

  if (loading) {
    return <div>Carregando estoque...</div>
  }

  return (
    <EstoqueContainer>
      <CardHeader>
        <h2>Gestão de Estoque</h2>
      </CardHeader>

      <StatsGrid>
        <StatCard>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total de Produtos</div>
        </StatCard>
        <StatCard className="success">
          <div className="stat-value">{stats.ok}</div>
          <div className="stat-label">Estoque OK</div>
        </StatCard>
        <StatCard className="warning">
          <div className="stat-value">{stats.baixos}</div>
          <div className="stat-label">Estoque Baixo</div>
        </StatCard>
        <StatCard className="danger">
          <div className="stat-value">{stats.zerados}</div>
          <div className="stat-label">Estoque Zerado</div>
        </StatCard>
      </StatsGrid>

      <Card>
        <FilterContainer>
          <Input
            label="Buscar Produto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do produto..."
          />

          <div>
            <label
              htmlFor="statusFilter"
              style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}
            >
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            >
              <option value="todos">Todos</option>
              <option value="ok">Estoque OK</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="zerado">Estoque Zerado</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <Button variant="primary" onClick={loadProdutos}>
              Atualizar
            </Button>
          </div>
        </FilterContainer>

        <EstoqueTable>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Qtd Atual</th>
              <th>Qtd Mínima</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.map((produto) => {
              const status = getEstoqueStatus(produto)
              let qtdAtualClass = ""
              if (status === "baixo") {
                qtdAtualClass = "status-baixo"
              } else if (status === "ok") {
                qtdAtualClass = "status-ok"
              }

              return (
                <tr key={produto.id || produto.idProduto || `produto-${produto.nome}-${Math.random()}`} className={status === "zerado" ? "status-zerado" : ""}>
                  <td>{produto.nome}</td>
                  <td>R$ {produto.preco.toFixed(2)}</td>
                  <td className={qtdAtualClass}>{produto.qtdAtual}</td>
                  <td>{produto.qtdMinima || 5}</td>
                  <td>
                    <span className={`status-${status}`}>{getStatusLabel(status)}</span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn adjust" style={{ backgroundColor: '#5a6268' }} onClick={() => openAjusteModal(produto)}>
                        Ajustar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </EstoqueTable>
      </Card>

      {/* Modal de Ajuste */}
      {showModal && selectedProduto && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <h3>Ajustar Estoque - {selectedProduto.nome}</h3>
            </CardHeader>

            <p>
              <strong>Estoque atual:</strong> {selectedProduto.qtdAtual} unidades
            </p>

            <AjusteForm onSubmit={handleAjusteSubmit}>
              <div>
                <label
                  htmlFor="ajuste-tipo-entrada"
                  style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}
                >
                  Tipo de Ajuste *
                </label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label htmlFor="ajuste-tipo-entrada" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input aria-label="Input field"
                      id="ajuste-tipo-entrada"
                      type="radio"
                      name="tipo"
                      value="entrada"
                      checked={ajusteData.tipo === "entrada"}
                      onChange={(e) => setAjusteData((prev) => ({ ...prev, tipo: e.target.value }))}
                    />
                    <span>Entrada</span>
                  </label>
                  <label htmlFor="ajuste-tipo-saida" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input aria-label="Input field"
                      id="ajuste-tipo-saida"
                      type="radio"
                      name="tipo"
                      value="saida"
                      checked={ajusteData.tipo === "saida"}
                      onChange={(e) => setAjusteData((prev) => ({ ...prev, tipo: e.target.value }))}
                    />
                    <span>Saída</span>
                  </label>
                </div>
              </div>

              <Input
                label="Quantidade"
                type="number"
                min="1"
                value={ajusteData.quantidade}
                onChange={(e) => setAjusteData((prev) => ({ ...prev, quantidade: e.target.value }))}
                required
                placeholder="Digite a quantidade"
              />

              <Input
                label="Motivo"
                value={ajusteData.motivo}
                onChange={(e) => setAjusteData((prev) => ({ ...prev, motivo: e.target.value }))}
                placeholder="Motivo do ajuste (opcional)"
              />

              <ButtonGroup>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="success" disabled={ajusteLoading}>
                  {ajusteLoading ? <Spinner /> : "Confirmar Ajuste"}
                </Button>
              </ButtonGroup>
            </AjusteForm>
          </ModalContent>
        </Modal>
      )}
    </EstoqueContainer>
  )
}
