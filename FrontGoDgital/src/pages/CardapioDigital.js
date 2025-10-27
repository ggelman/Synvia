import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import api from '../services/api';

// API Service específica para cardápio público
const cardapioAPI = {
  buscarProdutos: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/public/cardapio');
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      const data = await response.json();
      return data.success ? data.produtos : [];
    } catch (error) {
      console.error('Erro na API:', error);
      return [];
    }
  },
  
  buscarCategorias: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/public/cardapio/categorias');
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      const data = await response.json();
      return data.success ? data.categorias : [];
    } catch (error) {
      console.error('Erro na API:', error);
      return [];
    }
  },
  
  buscarProdutosPorCategoria: async (categoria) => {
    try {
      const response = await fetch(`http://localhost:8080/api/public/cardapio/categorias/${categoria}`);
      if (!response.ok) throw new Error('Erro ao buscar produtos da categoria');
      const data = await response.json();
      return data.success ? data.produtos : [];
    } catch (error) {
      console.error('Erro na API:', error);
      return [];
    }
  },

  buscarProdutosDestaque: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/public/cardapio/destaque');
      if (!response.ok) throw new Error('Erro ao buscar produtos em destaque');
      const data = await response.json();
      return data.success ? data.produtos : [];
    } catch (error) {
      console.error('Erro na API:', error);
      return [];
    }
  },

  buscarProdutos: async (termo = '', categoria = '') => {
    try {
      let url = 'http://localhost:8080/api/public/cardapio/produtos?';
      if (categoria) url += `categoria=${encodeURIComponent(categoria)}&`;
      if (termo) url += `busca=${encodeURIComponent(termo)}&`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      const data = await response.json();
      return data.success ? data.produtos : [];
    } catch (error) {
      console.error('Erro na API:', error);
      return [];
    }
  }
};

const CardapioContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const Header = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  
  h1 {
    color: #8B4513;
    font-size: 2.2rem;
    margin: 0 0 10px 0;
  }
  
  .welcome-msg {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .mesa-info {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    display: inline-block;
    font-weight: 500;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding: 10px 0;
  
  button {
    background: ${props => props.active ? '#8B4513' : 'white'};
    color: ${props => props.active ? 'white' : '#8B4513'};
    border: 2px solid #8B4513;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #8B4513;
      color: white;
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ProductCard = styled(Card)`
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.div`
  height: 180px;
  background: ${props => props.image 
    ? `url(${props.image}) center/cover` 
    : 'linear-gradient(45deg, #f8f9fa, #e9ecef)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  
  .price-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #28a745;
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
  }
  
  .categoria-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(139, 69, 19, 0.9);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

const ProductInfo = styled.div`
  padding: 20px;
  
  h3 {
    color: #333;
    font-size: 1.3rem;
    margin: 0 0 10px 0;
    font-weight: 600;
  }
  
  p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 15px 0;
  }
  
  .product-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
    font-size: 0.9rem;
    color: #666;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  
  button {
    background: #8B4513;
    color: white;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #654321;
      transform: scale(1.1);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  span {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    min-width: 30px;
    text-align: center;
  }
`;

const CartSummary = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1000;
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      color: #333;
    }
    
    .total {
      font-size: 1.3rem;
      font-weight: bold;
      color: #28a745;
    }
  }
  
  .cart-items {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 15px;
  }
  
  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const FloatingCartButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #8B4513;
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(139, 69, 19, 0.4);
  transition: all 0.3s ease;
  z-index: 999;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 35px rgba(139, 69, 19, 0.6);
  }
  
  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
