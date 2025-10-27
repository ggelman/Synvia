import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import api from '../services/api';

const PortalContainer = styled.div`
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
  
  .subtitle {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .lgpd-info {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    display: inline-block;
    font-weight: 500;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const MenuCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    border-color: #8B4513;
  }
  
  .icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 15px;
  }
  
  h3 {
    color: #333;
    margin: 0 0 10px 0;
    text-align: center;
  }
  
  p {
    color: #666;
    text-align: center;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  padding: 25px 30px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  
  h2 {
    margin: 0 0 10px 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p {
    margin: 0 0 20px 0;
    color: #666;
  }
`;

const ModalBody = styled.div`
  padding: 0 30px 30px;
`;

const ConsentimentosList = styled.div`
  .consentimento-item {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e9ecef;
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      h4 {
        margin: 0;
        color: #333;
        font-size: 1rem;
      }
      
      .status {
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        
        &.ativo {
          background: #d4edda;
          color: #155724;
        }
        
        &.inativo {
          background: #f8d7da;
          color: #721c24;
        }
      }
    }
    
    .descricao {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .metadata {
      font-size: 0.8rem;
      color: #999;
      display: flex;
      justify-content: space-between;
    }
  }
`;

const DadosTable = styled.div`
  .dado-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 500;
      color: #333;
      min-width: 150px;
    }
    
    .valor {
      color: #666;
      flex: 1;
      text-align: right;
    }
  }
`;

