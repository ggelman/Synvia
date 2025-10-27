import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyChart } from "../components/EmptyChart";
import { EmptyTable } from "../components/EmptyTable";
import { FilterBar } from "../components/FilterBar";
import { StatsCards } from "../components/StatsCards";
import { Spinner } from "../components/Spinner";
import api from "../services/api";

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 90%; max-width: 500px;
  .info-grid {
    display: grid;
    gap: 12px;
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      span:first-child { font-weight: 600; }
    }
  }
`;

const FinanceiroContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled(Card)`
  .chart-placeholder {
    height: 300px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-style: italic;
    margin-top: 16px;
  }
`;

const TransacoesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
  th { background-color: #f8f9fa; font-weight: 600; }
  .valor-positivo { color: #28a745; font-weight: 600; }
  .valor-negativo { color: #dc3545; font-weight: 600; }
  .tipo {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    &.receita { background-color: #d4edda; color: #155724; }
    &.despesa { background-color: #f8d7da; color: #721c24; }
  }
`;

const MetasCard = styled(Card)`
  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .meta-info {
      .meta-nome {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
      }
      
      .meta-progresso {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
    
    .meta-valor {
      text-align: right;
      
      .meta-atual {
        font-weight: 600;
        color: ${(props) => props.theme.colors.primary};
      }
      
      .meta-objetivo {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
    
    .progress-fill {
      height: 100%;
      background-color: ${(props) => props.theme.colors.primary};
      transition: width 0.3s ease;
    }
  }
`;

const FluxoCaixaCard = styled(Card)`
  .fluxo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 16px;
    }
    
    .fluxo-label {
      color: ${(props) => props.theme.colors.textPrimary};
    }
    
    .fluxo-valor {
      font-weight: 600;
      
      &.positivo {
        color: ${(props) => props.theme.colors.success};
      }
      
      &.negativo {
        color: ${(props) => props.theme.colors.danger};
      }
    }
  }
`;

const getDateRange = (period, customDates) => {
  const formatDate = (date) => date.toISOString().split('T')[0];
  const hoje = new Date();
  let inicio, fim;

  switch (period) {
    case "hoje": {
      inicio = formatDate(hoje);
      fim = formatDate(hoje);
      break;
    }
    case "semana": {
      const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
      inicio = formatDate(primeiroDiaSemana);
      fim = formatDate(new Date());
      break;
    }
    case "personalizado": {
      if (!customDates.dataInicio || !customDates.dataFim) {
        throw new Error("Para período personalizado, as datas de início e fim são obrigatórias.");
      }
      inicio = customDates.dataInicio;
      fim = customDates.dataFim;
      break;
    }
    case "mes":
    default: {
      inicio = formatDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
      fim = formatDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
      break;
    }
  }
  return { inicio, fim };
};