`;

// Produtos mockados para demonstração
const PRODUTOS_MOCK = [
  {
    id: 1,
    nome: 'Pão Francês',
    descricao: 'Pão francês fresquinho, assado na hora',
    preco: 0.80,
    categoria: 'Pães',
    emoji: '🥖',
    disponivel: true,
    tempoPrep: '5 min'
  },
  {
    id: 2,
    nome: 'Croissant',
    descricao: 'Croissant folhado artesanal com manteiga',
    preco: 8.50,
    categoria: 'Pães',
    emoji: '🥐',
    disponivel: true,
    tempoPrep: '2 min'
  },
  {
    id: 3,
    nome: 'Bolo de Chocolate',
    descricao: 'Fatia generosa de bolo de chocolate com cobertura',
    preco: 12.00,
    categoria: 'Doces',
    emoji: '🍰',
    disponivel: true,
    tempoPrep: '3 min'
  },
  {
    id: 4,
    nome: 'Brigadeiro Gourmet',
    descricao: 'Brigadeiro artesanal com diversos sabores',
    preco: 4.50,
    categoria: 'Doces',
    emoji: '🍫',
    disponivel: true,
    tempoPrep: '1 min'
  },
  {
    id: 5,
    nome: 'Café Expresso',
    descricao: 'Café expresso forte e aromático',
    preco: 3.50,
    categoria: 'Bebidas',
    emoji: '☕',
    disponivel: true,
    tempoPrep: '2 min'
  },
  {
    id: 6,
    nome: 'Cappuccino',
    descricao: 'Cappuccino cremoso com espuma perfeita',
    preco: 6.00,
    categoria: 'Bebidas',
    emoji: '☕',
    disponivel: true,
    tempoPrep: '3 min'
  },
  {
    id: 7,
    nome: 'Suco Natural',
    descricao: 'Suco natural de frutas da época',
    preco: 8.00,
    categoria: 'Bebidas',
    emoji: '🧃',
    disponivel: true,
    tempoPrep: '2 min'
  },
  {
    id: 8,
    nome: 'Torta de Morango',
    descricao: 'Fatia de torta de morango com chantilly',
    preco: 15.00,
    categoria: 'Doces',
    emoji: '🍓',
    disponivel: true,
    tempoPrep: '2 min'
  }
];

// Fallback caso a API não esteja disponível

export const CardapioDigital = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clienteId, nomeCliente } = location.state || {};
  
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState({});
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clienteId) {
      navigate('/cliente/cadastro');
      return;
    }
    carregarDados();
  }, [clienteId, navigate]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar categorias e produtos em paralelo
      const [categoriasData, produtosData] = await Promise.all([
        cardapioAPI.buscarCategorias(),
        cardapioAPI.buscarProdutos()
      ]);
      
      setCategorias(['Todos', ...categoriasData]);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Fallback para dados mockados em caso de erro
      setCategorias(['Todos', 'Pães', 'Doces', 'Bebidas']);
      setProdutos(PRODUTOS_MOCK);
    } finally {
      setLoading(false);
    }
  };

  const filtrarProdutosPorCategoria = async (categoria) => {
    setCategoriaAtiva(categoria);
    
    if (categoria === 'Todos') {
      carregarDados();
      return;
    }

    setLoading(true);
    try {
      const produtosData = await cardapioAPI.buscarProdutosPorCategoria(categoria);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao filtrar produtos:', error);
      // Filtrar localmente em caso de erro na API
      const produtosFiltrados = produtos.filter(p => p.categoria === categoria);
      setProdutos(produtosFiltrados);
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = produtos;

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => ({
      ...prev,
      [produto.id]: {
        ...produto,
        quantidade: (prev[produto.id]?.quantidade || 0) + 1
      }
    }));
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(prev => {
      const novoCarrinho = { ...prev };
      if (novoCarrinho[produtoId]) {
        if (novoCarrinho[produtoId].quantidade > 1) {
          novoCarrinho[produtoId].quantidade -= 1;
        } else {
          delete novoCarrinho[produtoId];
        }
      }
      return novoCarrinho;
    });
  };

  const obterQuantidadeNoCarrinho = (produtoId) => {
    return carrinho[produtoId]?.quantidade || 0;
  };

  const calcularTotal = () => {
    return Object.values(carrinho).reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  };

  const obterTotalItens = () => {
    return Object.values(carrinho).reduce((total, item) => {
      return total + item.quantidade;
    }, 0);
  };

  const finalizarPedido = () => {
    const pedido = {
      clienteId,
      itens: Object.values(carrinho),
      total: calcularTotal(),
      dataHora: new Date().toISOString()
    };
    
    navigate('/cliente/pagamento', { 
      state: { pedido, nomeCliente }
    });
  };

  return (
    <CardapioContainer>
      <Header>
        <h1>🥖 Experience Digital</h1>
        <div className="welcome-msg">
          Olá, <strong>{nomeCliente}</strong>! Escolha seus produtos favoritos
        </div>
        <div className="mesa-info">
          📍 Mesa 05 - Synvia Experience
        </div>
      </Header>

      <CategoryFilter>
        {categorias.map(categoria => (
          <button
            key={categoria}
            active={categoriaAtiva === categoria}
            onClick={() => filtrarProdutosPorCategoria(categoria)}
          >
            {categoria}
          </button>
        ))}
      </CategoryFilter>

      <ProductGrid>
        {produtosFiltrados.map(produto => (
          <ProductCard key={produto.id}>
            <ProductImage>
              <div style={{ fontSize: '4rem' }}>{produto.emoji}</div>
              <div className="price-badge">
                R$ {produto.preco.toFixed(2)}
              </div>
              <div className="categoria-badge">
                {produto.categoria}
              </div>
            </ProductImage>
            
            <ProductInfo>
              <h3>{produto.nome}</h3>
              <p>{produto.descricao}</p>
              
              <div className="product-details">
                <span>⏱️ {produto.tempoPrep}</span>
                <span>{produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}</span>
              </div>

              <QuantityControl>
                <button
                  onClick={() => removerDoCarrinho(produto.id)}
                  disabled={obterQuantidadeNoCarrinho(produto.id) === 0}
                >
                  -
                </button>
                <span>{obterQuantidadeNoCarrinho(produto.id)}</span>
                <button
                  onClick={() => adicionarAoCarrinho(produto)}
                  disabled={!produto.disponivel}
                >
                  +
                </button>
              </QuantityControl>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>

      {/* Botão flutuante do carrinho */}
      {obterTotalItens() > 0 && (
        <FloatingCartButton onClick={() => setShowCartSummary(!showCartSummary)}>
          🛒
          <div className="badge">{obterTotalItens()}</div>
        </FloatingCartButton>
      )}

      {/* Resumo do carrinho */}
      <CartSummary show={showCartSummary && obterTotalItens() > 0}>
        <div className="cart-header">
          <h3>🛒 Seu Pedido</h3>
          <div className="total">R$ {calcularTotal().toFixed(2)}</div>
        </div>
        
        <div className="cart-items">
          {Object.values(carrinho).map(item => (
            <div key={item.id} className="cart-item">
              <div>
                <strong>{item.nome}</strong><br/>
                <small>Qtd: {item.quantidade} × R$ {item.preco.toFixed(2)}</small>
              </div>
              <div>R$ {(item.preco * item.quantidade).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            onClick={() => setShowCartSummary(false)}
            style={{ flex: 1 }}
          >
            Continuar Comprando
          </Button>
          <Button
            onClick={finalizarPedido}
            style={{ flex: 1 }}
          >
            Finalizar Pedido
          </Button>
        </div>
      </CartSummary>
    </CardapioContainer>
  );
};