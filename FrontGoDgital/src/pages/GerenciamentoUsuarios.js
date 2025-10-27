import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
import { useAuth } from "../context/AuthContext"
import api from "../services/api";

const UsuariosContainer = styled.div`
  display: flex; 
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`

const UsuariosTable = styled.table`
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
  
  .perfil {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    
    &.administrador {
      background-color: #d4edda;
      color: #155724;
    }
    
    &.gerente {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    &.operador {
      background-color: #fff3cd;
      color: #856404;
    }
  }
  
  .status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    
    &.ativo {
      background-color: #d4edda;
      color: #155724;
    }
    
    &.inativo {
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
    
    &.edit {
      background-color: ${(props) => props.theme.colors.primary};
      color: white;
    }
    
    &.toggle {
      background-color: ${(props) => props.theme.colors.secondary};
      color: white;
    }
    
    &.delete {
      background-color: ${(props) => props.theme.colors.danger};
      color: white;
    }
  }
`

const Form = styled.form`
  display: grid;
  gap: 16px;
`

const PermissoesGrid = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 14px;
  }
  
  .permissoes-list {
    display: grid;
    gap: 8px;
    
    .permissao-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 6px;
      
      input[type="checkbox"] {
        margin: 0;
      }
      
      .permissao-info {
        .permissao-nome {
          font-weight: 500;
          color: ${(props) => props.theme.colors.textPrimary};
        }
        
        .permissao-desc {
          font-size: 12px;
          color: ${(props) => props.theme.colors.secondary};
        }
      }
    }
  }
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

const permissoesDisponiveis = [
  { id: "vendas", nome: "Vendas", descricao: "Registrar e gerenciar vendas" },
  { id: "produtos", nome: "Produtos", descricao: "Cadastrar e editar produtos" },
  { id: "clientes", nome: "Clientes", descricao: "Gerenciar clientes e fidelidade" },
  { id: "estoque", nome: "Estoque", descricao: "Controlar estoque e ajustes" },
  { id: "relatorios", nome: "Relatórios", descricao: "Visualizar relatórios e analytics" },
  { id: "usuarios", nome: "Usuários", descricao: "Gerenciar usuários e permissões" },
  { id: "backup", nome: "Backup", descricao: "Criar e restaurar backups" },
  { id: "configuracoes", nome: "Configurações", descricao: "Alterar configurações do sistema" },
  { id: "seguranca", nome: "Monitor de Segurança", descricao: "Acessar o monitor de segurança e alertas" },
  { id: "auditoria", nome: "Dashboard de Auditoria", descricao: "Acessar dashboard de auditoria LGPD e conformidade" },
]

const perfisPreDefinidos = {
  administrador: ["vendas", "produtos", "clientes", "estoque", "relatorios", "usuarios", "backup", "configuracoes", "seguranca", "auditoria"],
  gerente: ["vendas", "produtos", "clientes", "estoque", "relatorios", "backup", "auditoria"],
  operador: ["vendas", "clientes"],
}

