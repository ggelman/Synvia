import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Card, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { CupomImpressao } from "../components/CupomImpressao";
import api from "../services/api";
import { formatarTelefone } from "../util/format";

const VendaContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`

const ProductSearch = styled.div`
  margin-bottom: 20px;
  
  .search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    margin-top: 8px;
    
    .product-item {
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid ${(props) => props.theme.colors.border};
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .product-name {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
      }
      
      .product-price {
        color: ${(props) => props.theme.colors.primary};
        font-size: 14px;
      }
    }
  }
`

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  
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
  
  .remove-btn {
    background: none;
    color: ${(props) => props.theme.colors.danger};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &:hover {
      background-color: rgba(220, 53, 69, 0.1);
    }
  }
`

const ResumoVenda = styled(Card)`
  .resumo-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 18px;
      color: ${(props) => props.theme.colors.primary};
    }
    
    &.desconto {
      color: ${(props) => props.theme.colors.success};
      font-weight: 600;
    }
  }
`

const PaymentOptions = styled.div`
  margin: 20px 0;
  
  .payment-option {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    input[type="radio"] {
      margin-right: 8px;
    }
    
    label {
      cursor: pointer;
    }
  }
`

const FidelidadeSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e8f5e8;
  
  .pontos-input {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    
    input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-width: 120px;
    }
    
    .btn-max {
      background: ${(props) => props.theme.colors.secondary};
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
  
  .desconto-info {
    font-size: 14px;
    color: ${(props) => props.theme.colors.success};
    font-weight: 600;
    margin-top: 8px;
  }
  
  .pontos-regra {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
    font-style: italic;
  }
`

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
`

const ClienteSelecionadoCard = styled.div`
  margin: 16px 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .cliente-info {
    font-weight: 600;
  }

  .pontos-disponiveis {
    font-weight: 600;
    color: ${(props) => props.theme.colors.success};
  }
`;

export const NovaVenda = () => {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [itensVenda, setItensVenda] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState("");
  const [showClienteResults, setShowClienteResults] = useState(false);
  const [showCupom, setShowCupom] = useState(false);
  const [vendaFinalizada, setVendaFinalizada] = useState(null);

  const [pontosParaUsar, setPontosParaUsar] = useState("");
  const [descontoPontos, setDescontoPontos] = useState(0);
  const [tipoCartao, setTipoCartao] = useState('Crédito');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [produtosRes, clientesRes] = await Promise.all([
          api.get('/produtos/disponiveis'),
          api.get('/clientes')
        ]);

        const produtosAdaptados = produtosRes.data.map(p => ({ ...p, id: p.idProduto }));
        setProdutos(produtosAdaptados);

        const clientesAdaptados = clientesRes.data.map(c => ({
          ...c,
          id: c.idCliente,
          pontos: c.fidelidade ? c.fidelidade.pontos : 0
        }));
        setClientes(clientesAdaptados);

      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const subtotal = calcularSubtotal();
    const pontosDisponiveis = clienteSelecionado?.pontos ?? 0;
    
    if (pontosParaUsar && clienteSelecionado && pontosDisponiveis > 0 && subtotal > 0) {
        let pontos = Number.parseInt(pontosParaUsar);

        if (pontos > pontosDisponiveis) {
            pontos = pontosDisponiveis;
            setPontosParaUsar(String(pontos));
        }
        
        const descontoPotencial = pontos * 0.05;
        const descontoFinal = Math.min(descontoPotencial, subtotal);
        setDescontoPontos(descontoFinal);
    } else {
        setDescontoPontos(0);
    }
  }, [pontosParaUsar, clienteSelecionado, itensVenda]);

  const filteredProdutos = produtos.filter((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredClientes = useMemo(() => {
    const termo = searchCliente.toLowerCase();
    const termoNumerico = searchCliente.replace(/\D/g, "");

    if (!termo) return [];

    return clientes.filter(c => {
      const nomeMatch = c.nome?.toLowerCase().includes(termo);

      if (termoNumerico.length > 0) {
        const telefoneMatch = c.telefone && String(c.telefone).replace(/\D/g, "").includes(termoNumerico);
        const cpfMatch = c.cpf && String(c.cpf).replace(/\D/g, "").includes(termoNumerico);
        return nomeMatch || telefoneMatch || cpfMatch;
      }
      
      return nomeMatch;
    });
  }, [clientes, searchCliente]);

  const selectCliente = (cliente) => {
    setClienteSelecionado(cliente)
    setSearchCliente("")
    setShowClienteResults(false)
    setPontosParaUsar("")
    setDescontoPontos(0)
  }

  const addItem = (produto) => {
    const existingItem = itensVenda.find((item) => item.produtoId === produto.id)

    if (existingItem) {
      setItensVenda((prev) =>
        prev.map((item) => (item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)),
      )
    } else {
      setItensVenda((prev) => [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
        },
      ])
    }

    setSearchTerm("")
    setShowResults(false)
  }

  const removeItem = (produtoId) => {
    setItensVenda((prev) => prev.filter((item) => item.produtoId !== produtoId))
  }

  const updateQuantidade = (produtoId, quantidade) => {
    if (quantidade <= 0) {
      removeItem(produtoId)
      return
    }

    setItensVenda((prev) =>
      prev.map((item) => (item.produtoId === produtoId ? { ...item, quantidade: Number.parseInt(quantidade) } : item)),
    )
  }

  const calcularSubtotal = () => {
    return itensVenda.reduce((total, item) => total + item.preco * item.quantidade, 0)
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    return Math.max(0, subtotal - descontoPontos)
  }

  const usarTodosPontos = () => {
    if (clienteSelecionado) {
      const subtotal = calcularSubtotal()
      const maxPontosUteis = Math.floor(subtotal / 0.05)
      const pontosDisponiveis = clienteSelecionado.pontos
      const pontosAUsar = Math.min(maxPontosUteis, pontosDisponiveis)
      setPontosParaUsar(pontosAUsar.toString())
    }
  }

  const handleFinalizarVenda = async () => {
    if (itensVenda.length === 0) {
      alert("Adicione pelo menos um item à venda");
      return;
    }
    if (!metodoPagamento) {
      alert("Selecione uma forma de pagamento");
      return;
    }

    setLoading(true);

    try {
      const vendaParaEnviar = {
        itens: itensVenda.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
        metodoPagamento: metodoPagamento === 'Cartão' ? `Cartão - ${tipoCartao}` : metodoPagamento,
        clienteId: clienteSelecionado?.id || null,
        pontosParaUtilizar: Number.parseInt(pontosParaUsar) || 0,
      };

      const response = await api.post('/vendas', vendaParaEnviar);

      const vendaCompletaDaAPI = response.data;
      setVendaFinalizada(vendaCompletaDaAPI);

      setSuccess(true);

      setItensVenda([]);
      setMetodoPagamento("");
      setSearchTerm("");
      setClienteSelecionado(null);
      setPontosParaUsar("");
      setDescontoPontos(0);

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Erro ao finalizar venda:", error.response);
      const errorMessage = error.response?.data?.message || "Ocorreu um erro inesperado.";
      alert("Erro ao finalizar venda: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CardHeader>
        <h2>Registro de Venda</h2>
      </CardHeader>

      {success && vendaFinalizada && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <SuccessMessage style={{ flex: 1, margin: 0 }}>
            ✅ Venda finalizada com sucesso!
            {clienteSelecionado && (
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                {vendaFinalizada.pontosUsados > 0 && <div>Pontos utilizados: {vendaFinalizada.pontosUsados}</div>}
                {vendaFinalizada.pontosGanhos > 0 && <div>Cliente ganhou {vendaFinalizada.pontosGanhos} pontos!</div>}
              </div>
            )}
          </SuccessMessage>
          <Button variant="secondary" onClick={() => setShowCupom(true)}>
            🖨️ Imprimir Cupom
          </Button>
        </div>
      )}

      <VendaContainer>
        <Card>
          <CardHeader>
            <h3>Adicionar Produtos</h3>
          </CardHeader>

          <ProductSearch>
            <Input
              label="Buscar Produto"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowResults(e.target.value.length > 0)
              }}
              placeholder="Digite o nome do produto..."
            />

            {showResults && searchTerm && (
              <div className="search-results">
                {filteredProdutos.map((produto) => (
                  <button
                    key={produto.id}
                    className="product-item"
                    type="button"
                    onClick={() => addItem(produto)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <div className="product-name">{produto.nome}</div>
                    <div className="product-price">R$ {produto.preco.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </ProductSearch>

          <div style={{ marginBottom: "20px" }}>
            <Input
              label="Cliente (Opcional - Para Programa de Fidelidade)"
              value={searchCliente}
              onChange={(e) => {
                setSearchCliente(e.target.value)
                setShowClienteResults(e.target.value.length > 0)
              }}
              placeholder="Digite o nome, CPF ou telefone do cliente..."
            />

            {showClienteResults && searchCliente && (
              <div className="search-results">
                {filteredClientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    className="product-item"
                    type="button"
                    onClick={() => selectCliente(cliente)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <div className="product-name">{cliente.nome}</div>
                    <div className="product-price">
                      {formatarTelefone(cliente.telefone)} • {cliente.pontos} pontos
                    </div>
                  </button>
                ))}
              </div>
            )}

            {clienteSelecionado && (
              <div>
                <ClienteSelecionadoCard>
                  <div className="cliente-info">
                    <div><strong>Cliente:</strong> {clienteSelecionado.nome}</div>
                    <div style={{ fontSize: "14px", color: "#666" }}>{formatarTelefone(clienteSelecionado.telefone)}</div>
                  </div>
                  {clienteSelecionado.participaFidelidade && (
                    <div className="pontos-disponiveis">{clienteSelecionado.pontos} pontos</div>
                  )}
                  <button
                    onClick={() => setClienteSelecionado(null)}
                    style={{
                      background: "none",
                      color: "#dc3545",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      border: "1px solid #dc3545",
                    }}
                  >
                    Remover
                  </button>
                </ClienteSelecionadoCard>

                {clienteSelecionado.participaFidelidade && (
                  <FidelidadeSection>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>
                        Usar Pontos de Fidelidade:
                      </label>
                      <div className="pontos-input">
                        <input aria-label="Input field"
                          type="number"
                          min="0"
                          max={clienteSelecionado.pontos}
                          value={pontosParaUsar}
                          onChange={(e) => setPontosParaUsar(e.target.value)}
                          placeholder="0"
                        />
                        <button type="button" style={{ backgroundColor: '#10a500' }} className="btn-max" onClick={usarTodosPontos}>
                          Usar Máximo
                        </button>
                      </div>
                    </div>

                    {descontoPontos > 0 && <div className="desconto-info">💰 Desconto: R$ {descontoPontos.toFixed(2)}</div>}

                    <div className="pontos-regra">
                      💡 1 ponto = R$ 0,05 de desconto | Ganhe 1 ponto para cada R$ 1,00 gasto
                    </div>
                  </FidelidadeSection>
                )}
              </div>
            )}
          </div>

          {itensVenda.length > 0 && (
            <ItemsTable>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Qtd</th>
                  <th>Subtotal</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensVenda.map((item) => (
                  <tr key={item.produtoId}>
                    <td>{item.nome}</td>
                    <td>R$ {item.preco.toFixed(2)}</td>
                    <td>
                      <input aria-label="Input field"
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => updateQuantidade(item.produtoId, e.target.value)}
                        style={{ width: "60px", padding: "4px" }}
                      />
                    </td>
                    <td>R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    <td>
                      <button className="remove-btn" onClick={() => removeItem(item.produtoId)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ItemsTable>
          )}
        </Card>

        <ResumoVenda>
          <CardHeader>
            <h3>Resumo da Venda</h3>
          </CardHeader>

          <div className="resumo-item">
            <span>Quantidade de Itens:</span>
            <span>{itensVenda.reduce((total, item) => total + item.quantidade, 0)}</span>
          </div>

          <div className="resumo-item">
            <span>Subtotal:</span>
            <span>R$ {calcularSubtotal().toFixed(2)}</span>
          </div>

          {descontoPontos > 0 && (
            <div className="resumo-item desconto">
              <span>Desconto (Pontos):</span>
              <span>- R$ {descontoPontos.toFixed(2)}</span>
            </div>
          )}

          <div className="resumo-item">
            <span>Total:</span>
            <span>R$ {calcularTotal().toFixed(2)}</span>
          </div>

          <PaymentOptions>
            <h4>Forma de Pagamento</h4>
            {["Dinheiro", "Cartão", "PIX"].map((metodo) => (
              <div key={metodo}>
                <div className="payment-option">
                  <input aria-label="Input field"
                    type="radio"
                    id={metodo}
                    name="pagamento"
                    value={metodo}
                    checked={metodoPagamento === metodo}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                  />
                  <label htmlFor={metodo}>{metodo}</label>
                </div>

                {metodo === 'Cartão' && metodoPagamento === 'Cartão' && (
                  <div style={{ paddingLeft: '30px', marginTop: '5px' }}>
                    <div className="payment-option">
                      <input aria-label="Input field" type="radio" id="credito" name="tipoCartao" value="Crédito" checked={tipoCartao === 'Crédito'} onChange={(e) => setTipoCartao(e.target.value)} />
                      <label htmlFor="credito">Crédito</label>
                    </div>
                    <div className="payment-option">
                      <input aria-label="Input field" type="radio" id="debito" name="tipoCartao" value="Débito" checked={tipoCartao === 'Débito'} onChange={(e) => setTipoCartao(e.target.value)} />
                      <label htmlFor="debito">Débito</label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </PaymentOptions>

          <Button
            variant="success"
            onClick={handleFinalizarVenda}
            disabled={loading || itensVenda.length === 0}
            style={{ width: "100%" }}
          >
            {loading ? <Spinner /> : "Finalizar Venda"}
          </Button>
        </ResumoVenda>
      </VendaContainer>

      {showCupom && vendaFinalizada && (
        <CupomImpressao
          venda={vendaFinalizada}
          onClose={() => setShowCupom(false)}
          onPrint={() => {
            setShowCupom(false)
          }}
        />
      )}
    </div>
  )
}
