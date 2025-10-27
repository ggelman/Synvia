import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { Card, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import api from "../services/api";

const BackupContainer = styled.div`
  display: grid;
  gap: 24px;
`

const BackupGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const BackupCard = styled(Card)`
  text-align: center;
  
  .backup-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 {
    margin-bottom: 12px;
    color: ${(props) => props.theme.colors.textPrimary};
  }
  
  p {
    color: ${(props) => props.theme.colors.secondary};
    margin-bottom: 20px;
    font-size: 14px;
  }
`

const BackupHistory = styled.div`
  .backup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .backup-info {
      .backup-name {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
      }
      
      .backup-date {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
    
    .backup-actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 4px;
      
      &.download {
        background-color: ${(props) => props.theme.colors.primary};
        color: white;
      }
      
      &.restore {
        background-color: ${(props) => props.theme.colors.success};
        color: white;
      }
      
      &.delete {
        background-color: ${(props) => props.theme.colors.danger};
        color: white;
      }
    }
  }
`

const UploadArea = styled.div`
  border: 2px dashed ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:hover, &.dragover {
    border-color: ${(props) => props.theme.colors.primary};
    background-color: rgba(74, 124, 89, 0.05);
  }
  
  .upload-icon {
    font-size: 32px;
    margin-bottom: 12px;
    color: ${(props) => props.theme.colors.secondary};
  }
  
  p {
    color: ${(props) => props.theme.colors.secondary};
    margin: 0;
  }
  
  input[type="file"] {
    display: none;
  }
`

const StatusMessage = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  
  &.success {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  &.info {
    background-color: #d1ecf1;
    color: #0c5460;
  }
`

const ConfigSection = styled.div`
  .config-options {
    display: grid;
    gap: 12px;
    margin-bottom: 20px;
    
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      input[type="checkbox"] {
        width: 16px;
        height: 16px;
      }
    }
  }
`

export const SistemaBackup = () => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const [configLoading, setConfigLoading] = useState(false);
  const [backupConfig, setBackupConfig] = useState({
    backupDiarioAtivo: false,
    backupSemanalAtivo: false,
    notificarPorEmail: false
  });

  const [backupHistory, setBackupHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/backup/history');
      setBackupHistory(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico de backups:", error);
      showMessage('error', 'Não foi possível carregar o histórico de backups.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await api.get('/configuracoes/backup');
        setBackupConfig(response.data);
      } catch (error) {
        console.error("Erro ao buscar configurações de backup:", error);
        showMessage('error', 'Não foi possível carregar as configurações.');
      }
    };
    fetchConfigs();
    fetchHistory();
  }, [fetchHistory]);

  const handleConfigChange = (e) => {
    const { name, checked } = e.target;
    setBackupConfig(prev => ({ ...prev, [name]: checked }));
  };

  const saveBackupConfig = async () => {
    setConfigLoading(true);
    try {
      await api.post('/configuracoes/backup', backupConfig);
      showMessage("success", "Configurações de backup salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showMessage("error", "Erro ao salvar configurações. Tente novamente.");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoadingCreate(true);
    try {
      const response = await api.get('/backup/create', {
        responseType: 'blob',
      });

      const header = response.headers['content-disposition'];
      const filename = header ? header.split('filename=')[1].replace(/"/g, '') : 'backup.json';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage("success", `Backup "${filename}" baixado com sucesso!`);
      fetchHistory();
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      showMessage("error", "Erro ao criar backup. Verifique o console para mais detalhes.");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleRestoreBackup = async (file) => {
    if (!file || !file.name.endsWith(".json")) {
      showMessage("error", "Por favor, selecione um arquivo JSON válido.");
      return;
    }

    setLoadingRestore(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/backup/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showMessage("success", "Backup restaurado com sucesso! As alterações serão visíveis em todo o sistema.");
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      const errorMessage = error.response?.data || "Erro ao restaurar. Verifique se o arquivo é válido.";
      showMessage("error", errorMessage);
    } finally {
      setLoadingRestore(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm("Tem certeza que deseja excluir o registro deste backup?")) {
      try {
        await api.delete(`/backup/${backupId}`);
        showMessage('success', 'Registro de backup excluído com sucesso.');
        fetchHistory();
      } catch (error) {
        console.error("Erro ao excluir backup:", error);
        showMessage('error', 'Não foi possível excluir o registro do backup.');
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleRestoreBackup(file);
    }
  };

  const renderHistoryContent = () => {
    if (loadingHistory) {
      return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>;
    }

    if (backupHistory.length === 0) {
      return <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>Nenhum backup registrado.</p>;
    }

    return backupHistory.map((backup) => (
      <div key={backup.id} className="backup-item">
        <div className="backup-info">
          <div className="backup-name">{backup.nomeArquivo}</div>
          <div className="backup-date">
            {new Date(backup.dataCriacao).toLocaleString('pt-BR')} • {backup.tamanho}
          </div>
        </div>
        <div className="backup-actions">
          <Button variant="danger" size="sm" onClick={() => handleDeleteBackup(backup.id)}>
            Excluir
          </Button>
        </div>

      </div>
    ));
  };

  return (
    <BackupContainer>
      <CardHeader><h2>Sistema de Backup</h2></CardHeader>

      {message.text && <StatusMessage className={message.type}>{message.text}</StatusMessage>}

      <BackupGrid>
        <BackupCard>
          <div className="backup-icon">💾</div>
          <h3>Criar Backup</h3>
          <p>Faça o download de todos os dados do sistema em um arquivo seguro.</p>
          <Button variant="primary" onClick={handleCreateBackup} disabled={loadingCreate}>
            {loadingCreate ? <Spinner /> : "Criar e Baixar Backup"}
          </Button>
        </BackupCard>

        <BackupCard>
          <div className="backup-icon">📤</div>
          <h3>Restaurar Backup</h3>
          <p>Carregue um arquivo de backup para restaurar os dados do sistema. ATENÇÃO: Esta ação substituirá todos os dados atuais.</p>
          <UploadArea onClick={() => fileInputRef.current.click()}>
            <input aria-label="Input field"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
            />
            {loadingRestore ? <Spinner /> : <p>Clique aqui para selecionar um arquivo</p>}
          </UploadArea>
        </BackupCard>
      </BackupGrid>

      <Card>
        <CardHeader><h3>Histórico de Backups</h3></CardHeader>
        <BackupHistory>
          {renderHistoryContent()}
        </BackupHistory>
      </Card>

      <Card>
        <CardHeader><h3>Configurações de Backup Automático</h3></CardHeader>
        <ConfigSection>
          <div className="config-options">
            <label>
              <input aria-label="Input field"
                type="checkbox"
                name="backupDiarioAtivo"
                checked={backupConfig.backupDiarioAtivo}
                onChange={handleConfigChange}
              />
              <span>Backup diário às 23:00</span>
            </label>
            <label>
              <input aria-label="Input field"
                type="checkbox"
                name="backupSemanalAtivo"
                checked={backupConfig.backupSemanalAtivo}
                onChange={handleConfigChange}
              />
              <span>Backup semanal aos domingos</span>
            </label>
            <label>
              <input aria-label="Input field"
                type="checkbox"
                name="notificarPorEmail"
                checked={backupConfig.notificarPorEmail}
                onChange={handleConfigChange}
              />
              <span>Notificar por email quando backup for criado</span>
            </label>
          </div>
          <Button variant="secondary" onClick={saveBackupConfig} disabled={configLoading}>
            {configLoading ? <Spinner /> : "Salvar Configurações"}
          </Button>
        </ConfigSection>
      </Card>
    </BackupContainer>)
}
