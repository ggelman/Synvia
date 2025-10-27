import { useState, useEffect, useCallback } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { EmptyTable } from "../components/EmptyTable"
import api from "../services/api";

const HistoricoContainer = styled.div`
  display: grid;
  gap: 24px;
`

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 200px 150px;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const VendasTable = styled.table`
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
  
  .valor {
    font-weight: 600;
    color: ${(props) => props.theme.colors.primary};
  }
  
  .status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    
    &.finalizada {
      background-color: #d4edda;
      color: #155724;
    }
    
    &.cancelada {
      background-color: #f8d7da;
      color: #721c24;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    
    &.view {
      background-color: ${(props) => props.theme.colors.primary};
      color: white;
    }
    
    &.print {
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`

const VendaDetalhes = styled.div`
  .detalhe-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 600;
      color: ${(props) => props.theme.colors.textPrimary};
    }
    
    .value {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`

const ItensTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  
  th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    font-size: 14px;
  }
  
  td {
    font-size: 14px;
  }
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
    color: ${(props) => props.theme.colors.primary};
  }
  
  .stat-label {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  
  .page-btn {
    padding: 8px 12px;
    border-radius: 4px;
    background-color: ${(props) => props.theme.colors.secondary};
    color: white;
    font-size: 14px;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.active {
      background-color: ${(props) => props.theme.colors.primary};
    }
  }
  
  .page-info {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
  }
`

export const HistoricoVendas = () => {
  const [vendas, setVendas] = useState([])
  const [filteredVendas, setFilteredVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [selectedVenda, setSelectedVenda] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const filterVendas = useCallback(() => {
    let filtered = vendas

    if (searchTerm) {
      filtered = filtered.filter(
        (venda) =>
          venda.id.toString().includes(searchTerm) ||
          venda.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venda.operador.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "todas") {
      filtered = filtered.filter((venda) => venda.status === statusFilter)
    }

    if (dataInicio) {
      filtered = filtered.filter((venda) => new Date(venda.data) >= new Date(dataInicio))
    }

    if (dataFim) {
      filtered = filtered.filter((venda) => new Date(venda.data) <= new Date(dataFim))
    }

    setFilteredVendas(filtered)
    setCurrentPage(1)
  }, [vendas, searchTerm, statusFilter, dataInicio, dataFim])

  useEffect(() => {
    filterVendas()
  }, [filterVendas])

  const loadVendas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendas/historico');
      const vendasAdaptadas = response.data.map(venda => ({
        id: venda.idVenda,
        data: venda.data,
        cliente: venda.pedido?.cliente?.nome || "Cliente Avulso",
        quantidadeItens: venda.pedido?.itens?.length || 1,
        total: venda.valorTotal,
        metodoPagamento: venda.metodoPagamento,
        status: 'finalizada',
        operador: 'Sistema',
        itens: venda.pedido?.itens?.map(item => ({
          nome: item.produto.nome,
          quantidade: item.quantidade,
          preco: item.precoUnitario
        })) || [{ nome: "Item Genérico", quantidade: 1, preco: venda.valorTotal }]
      }));
      setVendas(vendasAdaptadas);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setVendas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendas();
  }, [loadVendas]);

  useEffect(() => {
    filterVendas();
  }, [filterVendas]);

  const viewVenda = (vendaId) => {
    const vendaSelecionada = vendas.find(v => v.id === vendaId);

    if (vendaSelecionada) {
      setSelectedVenda(vendaSelecionada);
      setShowModal(true);
    } else {
      console.error(`Venda com ID ${vendaId} não encontrada no estado local.`);
      alert("Não foi possível carregar os detalhes da venda.");
    }
  };

  const getStats = () => {
    const total = filteredVendas.length
    const totalValor = filteredVendas.reduce((sum, venda) => sum + venda.total, 0)
    const ticketMedio = total > 0 ? totalValor / total : 0
    const finalizadas = filteredVendas.filter((v) => v.status === "finalizada").length

    return { total, totalValor, ticketMedio, finalizadas }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredVendas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage)

  const stats = getStats()

  if (loading) {
    return <div>Carregando histórico...</div>
  }

  return (
    <HistoricoContainer>
      <CardHeader>
        <h2>Histórico de Vendas</h2>
      </CardHeader>

      <StatsGrid>
        <StatCard>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total de Vendas</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">R$ {stats.totalValor.toFixed(2)}</div>
          <div className="stat-label">Valor Total</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">R$ {stats.ticketMedio.toFixed(2)}</div>
          <div className="stat-label">Ticket Médio</div>
        </StatCard>
        <StatCard>
          <div className="stat-value">{stats.finalizadas}</div>
          <div className="stat-label">Finalizadas</div>
        </StatCard>
      </StatsGrid>

      <Card>
        <FilterContainer>
          <Input
            label="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ID, cliente ou operador..."
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
              <option value="todas">Todas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <Input label="Data Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />

          <Input label="Data Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </FilterContainer>

        <VendasTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data/Hora</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Operador</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <EmptyTable
                colSpan={9}
                icon="🛒"
                title="Nenhuma venda encontrada"
                description="Não há vendas registradas no período selecionado ou que correspondam aos filtros aplicados."
              />
            ) : (
              currentItems.map((venda) => (
                <tr key={venda.id}>
                  <td>#{venda.id}</td>
                  <td>
                    {new Date(venda.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    <br />
                    <small>{new Date(venda.data).toLocaleTimeString('pt-BR', { timeZone: 'UTC' })}</small>
                  </td>
                  <td>{venda.cliente || "Cliente Avulso"}</td>
                  <td>{venda.quantidadeItens}</td>
                  <td className="valor">R$ {venda.total.toFixed(2)}</td>
                  <td>{venda.metodoPagamento}</td>
                  <td>
                    <span className={`status ${venda.status}`}>
                      {venda.status === "finalizada" ? "Finalizada" : "Cancelada"}
                    </span>
                  </td>
                  <td>{venda.operador}</td>
                  <td>
                    <div className="actions">
                      <button className="action-btn view" onClick={() => viewVenda(venda.id)}>
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </VendasTable>

        {totalPages > 1 && (
          <Pagination>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>

            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </Pagination>
        )}
      </Card>

      {/* Modal de Detalhes */}
      {showModal && selectedVenda && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <h3>Detalhes da Venda #{selectedVenda.id}</h3>
            </CardHeader>

            <VendaDetalhes>
              <div className="detalhe-row">
                <span className="label">Data/Hora:</span>
                <span className="value">{new Date(selectedVenda.data).toLocaleString('pt-BR', { timeZone: 'UTC' })}</span>
              </div>
              <div className="detalhe-row">
                <span className="label">Cliente:</span>
                <span className="value">{selectedVenda.cliente || "Cliente Avulso"}</span>
              </div>
              <div className="detalhe-row">
                <span className="label">Operador:</span>
                <span className="value">{selectedVenda.operador}</span>
              </div>
              <div className="detalhe-row">
                <span className="label">Forma de Pagamento:</span>
                <span className="value">{selectedVenda.metodoPagamento}</span>
              </div>
              <div className="detalhe-row">
                <span className="label">Status:</span>
                <span className="value">{selectedVenda.status === "finalizada" ? "Finalizada" : "Cancelada"}</span>
              </div>
            </VendaDetalhes>

            <h4 style={{ margin: "20px 0 10px" }}>Itens da Venda</h4>
            <ItensTable>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedVenda.itens.map((item) => (
                  <tr key={item.id || item.nome}>
                    <td>{item.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {item.preco.toFixed(2)}</td>
                    <td>R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </ItensTable>

            <VendaDetalhes>
              <div className="detalhe-row">
                <span className="label">Total:</span>
                <span className="value" style={{ fontSize: "18px", fontWeight: "700" }}>
                  R$ {selectedVenda.total.toFixed(2)}
                </span>
              </div>
            </VendaDetalhes>

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Fechar
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </HistoricoContainer>
  )
}