export const DashboardFinanceiro = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    receita: 0,
    despesas: 0,
    lucro: 0,
    totalVendas: 0,
    transacoes: [],
    metas: [],
    fluxoCaixa: { saldoInicial: 0, entradas: 0, saidas: 0, saldoFinal: 0 },
  });
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    periodo: "mes",
    dataInicio: "",
    dataFim: "",
  });

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [novaMeta, setNovaMeta] = useState({
    descricao: "",
    valorAlvo: "",
    dataInicio: "",
    dataFim: "",
  });

  const [isTransacaoModalOpen, setIsTransacaoModalOpen] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "",
    valor: "",
    tipo: "DESPESA",
  });

  const [dadosGrafico, setDadosGrafico] = useState([]);

  const loadDados = useCallback(async () => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para login...");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { inicio, fim } = getDateRange(filtros.periodo, filtros);
      const params = { inicio, fim };

      const [financeiroResponse, resumoResponse, transacoesResponse, evolucaoResponse] = await Promise.all([
        api.get("/relatorios/financeiro", { params }),
        api.get("/relatorios/resumo-diario", { params }),
        api.get("/relatorios/transacoes", { params }),
        api.get("/relatorios/evolucao-financeira", { params })
      ]);

      const metasResponse = await api.get("/metas-financeiras/ativas");

      setDados({
        receita: financeiroResponse.data.receita || 0,
        despesas: financeiroResponse.data.despesa || 0,
        lucro: financeiroResponse.data.lucro || 0,
        totalVendas: resumoResponse.data.quantidadeVendas || 0,
        transacoes: transacoesResponse.data || [],
        metas: metasResponse.data || [],
        fluxoCaixa: {
          saldoInicial: 0,
          entradas: financeiroResponse.data.receita || 0,
          saidas: financeiroResponse.data.despesa || 0,
          saldoFinal: financeiroResponse.data.lucro || 0,
        },
      });
      setDadosGrafico(evolucaoResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      
      // Se erro 401/403, redirecionar para login
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Token inválido ou expirado. Redirecionando para login...");
        navigate("/login");
        return;
      }
      
      setError(error.message || "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [filtros, isAuthenticated, navigate]);

  useEffect(() => {
    loadDados();
  }, [loadDados]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleMetaFormChange = (e) => {
    const { name, value } = e.target;
    setNovaMeta(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarMeta = async (e) => {
    e.preventDefault();
    try {
      await api.post("/metas-financeiras", novaMeta);
      alert("Meta criada com sucesso!");
      setIsMetaModalOpen(false);
      loadDados();
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao criar meta.");
    }
  };

  const handleTransacaoFormChange = (e) => {
    const { name, value } = e.target;
    setNovaTransacao(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarTransacao = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transacoes", novaTransacao);
      alert("Transação registrada com sucesso!");
      setIsTransacaoModalOpen(false);
      setNovaTransacao({ descricao: "", valor: "", tipo: "DESPESA" });
      loadDados();
    } catch (error) {
      alert("Erro ao registrar transação.");
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spinner /></div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Erro: {error}</div>;

  return (
    <FinanceiroContainer>
      <CardHeader><h2>Dashboard Financeiro</h2></CardHeader>

      <FilterBar
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onAtualizar={loadDados}
      />

      <StatsCards dados={dados} />

      <ChartsGrid>
        <ChartContainer>
          <CardHeader><h3>Evolução Financeira</h3></CardHeader>
          {dadosGrafico.length === 0 ? (
            <EmptyChart
              icon="📈"
              title="Sem dados para o período"
              description="Não há vendas registradas no período selecionado para exibir a evolução."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Faturamento"]} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={2} name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <div>
          <MetasCard>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Metas do Mês</h3>
              <Button size="sm" onClick={() => setIsMetaModalOpen(true)}>+ Adicionar Meta</Button>
            </CardHeader>

            {dados.metas.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                Nenhuma meta ativa para o período.
              </div>
            ) : (
              dados.metas.map((meta) => (
                <div key={meta.id} className="meta-item">
                  <div className="meta-info">
                    <div className="meta-nome">{meta.descricao}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(meta.progressoPercentual, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="meta-valor">
                    <div className="meta-atual">R$ {meta.valorAtual.toFixed(2)}</div>
                    <div className="meta-objetivo">/ R$ {meta.valorAlvo.toFixed(2)}</div>
                  </div>
                </div>
              ))
            )}
          </MetasCard>

          <FluxoCaixaCard>
            <CardHeader><h3>Fluxo de Caixa</h3></CardHeader>
            <div className="fluxo-item">
              <span>Saldo Inicial:</span>
              <span className="fluxo-valor">R$ {dados.fluxoCaixa.saldoInicial.toFixed(2)}</span>
            </div>
            <div className="fluxo-item">
              <span>Entradas:</span>
              <span className="fluxo-valor positivo">+ R$ {dados.fluxoCaixa.entradas.toFixed(2)}</span>
            </div>
            <div className="fluxo-item">
              <span>Saídas:</span>
              <span className="fluxo-valor negativo">- R$ {dados.fluxoCaixa.saidas.toFixed(2)}</span>
            </div>
            <div className="fluxo-item">
              <span>Saldo Final:</span>
              <span className={`fluxo-valor ${dados.fluxoCaixa.saldoFinal >= 0 ? "positivo" : "negativo"}`}>
                R$ {dados.fluxoCaixa.saldoFinal.toFixed(2)}
              </span>
            </div>
          </FluxoCaixaCard>
        </div>
      </ChartsGrid>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Últimas Transações</h3>
          <Button size="sm" onClick={() => setIsTransacaoModalOpen(true)}>+ Adicionar Lançamento</Button>
        </CardHeader>
        <TransacoesTable>
          <thead>
            <tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Valor</th></tr>
          </thead>
          <tbody>
            {dados.transacoes.length === 0 ? (
              <EmptyTable colSpan={5} icon="💳" title="Nenhuma transação registrada" />
            ) : (
              dados.transacoes.slice(0, 10).map((transacao) => (
                <tr key={transacao.id}>
                  <td>{new Date(transacao.data).toLocaleDateString()}</td>
                  <td>{transacao.descricao}</td>
                  <td><span className={`tipo ${transacao.tipo}`}>{transacao.tipo}</span></td>
                  <td>{transacao.categoria}</td>
                  <td className={transacao.tipo === "RECEITA" ? "valor-positivo" : "valor-negativo"}>
                    {transacao.tipo === "RECEITA" ? "+ " : "- "}
                    R$ {Math.abs(transacao.valor).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TransacoesTable>
      </Card>

      {isMetaModalOpen && (
        <ModalOverlay onClick={() => setIsMetaModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CardHeader><h3>Nova Meta Financeira</h3></CardHeader>
            <form onSubmit={handleSalvarMeta} style={{ display: 'grid', gap: '16px' }}>
              <Input label="Descrição" name="descricao" value={novaMeta.descricao} onChange={handleMetaFormChange} required />
              <Input label="Valor Alvo (R$)" name="valorAlvo" type="number" step="0.01" value={novaMeta.valorAlvo} onChange={handleMetaFormChange} required />
              <Input label="Data de Início" name="dataInicio" type="date" value={novaMeta.dataInicio} onChange={handleMetaFormChange} required />
              <Input label="Data de Fim" name="dataFim" type="date" value={novaMeta.dataFim} onChange={handleMetaFormChange} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setIsMetaModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Meta</Button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {isTransacaoModalOpen && (
        <ModalOverlay onClick={() => setIsTransacaoModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CardHeader><h3>Novo Lançamento Financeiro</h3></CardHeader>
            <form onSubmit={handleSalvarTransacao} style={{ display: 'grid', gap: '16px' }}>
              <Input label="Descrição" name="descricao" value={novaTransacao.descricao} onChange={handleTransacaoFormChange} required />
              <Input label="Valor (R$)" name="valor" type="number" step="0.01" value={novaTransacao.valor} onChange={handleTransacaoFormChange} required />
              <div>
                <label>Tipo de Transação</label>
                <select name="tipo" value={novaTransacao.tipo} onChange={handleTransacaoFormChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setIsTransacaoModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Lançamento</Button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </FinanceiroContainer>
  );
}