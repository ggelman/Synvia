import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import api from '../services/api';

const PagamentoContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PagamentoCard = styled(Card)`
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
`;

const Resumopedido = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  
  h3 {
    color: #333;
    margin: 0 0 15px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ItemPedido = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
    margin-top: 10px;
    padding-top: 15px;
    border-top: 2px solid #dee2e6;
    font-weight: bold;
    font-size: 1.1rem;
    color: #28a745;
  }
  
  .item-info {
    flex: 1;
    
    .nome {
      font-weight: 500;
      color: #333;
    }
    
    .detalhes {
      font-size: 0.9rem;
      color: #666;
      margin-top: 2px;
    }
  }
  
  .preco {
    font-weight: 500;
    color: #333;
  }
`;

const MetodosPagamento = styled.div`
  margin-bottom: 25px;
  
  h3 {
    color: #333;
    margin: 0 0 15px 0;
  }
`;

const MetodoCard = styled.div`
  border: 2px solid ${props => props.selected ? '#8B4513' : '#e9ecef'};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f8f5f0' : 'white'};
  
  &:hover {
    border-color: #8B4513;
    background: #f8f5f0;
  }
  
  .metodo-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    
    .icon {
      font-size: 1.5rem;
    }
    
    .nome {
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    
    .radio {
      width: 20px;
      height: 20px;
    }
  }
  
  .descricao {
    color: #666;
    font-size: 0.9rem;
    margin-left: 36px;
  }
`;

const DadosCartao = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 15px;
  display: ${props => props.show ? 'block' : 'none'};
  
  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
  }
`;

const QRCodePix = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-top: 15px;
  text-align: center;
  
  .qr-placeholder {
    width: 200px;
    height: 200px;
    background: white;
    border: 2px dashed #ccc;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .pix-info {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .codigo-pix {
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    font-family: monospace;
    font-size: 0.8rem;
    word-break: break-all;
    margin: 10px 0;
    cursor: pointer;
    
    &:hover {
      background: #f0f0f0;
    }
  }
`;

const StatusPagamento = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  .status-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: block;
  }
  
  h2 {
    color: ${props => props.success ? '#28a745' : '#dc3545'};
    margin: 0 0 15px 0;
  }
  
  p {
    color: #666;
    margin: 0 0 25px 0;
    line-height: 1.5;
  }
`;

const METODOS_PAGAMENTO = [
  {
    id: 'cartao',
    nome: 'Cartão de Crédito/Débito',
    icon: '💳',
    descricao: 'Pague com segurança usando seu cartão'
  },
  {
    id: 'pix',
    nome: 'PIX',
    icon: '📱',
    descricao: 'Pagamento instantâneo via PIX'
  },
  {
    id: 'dinheiro',
    nome: 'Dinheiro',
    icon: '💵',
    descricao: 'Pague na entrega do pedido'
  }
];