export const GerenciamentoUsuarios = () => {
  const { user, updateUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "operador",
    permissoes: ["vendas"],
    ativo: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      const usuariosMapeados = response.data.map(user => ({
        ...user,
        id: user.id,
        perfil: user.role.toLowerCase(),
        permissoes: user.permissoes || perfisPreDefinidos[user.role.toLowerCase()] || [],
        ativo: true
      }));
      setUsuarios(usuariosMapeados);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
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

    if (name === "perfil") {
      setFormData((prev) => ({
        ...prev,
        permissoes: perfisPreDefinidos[value] || [],
      }))
    }

    setSuccess(false)
  }

  const handlePermissaoChange = (permissaoId, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissoes: checked ? [...prev.permissoes, permissaoId] : prev.permissoes.filter((p) => p !== permissaoId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.email.trim()) {
      alert("Nome e email são obrigatórios")
      return
    }

    if (!editingId && !formData.senha.trim()) {
      alert("Senha é obrigatória para novos usuários")
      return
    }

    setFormLoading(true)

    try {
      const usuarioParaEnviar = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role: formData.perfil.toUpperCase(),
        permissoes: formData.permissoes,
      };

      if (editingId) {
        await api.put(`/usuarios/${editingId}`, usuarioParaEnviar);
        
        // Se o usuário editou suas próprias permissões, atualizar o contexto
        if (user && user.id === editingId) {
          const updatedUser = {
            ...user,
            permissoes: formData.permissoes,
            role: formData.perfil.toUpperCase(),
            perfil: formData.perfil
          };
          updateUser(updatedUser);
        }
      } else {
        await api.post('/usuarios', usuarioParaEnviar);
      }
      setSuccess(true);
      resetForm();
      loadUsuarios();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const editUsuario = (usuario) => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      perfil: usuario.perfil,
      permissoes: usuario.permissoes || [],
      ativo: usuario.ativo,
    })
    setEditingId(usuario.id)
  }

  const toggleUsuario = async (id, ativo) => {
    try {
      await api.put(`/usuarios/${id}/toggle-status`);
      setUsuarios((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ativo: !ativo } : user))
      );
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error);
      alert("Não foi possível alterar o status do usuário.");
    }
  };

  const deleteUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      await api.delete(`/usuarios/${id}`);
      loadUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      perfil: "operador",
      permissoes: ["vendas"],
      ativo: true,
    })
    setEditingId(null)
  }

  if (loading) {
    return <div>Carregando usuários...</div>
  }

  let buttonLabel;
  if (formLoading) {
    buttonLabel = <Spinner />;
  } else if (editingId) {
    buttonLabel = "Atualizar";
  } else {
    buttonLabel = "Criar Usuário";
  }

  return (
    <UsuariosContainer>
      <Card>
        <CardHeader>
          <h2>Gerenciamento de Usuários</h2>
        </CardHeader>

        <UsuariosTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`perfil ${usuario.perfil || 'indefinido'}`}>
                    {usuario.perfil ? usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1) : 'Indefinido'}
                  </span>
                </td>
                <td>
                  <span className={`status ${usuario.ativo ? "ativo" : "inativo"}`}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {usuario.ultimoAcesso
                    ? new Date(usuario.ultimoAcesso).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                    : "Nunca"}
                </td>
                <td>
                  <div className="actions">
                    <button className="action-btn edit" onClick={() => editUsuario(usuario)}>
                      Editar
                    </button>
                    <button className="action-btn toggle" style={{ backgroundColor: '#5a6268' }} onClick={() => toggleUsuario(usuario.id, usuario.ativo)}>
                      {usuario.ativo ? "Desativar" : "Ativar"}
                    </button>
                    {usuario.perfil !== "administrador" && (
                      <button className="action-btn delete" onClick={() => deleteUsuario(usuario.id)}>
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </UsuariosTable>
      </Card>

      <Card>
        <CardHeader style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h3>{editingId ? "Editar Usuário" : "Novo Usuário"}</h3>
        </CardHeader>

        {success && <SuccessMessage>Usuário salvo com sucesso!</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <Input
            label="Nome Completo"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Nome do usuário"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@exemplo.com"
          />

          <Input
            label={editingId ? "Nova Senha (deixe vazio para manter)" : "Senha"}
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required={!editingId}
            placeholder="Digite a senha"
          />

          <div>
            <label htmlFor="perfil-select" style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>Perfil</label>
            <select
              id="perfil-select"
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            >
              <option value="operador">Operador</option>
              <option value="gerente">Gerente</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <PermissoesGrid>
            <label htmlFor={permissoesDisponiveis[0].id}>Permissões</label>
            <div className="permissoes-list">
              {permissoesDisponiveis.map((permissao) => (
                <div key={permissao.id} className="permissao-item">
                  <input aria-label="Input field"
                    type="checkbox"
                    id={permissao.id}
                    checked={formData.permissoes.includes(permissao.id)}
                    onChange={(e) => handlePermissaoChange(permissao.id, e.target.checked)}
                  />
                  <div className="permissao-info">
                    <div className="permissao-nome">{permissao.nome}</div>
                    <div className="permissao-desc">{permissao.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
          </PermissoesGrid>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input aria-label="Input field" type="checkbox" id="ativo" name="ativo" checked={formData.ativo} onChange={handleChange} />
            <label htmlFor="ativo" style={{ margin: 0, cursor: "pointer" }}>
              Ativo
            </label>
          </div>

          <ButtonGroup>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="success" disabled={formLoading}>
              {buttonLabel}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </UsuariosContainer>
  )
}
