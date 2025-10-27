import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Card, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import api from "../services/api";
import { formatarTelefone, formatarCPF } from "../util/format";

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

const LgpdActions = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const GerenciamentoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    const termo = searchTerm.toLowerCase();
    const termoNumerico = searchTerm.replace(/\D/g, "");

    if (!termo) return clientes;

    return clientes.filter(c => {
      const nomeMatch = c.nome?.toLowerCase().includes(termo);

      if (termoNumerico.length > 0) {
        const telefoneMatch = c.telefone && String(c.telefone).replace(/\D/g, "").includes(termoNumerico);
        const cpfMatch = c.cpf && String(c.cpf).replace(/\D/g, "").includes(termoNumerico);
        return nomeMatch || telefoneMatch || cpfMatch;
      }
      
      return nomeMatch;
    });
  }, [clientes, searchTerm]);

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setEditFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || '',
      dataNascimento: cliente.dataNascimento || '',
      observacoes: cliente.observacoes || '',
    });
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(null);
    setIsEditing(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/clientes/${selectedCliente.idCliente}`, editFormData);

      const clienteAtualizado = response.data;

      setClientes(clientesAnteriores =>
        clientesAnteriores.map(cliente =>
          cliente.idCliente === clienteAtualizado.idCliente ? clienteAtualizado : cliente
        )
      );

      alert("Cliente atualizado com sucesso!");
      handleCloseModal();

    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert(error.response?.data?.message || "Falha ao atualizar cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymize = async (clienteId) => {
    if (window.confirm("ATENÇÃO: Ação irreversível. Confirma a anonimização dos dados pessoais deste cliente?")) {
      try {
        await api.post(`/clientes/${clienteId}/anonymize`);
        alert("Cliente anonimizado com sucesso.");
        setIsModalOpen(false);
        fetchClientes();
      } catch (error) {
        console.error("Erro ao anonimizar cliente:", error);
        alert("Erro ao anonimizar os dados do cliente.");
      }
    }
  };

  const handleExport = async (clienteId, clienteNome) => {
    try {
      const response = await api.get(`/clientes/${clienteId}/portabilidade`);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(response.data, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `portabilidade_${clienteNome.replace(/\s+/g, '_').toLowerCase()}.json`;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert("Erro ao exportar os dados do cliente.");
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><Spinner /></div>;

  return (
    <div>
      <CardHeader><h2>Gerenciamento de Clientes</h2></CardHeader>
      <Card>
        <Input
          placeholder="Buscar por nome, telefone ou CPF..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>Nome</th>
              <th style={{ padding: '12px' }}>Telefone</th>
              <th style={{ padding: '12px' }}>Fidelidade</th>
              <th style={{ padding: '12px' }}>Pontos</th>
              <th style={{ padding: '12px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map(cliente => (
              <tr key={cliente.idCliente} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{cliente.nome}</td>
                <td style={{ padding: '12px' }}>{formatarTelefone(cliente.telefone)}</td>
                <td style={{ padding: '12px' }}>{cliente.participaFidelidade ? 'Sim' : 'Não'}</td>
                <td style={{ padding: '12px' }}>{cliente.participaFidelidade ? cliente.fidelidade?.pontos ?? 0 : 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  <Button onClick={() => handleSelectCliente(cliente)}>Detalhes</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {isModalOpen && selectedCliente && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CardHeader>
              <h3>{isEditing ? `Editando ${selectedCliente.nome}` : `Detalhes de ${selectedCliente.nome}`}</h3>
            </CardHeader>

            {isEditing ? (
              <form onSubmit={handleUpdateCliente}>
                <Input label="Nome" name="nome" value={editFormData.nome} onChange={handleEditFormChange} />
                <Input label="Telefone" name="telefone" value={editFormData.telefone} onChange={handleEditFormChange} />
                <Input label="Email" name="email" type="email" value={editFormData.email} onChange={handleEditFormChange} />
                <Input label="Data de Nascimento" name="dataNascimento" type="date" value={editFormData.dataNascimento} onChange={handleEditFormChange} />
                <Input as="textarea" label="Observações" name="observacoes" value={editFormData.observacoes} onChange={handleEditFormChange} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button type="submit" variant="success" disabled={loading}>{loading ? <Spinner /> : 'Salvar'}</Button>
                </div>
              </form>
            ) : (
              <>
                <div className="info-grid">
                  <div className="info-row"><span>Telefone:</span><span>{formatarTelefone(selectedCliente.telefone)}</span></div>
                  <div className="info-row"><span>CPF:</span><span>{formatarCPF(selectedCliente.cpf)}</span></div>
                  <div className="info-row"><span>Email:</span><span>{selectedCliente.email || 'Não informado'}</span></div>
                  <div className="info-row"><span>Data Nasc:</span><span>{selectedCliente.dataNascimento ? selectedCliente.dataNascimento.split('T')[0].split('-').reverse().join('/') : 'Não informada'}</span></div>
                  <div className="info-row"><span>Obs:</span><span>{selectedCliente.observacoes || 'Nenhuma'}</span></div>
                </div>

                <LgpdActions>
                  {selectedCliente.cpf !== '00000000000' ? (
                    <>
                      <Button variant="primary" onClick={() => setIsEditing(true)}>Editar</Button>
                      <Button variant="secondary" onClick={() => handleExport(selectedCliente.idCliente, selectedCliente.nome)}>Exportar</Button>
                      <Button variant="danger" onClick={() => handleAnonymize(selectedCliente.idCliente)}>Excluir (Anonimizar)</Button>
                    </>
                  ) : (
                    <div style={{ width: '100%', textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                      <p style={{ margin: 0 }}>Ações indisponíveis para cliente anonimizado.</p>
                    </div>
                  )}
                </LgpdActions>
                <Button style={{ marginTop: '20px', width: '100%' }} onClick={handleCloseModal}>Fechar</Button>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}