const StatusMessage = styled.div`
  background: ${props => 
    props.type === 'success' ? '#d4edda' : 
    props.type === 'error' ? '#f8d7da' : 
    '#d1ecf1'
  };
  color: ${props => 
    props.type === 'success' ? '#155724' : 
    props.type === 'error' ? '#721c24' : 
    '#0c5460'
  };
  border: 1px solid ${props => 
    props.type === 'success' ? '#c3e6cb' : 
    props.type === 'error' ? '#f5c6cb' : 
    '#bee5eb'
  };
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const MENUS_DIREITOS = [
  {
    id: 'consentimentos',
    icon: '🛡️',
    titulo: 'Gerenciar Consentimentos',
    descricao: 'Visualize e altere suas preferências de privacidade e uso de dados'
  },
  {
    id: 'dados',
    icon: '📋',
    titulo: 'Acessar Meus Dados',
    descricao: 'Veja todos os dados pessoais que temos sobre você'
  },
  {
    id: 'portabilidade',
    icon: '📤',
    titulo: 'Exportar Dados',
    descricao: 'Baixe uma cópia de todos os seus dados em formato JSON'
  },
  {
    id: 'correcao',
    icon: '✏️',
    titulo: 'Corrigir Dados',
    descricao: 'Solicite correção de informações incorretas ou desatualizadas'
  },
  {
    id: 'exclusao',
    icon: '🗑️',
    titulo: 'Excluir Dados',
    descricao: 'Solicite a remoção de seus dados pessoais de nossos sistemas'
  },
  {
    id: 'historico',
    icon: '📜',
    titulo: 'Histórico de Solicitações',
    descricao: 'Acompanhe o status de suas solicitações LGPD anteriores'
  }
];

export const PortalDireitosLGPD = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clienteId, nomeCliente } = location.state || {};
  
  const [modalAtivo, setModalAtivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dadosCliente, setDadosCliente] = useState(null);
  const [consentimentos, setConsentimentos] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!clienteId) {
      navigate('/cliente/cadastro');
      return;
    }
  }, [clienteId, navigate]);

  const abrirModal = async (tipo) => {
    setModalAtivo(tipo);
    setLoading(true);
    setStatus(null);
    
    try {
      if (tipo === 'consentimentos') {
        await carregarConsentimentos();
      } else if (tipo === 'dados') {
        await carregarDadosCliente();
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao carregar dados: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const carregarConsentimentos = async () => {
    const response = await api.get(`/api/lgpd/consentimentos/usuario/${clienteId}`);
    setConsentimentos(response.data);
  };

  const carregarDadosCliente = async () => {
    const response = await api.get(`/api/lgpd/dados-pessoais/${clienteId}`);
    setDadosCliente(response.data);
  };

  const alterarConsentimento = async (finalidade, novoStatus) => {
    setLoading(true);
    try {
      await api.post('/api/lgpd/consentimento', {
        usuarioId: clienteId,
        finalidade: finalidade,
        consentimento: novoStatus,
        detalhes: 'Alteração via portal de direitos'
      });
      
      setStatus({ type: 'success', message: 'Consentimento atualizado com sucesso!' });
      await carregarConsentimentos();
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao atualizar consentimento' });
    } finally {
      setLoading(false);
    }
  };

  const exportarDados = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/lgpd/dados-pessoais/${clienteId}`);
      
      // Criar arquivo para download
      const dados = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dados], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-dados-${clienteId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Dados exportados com sucesso!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao exportar dados' });
    } finally {
      setLoading(false);
    }
  };

  const solicitarExclusao = async () => {
    if (!window.confirm('Tem certeza que deseja solicitar a exclusão de todos os seus dados? Esta ação é irreversível.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/api/lgpd/solicitacao-exclusao', {
        usuarioId: clienteId,
        motivo: 'Solicitação via portal de direitos'
      });
      
      setStatus({ 
        type: 'success', 
        message: `Solicitação registrada com sucesso! Protocolo: ${response.data.protocolo}. Prazo de resposta: 15 dias úteis.` 
      });
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao processar solicitação' });
    } finally {
      setLoading(false);
    }
  };

  const renderModalConsentimentos = () => (
    <Modal>
      <ModalHeader>
        <h2>🛡️ Gerenciar Consentimentos</h2>
        <p>Controle como seus dados são utilizados</p>
      </ModalHeader>
      <ModalBody>
        {status && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner />
            <p>Carregando consentimentos...</p>
          </div>
        ) : (
          <ConsentimentosList>
            {consentimentos.map(consentimento => (
              <div key={consentimento.id} className="consentimento-item">
                <div className="header">
                  <h4>{consentimento.finalidade.replace('_', ' ')}</h4>
                  <span className={`status ${consentimento.consentimentoDado && !consentimento.revogado ? 'ativo' : 'inativo'}`}>
                    {consentimento.consentimentoDado && !consentimento.revogado ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="descricao">
                  {consentimento.detalhesConsentimento || 'Finalidade específica de tratamento de dados'}
                </div>
                <div className="metadata">
                  <span>Atualizado: {new Date(consentimento.dataConsentimento).toLocaleDateString()}</span>
                  {consentimento.finalidade !== 'SERVICO_ESSENCIAL' && (
                    <Button
                      size="small"
                      variant={consentimento.consentimentoDado && !consentimento.revogado ? 'secondary' : 'primary'}
                      onClick={() => alterarConsentimento(
                        consentimento.finalidade, 
                        !(consentimento.consentimentoDado && !consentimento.revogado)
                      )}
                      disabled={loading}
                    >
                      {consentimento.consentimentoDado && !consentimento.revogado ? 'Revogar' : 'Conceder'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </ConsentimentosList>
        )}
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <Button variant="secondary" onClick={() => setModalAtivo(null)} style={{ flex: 1 }}>
            Fechar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );

  const renderModalDados = () => (
    <Modal>
      <ModalHeader>
        <h2>📋 Meus Dados Pessoais</h2>
        <p>Informações que temos sobre você</p>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner />
            <p>Carregando dados...</p>
          </div>
        ) : dadosCliente && (
          <DadosTable>
            <div className="dado-row">
              <span className="label">Nome:</span>
              <span className="valor">{dadosCliente.dadosPessoais?.nome}</span>
            </div>
            <div className="dado-row">
              <span className="label">Email:</span>
              <span className="valor">{dadosCliente.dadosPessoais?.email}</span>
            </div>
            <div className="dado-row">
              <span className="label">Telefone:</span>
              <span className="valor">{dadosCliente.dadosPessoais?.telefone}</span>
            </div>
            <div className="dado-row">
              <span className="label">CPF:</span>
              <span className="valor">{dadosCliente.dadosPessoais?.cpf}</span>
            </div>
            <div className="dado-row">
              <span className="label">Data de Nascimento:</span>
              <span className="valor">
                {dadosCliente.dadosPessoais?.dataNascimento 
                  ? new Date(dadosCliente.dadosPessoais.dataNascimento).toLocaleDateString()
                  : 'Não informado'
                }
              </span>
            </div>
            <div className="dado-row">
              <span className="label">Endereço:</span>
              <span className="valor">{dadosCliente.dadosPessoais?.endereco || 'Não informado'}</span>
            </div>
            <div className="dado-row">
              <span className="label">Data de Cadastro:</span>
              <span className="valor">
                {new Date(dadosCliente.dadosPessoais?.dataCadastro).toLocaleDateString()}
              </span>
            </div>
            <div className="dado-row">
              <span className="label">Total de Consentimentos:</span>
              <span className="valor">{dadosCliente.consentimentos?.length || 0}</span>
            </div>
          </DadosTable>
        )}
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <Button variant="secondary" onClick={() => setModalAtivo(null)} style={{ flex: 1 }}>
            Fechar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );

  const renderModalGenerico = (titulo, icon, acao) => (
    <Modal>
      <ModalHeader>
        <h2>{icon} {titulo}</h2>
      </ModalHeader>
      <ModalBody>
        {status && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
        
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {loading ? (
            <>
              <Spinner />
              <p>Processando solicitação...</p>
            </>
          ) : (
            <>
              <p>Esta funcionalidade permite {acao}.</p>
              <p>Confirma que deseja prosseguir?</p>
            </>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <Button variant="secondary" onClick={() => setModalAtivo(null)} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={modalAtivo === 'portabilidade' ? exportarDados : 
                     modalAtivo === 'exclusao' ? solicitarExclusao : 
                     () => {}}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Confirmar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );

  return (
    <PortalContainer>
      <Header>
        <h1>🏛️ Portal de Direitos LGPD</h1>
        <div className="subtitle">
          Olá, <strong>{nomeCliente}</strong>! Gerencie seus dados pessoais e privacidade
        </div>
        <div className="lgpd-info">
          🛡️ Seus direitos garantidos pela Lei Geral de Proteção de Dados
        </div>
      </Header>

      <MenuGrid>
        {MENUS_DIREITOS.map(menu => (
          <MenuCard key={menu.id} onClick={() => abrirModal(menu.id)}>
            <div className="icon">{menu.icon}</div>
            <h3>{menu.titulo}</h3>
            <p>{menu.descricao}</p>
          </MenuCard>
        ))}
      </MenuGrid>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/cliente/cardapio', { state: { clienteId, nomeCliente } })}
        >
          Voltar ao Cardápio
        </Button>
      </div>

      {/* Modais */}
      <ModalBackground show={modalAtivo !== null} onClick={() => setModalAtivo(null)}>
        <div onClick={(e) => e.stopPropagation()}>
          {modalAtivo === 'consentimentos' && renderModalConsentimentos()}
          {modalAtivo === 'dados' && renderModalDados()}
          {modalAtivo === 'portabilidade' && renderModalGenerico(
            'Exportar Dados', '📤', 'baixar uma cópia completa de seus dados'
          )}
          {modalAtivo === 'exclusao' && renderModalGenerico(
            'Excluir Dados', '🗑️', 'solicitar a exclusão de seus dados pessoais'
          )}
          {modalAtivo === 'correcao' && renderModalGenerico(
            'Corrigir Dados', '✏️', 'solicitar correção de informações incorretas'
          )}
          {modalAtivo === 'historico' && renderModalGenerico(
            'Histórico', '📜', 'visualizar o histórico de suas solicitações'
          )}
        </div>
      </ModalBackground>
    </PortalContainer>
  );
};