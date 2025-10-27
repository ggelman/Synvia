import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Modal, Badge, Table } from 'react-bootstrap';
import api from '../services/api';

const PortalDireitosTitular = () => {
  const [activeTab, setActiveTab] = useState('nova-solicitacao');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [tiposSolicitacao, setTiposSolicitacao] = useState({});
  const [statusSolicitacao, setStatusSolicitacao] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Estado do formulário de nova solicitação
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    usuarioId: '',
    tipoSolicitacao: '',
    motivo: ''
  });

  // Estado para consulta de protocolo
  const [consultaProtocolo, setConsultaProtocolo] = useState({
    protocolo: '',
    usuarioId: ''
  });

  useEffect(() => {
    carregarTiposSolicitacao();
    carregarStatusSolicitacao();
  }, []);

  const carregarTiposSolicitacao = async () => {
    try {
      const response = await api.get('/api/public/lgpd/solicitacoes/tipos-solicitacao');
      if (response.status === 200) {
        const tipos = response.data; 
        const tiposMap = tipos.reduce((acc, tipo) => {
          acc[tipo] = tipo; 
          return acc;
        }, {});
        setTiposSolicitacao(tiposMap); 
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de solicitação:', error);
    }
  };

  const carregarStatusSolicitacao = async () => {
    try {
      const response = await api.get('/api/public/lgpd/solicitacoes/status-solicitacao');
      if (response.data.success) {
        setStatusSolicitacao(response.data.status);
      }
    } catch (error) {
      console.error('Erro ao carregar status de solicitação:', error);
    }
  };

  const criarSolicitacao = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/public/lgpd/solicitacoes/nova-solicitacao', novaSolicitacao);

      if (response.data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: `Solicitação criada com sucesso! Protocolo: ${response.data.protocolo}. Prazo de resposta: ${response.data.prazoResposta}`
        });
        setNovaSolicitacao({ usuarioId: '', tipoSolicitacao: '', motivo: '' });
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: response.data.message || 'Erro ao criar solicitação'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Erro ao criar solicitação: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const consultarProtocolo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get(
        `/api/public/lgpd/solicitacoes/consultar/${consultaProtocolo.protocolo}?usuarioId=${consultaProtocolo.usuarioId}`
      );

      if (response.data.success) {
        setModalData(response.data.solicitacao);
        setShowModal(true);
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: response.data.message || 'Solicitação não encontrada'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Erro ao consultar protocolo: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const listarSolicitacoes = async (usuarioId) => {
    setLoading(true);

    try {
      const response = await api.get(`/api/public/lgpd/solicitacoes/listar/${usuarioId}`);

      if (response.data.success) {
        setSolicitacoes(response.data.solicitacoes);
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: response.data.message || 'Erro ao listar solicitações'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Erro ao listar solicitações: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDENTE': 'warning',
      'EM_ANALISE': 'info',
      'APROVADA': 'primary',
      'REJEITADA': 'danger',
      'CONCLUIDA': 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{statusSolicitacao[status] || status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Portal de Direitos do Titular - LGPD</h2>

      {alert.show && (
        <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {/* Navegação por abas */}
      <div className="mb-4">
        <Button
          variant={activeTab === 'nova-solicitacao' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('nova-solicitacao')}
        >
          Nova Solicitação
        </Button>
        <Button
          variant={activeTab === 'consultar' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('consultar')}
        >
          Consultar Protocolo
        </Button>
        <Button
          variant={activeTab === 'listar' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('listar')}
        >
          Minhas Solicitações
        </Button>
      </div>

      {/* Aba Nova Solicitação */}
      {activeTab === 'nova-solicitacao' && (
        <Card>
          <Card.Header>
            <h5>Nova Solicitação LGPD</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={criarSolicitacao}>
              <Form.Group className="mb-3">
                <Form.Label>ID do Usuário</Form.Label>
                <Form.Control
                  type="number"
                  value={novaSolicitacao.usuarioId}
                  onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, usuarioId: e.target.value })}
                  required
                  placeholder="Digite seu ID de usuário"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Solicitação</Form.Label>
                <Form.Select
                  value={novaSolicitacao.tipoSolicitacao}
                  onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, tipoSolicitacao: e.target.value })}
                  required
                >
                  <option value="">Selecione o tipo de solicitação</option>
                  {Object.entries(tiposSolicitacao).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Motivo/Justificativa</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={novaSolicitacao.motivo}
                  onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, motivo: e.target.value })}
                  placeholder="Descreva o motivo da sua solicitação"
                />
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Solicitação'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Aba Consultar Protocolo */}
      {activeTab === 'consultar' && (
        <Card>
          <Card.Header>
            <h5>Consultar Protocolo</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={consultarProtocolo}>
              <Form.Group className="mb-3">
                <Form.Label>Protocolo</Form.Label>
                <Form.Control
                  type="text"
                  value={consultaProtocolo.protocolo}
                  onChange={(e) => setConsultaProtocolo({ ...consultaProtocolo, protocolo: e.target.value })}
                  required
                  placeholder="Ex: LGPD-1234567890-ABC123XY"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID do Usuário</Form.Label>
                <Form.Control
                  type="number"
                  value={consultaProtocolo.usuarioId}
                  onChange={(e) => setConsultaProtocolo({ ...consultaProtocolo, usuarioId: e.target.value })}
                  required
                  placeholder="Digite seu ID de usuário"
                />
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Consultando...' : 'Consultar'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Aba Listar Solicitações */}
      {activeTab === 'listar' && (
        <Card>
          <Card.Header>
            <h5>Minhas Solicitações</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={(e) => {
              e.preventDefault();
              const usuarioId = e.target.usuarioId.value;
              if (usuarioId) listarSolicitacoes(usuarioId);
            }}>
              <div className="d-flex gap-2 mb-3">
                <Form.Control
                  type="number"
                  name="usuarioId"
                  placeholder="Digite seu ID de usuário"
                  required
                />
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Carregando...' : 'Buscar'}
                </Button>
              </div>
            </Form>

            {solicitacoes.length > 0 && (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Data Solicitação</th>
                    <th>Data Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id}>
                      <td>{solicitacao.protocolo}</td>
                      <td>{tiposSolicitacao[solicitacao.tipoSolicitacao] || solicitacao.tipoSolicitacao}</td>
                      <td>{getStatusBadge(solicitacao.status)}</td>
                      <td>{formatDate(solicitacao.dataSolicitacao)}</td>
                      <td>{formatDate(solicitacao.dataConclusao)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Modal de Detalhes da Solicitação */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Solicitação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div>
              <p><strong>Protocolo:</strong> {modalData.protocolo}</p>
              <p><strong>Tipo:</strong> {tiposSolicitacao[modalData.tipo] || modalData.tipo}</p>
              <p><strong>Status:</strong> {getStatusBadge(modalData.status)}</p>
              <p><strong>Data da Solicitação:</strong> {formatDate(modalData.dataSolicitacao)}</p>
              <p><strong>Data de Conclusão:</strong> {formatDate(modalData.dataConclusao)}</p>
              <p><strong>Motivo:</strong> {modalData.motivo || '-'}</p>
              {modalData.resposta && (
                <div>
                  <strong>Resposta:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {modalData.resposta}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PortalDireitosTitular;