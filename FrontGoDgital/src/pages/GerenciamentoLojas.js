import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
import api from "../services/api";

const LojasContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`

const LojasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`

const LojaCard = styled(Card)`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.active {
    border: 2px solid ${(props) => props.theme.colors.primary};
  }
  
  .loja-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .loja-info {
      flex: 1;
      
      .loja-nome {
        font-size: 18px;
        font-weight: 700;
        color: ${(props) => props.theme.colors.textPrimary};
        margin-bottom: 4px;
      }
      
      .loja-endereco {
        font-size: 14px;
        color: ${(props) => props.theme.colors.secondary};
        margin-bottom: 8px;
      }
      
      .loja-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        
        &.ativa {
          background-color: #d4edda;
          color: #155724;
        }
        
        &.inativa {
          background-color: #f8d7da;
          color: #721c24;
        }
      }
    }
    
    .loja-actions {
      display: flex;
      gap: 8px;
      
      .action-btn {
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        
        &.edit {
          background-color: ${(props) => props.theme.colors.primary};
          color: white;
        }
        
        &.delete {
          background-color: ${(props) => props.theme.colors.danger};
          color: white;
        }
      }
    }
  }
  
  .loja-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 16px;
        font-weight: 700;
        color: ${(props) => props.theme.colors.primary};
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
  }
`

const Form = styled.form`
  display: grid;
  gap: 16px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`

const LojaSelector = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  
  .selector-card {
    background-color: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    
    .selector-label {
      font-size: 12px;
      color: ${(props) => props.theme.colors.secondary};
      margin-bottom: 8px;
    }
    
    .selector-dropdown {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid ${(props) => props.theme.colors.border};
      border-radius: 6px;
      font-size: 14px;
      background-color: white;
    }
  }
`

export const GerenciamentoLojas = () => {
  const [lojas, setLojas] = useState([])
  const [lojaAtiva, setLojaAtiva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    cnpj: "",
    responsavel: "",
    ativa: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadLojas()
  }, [])

  const loadLojas = async () => {
    try {
      const response = await api.get('/lojas');
      const data = response.data;
      setLojas(data);

      const ativa = data.find((loja) => loja.ativa) || data[0]
      if (ativa) {
        setLojaAtiva(ativa.id)
        localStorage.setItem("lojaAtiva", ativa.id.toString())
      }
    } catch (error) {
      console.error("Erro ao carregar lojas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.endereco.trim()) {
      alert("Nome e endereço são obrigatórios")
      return
    }

    setFormLoading(true)

    try {
      if (editingId) {
        await api.put(`/lojas/${editingId}`, formData);
      } else {
        await api.post('/lojas', formData);
      }
      setSuccess(true);
      resetForm();
      loadLojas();
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      alert("Erro ao salvar loja.");
    } finally {
        setFormLoading(false);
    }
  }

  const editLoja = (loja) => {
    setFormData({
      nome: loja.nome,
      endereco: loja.endereco,
      telefone: loja.telefone || "",
      email: loja.email || "",
      cnpj: loja.cnpj || "",
      responsavel: loja.responsavel || "",
      ativa: loja.ativa,
    })
    setEditingId(loja.id)
  }

  const deleteLoja = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta loja?")) return

    try {
      await api.delete(`/lojas/${id}`);
      loadLojas();
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      alert("Erro ao excluir loja.");
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      email: "",
      cnpj: "",
      responsavel: "",
      ativa: true,
    })
    setEditingId(null)
  }

  const switchLoja = (lojaId) => {
    setLojaAtiva(lojaId)
    localStorage.setItem("lojaAtiva", lojaId.toString())
    // Reload page data for new store
    window.location.reload()
  }

  if (loading) {
    return <div>Carregando lojas...</div>
  }

  return (
    <>
      <LojaSelector>
        <div className="selector-card">
          <div className="selector-label">Loja Ativa:</div>
          <select
            className="selector-dropdown"
            value={lojaAtiva || ""}
            onChange={(e) => switchLoja(Number(e.target.value))}
          >
            {lojas
              .filter((loja) => loja.ativa)
              .map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
          </select>
        </div>
      </LojaSelector>

      <LojasContainer>
        <div>
          <CardHeader>
            <h2>Gerenciamento de Lojas</h2>
          </CardHeader>

          <LojasGrid>
            {lojas.map((loja) => (
              <LojaCard
                key={loja.id}
                className={loja.id === lojaAtiva ? "active" : ""}
                onClick={() => switchLoja(loja.id)}
              >
                <div className="loja-header">
                  <div className="loja-info">
                    <div className="loja-nome">{loja.nome}</div>
                    <div className="loja-endereco">{loja.endereco}</div>
                    <span className={`loja-status ${loja.ativa ? "ativa" : "inativa"}`}>
                      {loja.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <div className="loja-actions">
                    <button
                      className="action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        editLoja(loja)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteLoja(loja.id)
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="loja-stats">
                  <div className="stat-item">
                    <div className="stat-value">{loja.vendas || 0}</div>
                    <div className="stat-label">Vendas Hoje</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">R$ {(loja.faturamento || 0).toFixed(2)}</div>
                    <div className="stat-label">Faturamento</div>
                  </div>
                </div>
              </LojaCard>
            ))}
          </LojasGrid>
        </div>

        <Card>
          <CardHeader>
            <h3>{editingId ? "Editar Loja" : "Nova Loja"}</h3>
          </CardHeader>

          {success && <SuccessMessage>Loja salva com sucesso!</SuccessMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              label="Nome da Loja"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder={Ex:  - Unidade Centro}
            />

            <Input
              label="Endereço Completo"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              required
              placeholder="Rua, número, bairro, cidade"
            />

            <Input
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 3456-7890"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="loja@synvia.io"
            />

            <Input
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="12.345.678/0001-90"
            />

            <Input
              label="Responsável"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              placeholder="Nome do gerente/responsável"
            />

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input aria-label="Input field" type="checkbox" id="ativa" name="ativa" checked={formData.ativa} onChange={handleChange} />
              <label htmlFor="ativa" style={{ margin: 0, cursor: "pointer" }}>
                Loja ativa
              </label>
            </div>

            <ButtonGroup>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" variant="success" disabled={formLoading}>
                {(() => {
                  if (formLoading) return <Spinner />;
                  if (editingId) return "Atualizar";
                  return "Criar Loja";
                })()}
              </Button>
            </ButtonGroup>
          </Form>
        </Card>
      </LojasContainer>
    </>
  )
}
