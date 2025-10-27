import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
import { EmptyTable } from "../components/EmptyTable"
import { EmptyState } from "../components/EmptyState"
import api from "../services/api";

const CategoriasContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`

const CategoriasTable = styled.table`
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
  
  .categoria-cor {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    border: 2px solid #ddd;
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

const ColorPicker = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 14px;
  }
  
  .color-options {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    
    .color-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      
      &.selected {
        border-color: ${(props) => props.theme.colors.primary};
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      &:hover {
        border-color: ${(props) => props.theme.colors.secondary};
        transform: scale(1.05);
      }
      
      &.selected::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
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

const ProdutosPorCategoria = styled.div`
  margin-top: 20px;
  
  .categoria-section {
    margin-bottom: 20px;
    
    .categoria-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid ${(props) => props.theme.colors.border};
      
      .categoria-nome {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
        margin-left: 8px;
      }
      
      .produto-count {
        margin-left: auto;
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
    
    .produtos-list {
      display: grid;
      gap: 8px;
      
      .produto-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: #f8f9fa;
        border-radius: 6px;
        
        .produto-info {
          .produto-nome {
            font-weight: 500;
            color: ${(props) => props.theme.colors.textPrimary};
          }
          
          .produto-preco {
            font-size: 12px;
            color: ${(props) => props.theme.colors.secondary};
          }
        }

        .produto-actions { 
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .change-categoria {
          font-size: 12px;
          padding: 6px 10px;
          background-color: white;
          color: ${(props) => props.theme.colors.textPrimary};
          border: 1px solid ${(props) => props.theme.colors.border};
          border-radius: 4px;
          cursor: pointer;
          min-width: 120px;
          
          &:hover {
            background-color: #f8f9fa;
            border-color: ${(props) => props.theme.colors.primary};
          }
          
          &:focus {
            outline: none;
            border-color: ${(props) => props.theme.colors.primary};
            box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.2);
          }
          
          option {
            background-color: white;
            color: ${(props) => props.theme.colors.textPrimary};
            padding: 8px;
            
            &:hover {
              background-color: #f8f9fa;
            }
          }
        }
      }
    }
  }
`

const cores = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
]

export const CategoriasProdutos = () => {
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cor: cores[0],
  })
  const [editingId, setEditingId] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriasResponse, produtosResponse] = await Promise.all([
        api.get('/categorias'),
        api.get('/produtos'),
      ]);
      setCategorias(categoriasResponse.data);
      setProdutos(produtosResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("Nome da categoria é obrigatório");
      return;
    }
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/categorias/${editingId}`, formData);
      } else {
        await api.post('/categorias', formData);
      }
      setSuccess(true);
      resetForm();
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar categoria. Verifique se o nome já existe.");
    } finally {
      setFormLoading(false);
    }
  };

  const editCategoria = (categoria) => {
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
      cor: categoria.cor,
    });
    setEditingId(categoria.id);
    setSuccess(false);
  };

  const deleteCategoria = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria? Os produtos associados ficarão sem categoria.")) return;
    try {
      await api.delete(`/categorias/${id}`);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria.");
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", descricao: "", cor: cores[0] });
    setEditingId(null);
  };

  const changeProdutoCategoria = async (produtoId, categoriaId) => {
    const novaCategoriaId = categoriaId ? parseInt(categoriaId, 10) : null;
    const payload = { id: novaCategoriaId };

    try {
      const response = await api.put(`/produtos/${produtoId}/categoria`, payload);
      const produtoAtualizado = response.data; // O backend retorna o produto atualizado

      setProdutos(produtosAtuais =>
        produtosAtuais.map(p =>
          p.idProduto === produtoId ? produtoAtualizado : p
        )
      );
    } catch (error) {
      console.error("Erro ao alterar categoria do produto:", error);
      alert("Erro ao alterar categoria do produto.");
    }
  };

  const getProdutosPorCategoria = () => {
    const produtosPorCategoria = {}

    categorias.forEach((categoria) => {
      produtosPorCategoria[categoria.id] = {
        categoria,
        produtos: [],
      }
    })

    produtosPorCategoria["sem-categoria"] = {
      categoria: { id: null, nome: "Sem Categoria", cor: "#999999" },
      produtos: [],
    }

    produtos.forEach((produto) => {
      const categoriaId = produto.categoria?.id || produto.categoriaId || "sem-categoria";
        if (produtosPorCategoria[categoriaId]) {
            produtosPorCategoria[categoriaId].produtos.push(produto);
        }
    })

    return produtosPorCategoria
  }

  const deleteProduto = async (produtoId) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await api.delete(`/produtos/${produtoId}`);
      setProdutos((prevProdutos) => prevProdutos.filter((p) => p.idProduto !== produtoId));
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Não foi possível excluir o produto. Verifique se ele não está associado a uma venda existente.");
    }
  };
  // ==

  if (loading) {
    return <div>Carregando categorias...</div>
  }

  const produtosPorCategoria = getProdutosPorCategoria()

  let buttonLabel
  if (formLoading) {
    buttonLabel = <Spinner />
  } else if (editingId) {
    buttonLabel = "Atualizar"
  } else {
    buttonLabel = "Criar Categoria"
  }

  return (
    <CategoriasContainer>
      <Card>
        <CardHeader>
          <h2>Categorias de Produtos</h2>
        </CardHeader>

        <CategoriasTable>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Produtos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <EmptyTable
                colSpan={4}
                icon="🏷️"
                title="Nenhuma categoria cadastrada"
                description="Comece criando sua primeira categoria de produtos usando o formulário ao lado."
              />
            ) : (
              categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>
                    <span className="categoria-cor" style={{ backgroundColor: categoria.cor }}></span>
                    {categoria.nome}
                  </td>
                  <td>{categoria.descricao || "-"}</td>
                  <td>{categoria.produtoCount}</td>
                  <td>
                    <div className="actions">
                      <button className="action-btn edit" onClick={() => editCategoria(categoria)}>
                        Editar
                      </button>
                      <button className="action-btn delete" onClick={() => deleteCategoria(categoria.id)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </CategoriasTable>

        <ProdutosPorCategoria>
          <h3>Produtos por Categoria</h3>
          {Object.values(produtosPorCategoria).length === 0 || produtos.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Nenhum produto cadastrado"
              description="Cadastre produtos para organizá-los por categorias e facilitar o gerenciamento do seu estoque."
            />
          ) : (
            Object.values(produtosPorCategoria).map(({ categoria, produtos: produtosCategoria }) => (
              <div key={categoria.id || "sem-categoria"} className="categoria-section">
                <div className="categoria-header">
                  <span className="categoria-cor" style={{ backgroundColor: categoria.cor }}></span>
                  <span className="categoria-nome">{categoria.nome}</span>
                  <span className="produto-count">{produtosCategoria.length} produtos</span>
                </div>
                <div className="produtos-list">
                  {produtosCategoria.length === 0 ? (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#6c757d",
                      fontStyle: "italic"
                    }}>
                      Nenhum produto nesta categoria
                    </div>
                  ) : (
                    produtosCategoria.map((produto) => (
                      <div key={produto.idProduto} className="produto-item">
                        <div className="produto-info">
                          <div className="produto-nome">{produto.nome}</div>
                          <div className="produto-preco">R$ {produto.preco.toFixed(2)}</div>
                        </div>
                        <div className="produto-actions">
                          <select
                            className="change-categoria"
                            value={produto.categoria?.id || ""}
                            onChange={(e) => changeProdutoCategoria(produto.idProduto, e.target.value)}
                          >
                            <option value={produto.categoria?.id || ""} disabled hidden>
                              {produto.categoria ? produto.categoria.nome : "Sem Categoria"}
                            </option>

                            <option value="">-- Sem Categoria --</option>

                            {categorias.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nome}
                              </option>
                            ))}
                          </select>

                          <button
                            className="action-btn delete"
                            onClick={() => deleteProduto(produto.idProduto)}
                            title="Excluir Produto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </ProdutosPorCategoria>
      </Card>

      <Card>
        <CardHeader>
          <h3>{editingId ? "Editar Categoria" : "Nova Categoria"}</h3>
        </CardHeader>

        {success && <SuccessMessage>Categoria salva com sucesso!</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <Input
            label="Nome da Categoria"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Ex: Pães, Doces, Bebidas"
          />

          <Input
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição opcional da categoria"
          />

          <ColorPicker>
            <label htmlFor="cor-categoria">Cor da Categoria</label>
            <div className="color-options" id="cor-categoria">
              {cores.map((cor) => (
                <label key={cor} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <input aria-label="Input field"
                    type="radio"
                    name="cor"
                    value={cor}
                    checked={formData.cor === cor}
                    onChange={() => setFormData((prev) => ({ ...prev, cor }))}
                    style={{ display: "none" }}
                  />
                  <span
                    className={`color-option ${formData.cor === cor ? "selected" : ""}`}
                    style={{ backgroundColor: cor, cursor: "pointer" }}
                    aria-label={`Selecionar cor ${cor}`}
                  />
                </label>
              ))}
            </div>
          </ColorPicker>

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
    </CategoriasContainer>
  )
}