export const PagamentoCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pedido, nomeCliente } = location.state || {};
  
  const [metodoSelecionado, setMetodoSelecionado] = useState('');
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState(null);
  const [codigoPix, setCodigoPix] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');

  useEffect(() => {
    if (!pedido) {
      navigate('/cliente/cardapio');
      return;
    }
  }, [pedido, navigate]);

  const handleDadosCartaoChange = (e) => {
    const { name, value } = e.target;
    setDadosCartao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const gerarCodigoPix = () => {
    // Simular geração de código PIX
    const codigo = 'PIX' + Date.now() + Math.random().toString(36).substring(7);
    setCodigoPix(codigo);
  };

  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(codigoPix);
    alert('Código PIX copiado para a área de transferência!');
  };

  const validarDadosCartao = () => {
    const { numero, nome, validade, cvv } = dadosCartao;
    
    if (!numero || numero.length < 16) {
      alert('Número do cartão inválido');
      return false;
    }
    
    if (!nome.trim()) {
      alert('Nome do portador é obrigatório');
      return false;
    }
    
    if (!validade || validade.length !== 5) {
      alert('Data de validade inválida');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      alert('CVV inválido');
      return false;
    }
    
    return true;
  };

  const confirmarPagamentoAutomatico = async (vendaId) => {
    try {
      const pagamentoData = {
        vendaId: vendaId,
        metodoPagamento: metodoSelecionado.toUpperCase(),
        valorPago: pedido.total
      };

      const response = await fetch('http://localhost:8080/api/public/vendas/confirmar-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagamentoData)
      });

      if (!response.ok) {
        console.error('Erro ao confirmar pagamento automaticamente');
      }
    } catch (error) {
      console.error('Erro na confirmação automática de pagamento:', error);
    }
  };

  const processarPagamento = async () => {
    if (!metodoSelecionado) {
      alert('Selecione um método de pagamento');
      return;
    }
    
    if (metodoSelecionado === 'cartao' && !validarDadosCartao()) {
      return;
    }
    
    setProcessandoPagamento(true);
    
    try {
      // Preparar dados do pedido
      const itensPedido = pedido.itens.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      }));

      const pedidoRequest = {
        clienteId: pedido.clienteId,
        itens: itensPedido,
        formaPagamento: metodoSelecionado.toUpperCase(),
        mesaNumero: pedido.mesaNumero || null,
        observacoes: pedido.observacoes || null
      };

      // Processar venda no backend usando VendaPublicaController
      const response = await fetch('http://localhost:8080/api/public/vendas/processar-pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoRequest)
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pedido');
      }

      const resultado = await response.json();
      
      if (resultado.success) {
        // Usar o vendaId retornado pela API
        setNumeroPedido(resultado.vendaId.toString());
        
        // Se não for dinheiro, confirmar pagamento automaticamente
        if (metodoSelecionado !== 'dinheiro') {
          await confirmarPagamentoAutomatico(resultado.vendaId);
        }
        
        setStatusPagamento('success');
      } else {
        throw new Error(resultado.message || 'Erro ao processar pedido');
      }
      
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setStatusPagamento('error');
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const voltarParaCardapio = () => {
    navigate('/cliente/cardapio', {
      state: { clienteId: pedido.clienteId, nomeCliente }
    });
  };

  const acessarPortalCliente = () => {
    navigate('/cliente/portal', {
      state: { clienteId: pedido.clienteId, nomeCliente }
    });
  };

  if (statusPagamento) {
    return (
      <PagamentoContainer>
        <PagamentoCard>
          <div style={{ padding: '30px' }}>
            <StatusPagamento success={statusPagamento === 'success'}>
              <span className="status-icon">
                {statusPagamento === 'success' ? '🎉' : '❌'}
              </span>
              
              <h2>
                {statusPagamento === 'success' 
                  ? 'Pedido Realizado com Sucesso!' 
                  : 'Erro no Pagamento'
                }
              </h2>
              
              <p>
                {statusPagamento === 'success' ? (
                  <>
                    Obrigado, <strong>{nomeCliente}</strong>!<br/>
                    Seu pedido <strong>#{numeroPedido}</strong> foi registrado e está sendo preparado.<br/>
                    {metodoSelecionado === 'dinheiro' 
                      ? 'Tenha o valor em dinheiro pronto para o pagamento na entrega.'
                      : 'Pagamento confirmado com sucesso via ' + metodoSelecionado + '.'
                    }
                  </>
                ) : (
                  'Não foi possível processar seu pagamento. Tente novamente.'
                )}
              </p>
              
              {statusPagamento === 'sucesso' && (
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '25px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📋 Resumo do Pedido</h4>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Número:</strong> #{numeroPedido}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Método:</strong> {METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.nome}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Status:</strong> ⏳ Em preparação
                  </p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                {statusPagamento === 'sucesso' ? (
                  <>
                    <Button onClick={voltarParaCardapio} variant="secondary">
                      Fazer Novo Pedido
                    </Button>
                    <Button onClick={acessarPortalCliente}>
                      Acessar Minha Conta
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setStatusPagamento(null)}>
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </StatusPagamento>
          </div>
        </PagamentoCard>
      </PagamentoContainer>
    );
  }

  return (
    <PagamentoContainer>
      <PagamentoCard>
        <CardHeader>
          <h1 style={{ color: '#8B4513', textAlign: 'center', margin: 0 }}>
            💳 Finalizar Pagamento
          </h1>
          <p style={{ textAlign: 'center', color: '#666', margin: '10px 0 0 0' }}>
            Revise seu pedido e escolha a forma de pagamento
          </p>
        </CardHeader>

        <div style={{ padding: '0 30px 30px' }}>
          {/* Resumo do Pedido */}
          <ResumoChurch>
            <h3>📋 Resumo do Pedido</h3>
            {pedido.itens.map(item => (
              <ItemPedido key={item.id}>
                <div className="item-info">
                  <div className="nome">{item.nome}</div>
                  <div className="detalhes">
                    Qtd: {item.quantidade} × R$ {item.preco.toFixed(2)}
                  </div>
                </div>
                <div className="preco">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </div>
              </ItemPedido>
            ))}
            <ItemPedido>
              <div className="item-info">
                <div className="nome">TOTAL</div>
              </div>
              <div className="preco">R$ {pedido.total.toFixed(2)}</div>
            </ItemPedido>
          </ResumoChurch>

          {/* Métodos de Pagamento */}
          <MetodosPagamento>
            <h3>💳 Escolha o método de pagamento</h3>
            
            {METODOS_PAGAMENTO.map(metodo => (
              <MetodoCard
                key={metodo.id}
                selected={metodoSelecionado === metodo.id}
                onClick={() => {
                  setMetodoSelecionado(metodo.id);
                  if (metodo.id === 'pix') {
                    gerarCodigoPix();
                  }
                }}
              >
                <div className="metodo-header">
                  <span className="icon">{metodo.icon}</span>
                  <span className="nome">{metodo.nome}</span>
                  <input
                    type="radio"
                    className="radio"
                    checked={metodoSelecionado === metodo.id}
                    onChange={() => {}}
                  />
                </div>
                <div className="descricao">{metodo.descricao}</div>
              </MetodoCard>
            ))}
          </MetodosPagamento>

          {/* Dados do Cartão */}
          <DadosCartao show={metodoSelecionado === 'cartao'}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
              Dados do Cartão
            </h4>
            
            <Input
              label="Número do Cartão"
              name="numero"
              value={dadosCartao.numero}
              onChange={handleDadosCartaoChange}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
            />
            
            <Input
              label="Nome do Portador"
              name="nome"
              value={dadosCartao.nome}
              onChange={handleDadosCartaoChange}
              placeholder="Nome como está no cartão"
            />
            
            <div className="form-row">
              <Input
                label="Validade"
                name="validade"
                value={dadosCartao.validade}
                onChange={handleDadosCartaoChange}
                placeholder="MM/AA"
                maxLength="5"
              />
              <Input
                label="CVV"
                name="cvv"
                value={dadosCartao.cvv}
                onChange={handleDadosCartaoChange}
                placeholder="123"
                maxLength="4"
              />
            </div>
          </DadosCartao>

          {/* QR Code PIX */}
          <QRCodePix show={metodoSelecionado === 'pix'}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
              Pagamento via PIX
            </h4>
            
            <div className="qr-placeholder">📱</div>
            
            <div className="pix-info">
              <p>Escaneie o QR Code com seu banco ou copie o código abaixo:</p>
              
              <div className="codigo-pix" onClick={copiarCodigoPix}>
                {codigoPix}
              </div>
              
              <small>
                Clique no código para copiar<br/>
                O pagamento será confirmado automaticamente
              </small>
            </div>
          </QRCodePix>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Button
              variant="secondary"
              onClick={voltarParaCardapio}
              style={{ flex: 1 }}
            >
              Voltar ao Cardápio
            </Button>
            <Button
              onClick={processarPagamento}
              disabled={!metodoSelecionado || processandoPagamento}
              style={{ flex: 2 }}
            >
              {processandoPagamento ? (
                <>
                  <Spinner size="small" />
                  Processando...
                </>
              ) : (
                `Confirmar Pagamento - R$ ${pedido.total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </PagamentoCard>
    </PagamentoContainer>
  );
};