import { useState, useEffect } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "./Card"
import { Input } from "./Input"
import { Button } from "./Button"
import { Spinner } from "./Spinner"
import { mockHandlers } from "../mocks/handlers"
import api from "../services/api";

const NotificationContainer = styled.div`
  display: grid;
  gap: 24px;
`

const NotificationCard = styled(Card)`
  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .notification-info {
      flex: 1;
      
      .notification-title {
        font-weight: 600;
        color: ${(props) => props.theme.colors.textPrimary};
        margin-bottom: 4px;
      }
      
      .notification-desc {
        font-size: 14px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
    
    .notification-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .toggle-switch {
        position: relative;
        width: 50px;
        height: 24px;
        background-color: #ccc;
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &.active {
          background-color: ${(props) => props.theme.colors.primary};
        }
        
        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
          
          &.active {
            transform: translateX(26px);
          }
        }
      }
    }
  }
`

const EmailList = styled.div`
  .email-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .email-info {
      .email-address {
        font-weight: 500;
        color: ${(props) => props.theme.colors.textPrimary};
      }
      
      .email-role {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
      }
    }
    
    .remove-btn {
      background: none;
      color: ${(props) => props.theme.colors.danger};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      
      &:hover {
        background-color: rgba(220, 53, 69, 0.1);
      }
    }
  }
`

const AddEmailForm = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  
  .email-input {
    flex: 1;
  }
`

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`

const notificationTypes = [
  {
    id: "lowStock",
    title: "Estoque Baixo",
    description: "Receber alertas quando produtos estiverem com estoque baixo",
  },
  {
    id: "dailyReport",
    title: "Relatório Diário",
    description: "Receber relatório de vendas diário por email",
  },
  {
    id: "weeklyReport",
    title: "Relatório Semanal",
    description: "Receber resumo semanal de vendas e performance",
  },
  {
    id: "backupComplete",
    title: "Backup Concluído",
    description: "Notificação quando backup automático for realizado",
  },
  {
    id: "newUser",
    title: "Novo Usuário",
    description: "Notificar quando um novo usuário for cadastrado",
  },
  {
    id: "systemAlerts",
    title: "Alertas do Sistema",
    description: "Receber alertas importantes do sistema",
  },
]

export const NotificationSettings = () => {
  const [settings, setSettings] = useState({})
  const [emailList, setEmailList] = useState([])
  const [newEmail, setNewEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
        const response = await api.get('/notifications/settings');
        setSettings(response.data.settings);
        setEmailList(response.data.emailList);
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
    } finally {
        setLoading(false);
    }
  };

  const toggleNotification = async (notificationId) => {
    const newSettings = {
        ...settings,
        [notificationId]: !settings[notificationId],
    };
    setSettings(newSettings); 
    try {
        await api.post('/notifications/settings', newSettings);
    } catch (error) {
        console.error("Erro ao atualizar configuração:", error);
        setSettings((prev) => ({...prev, [notificationId]: !prev[notificationId]}));
    }
  };

  const addEmail = async (e) => {
    e.preventDefault();

    if (!newEmail.trim() || !newEmail.includes("@")) {
        alert("Por favor, insira um email válido");
        return;
    }

    if (emailList.some((item) => item.email === newEmail)) {
        alert("Este email já está na lista");
        return;
    }

    const newEmailData = {
        email: newEmail,
        role: "Administrador", 
    };

    try {
        const response = await api.post('/notifications/emails', newEmailData);
        
        setEmailList([...emailList, response.data]);
        
        setNewEmail("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
        console.error("Erro ao adicionar email:", error.response?.data || error.message);
        alert("Ocorreu um erro ao adicionar o email.");
    }
  };

  const removeEmail = async (emailId) => {
    if (!window.confirm("Tem certeza que deseja remover este email?")) {
        return;
    }

    try {
        await api.delete(`/notifications/emails/${emailId}`);
        
        setEmailList(emailList.filter((item) => item.id !== emailId));
    } catch (error) {
        console.error("Erro ao remover email:", error.response?.data || error.message);
        alert("Ocorreu um erro ao remover o email.");
    }
  };

  const testNotification = async (type) => {
    setSaving(true);
    try {
        const testData = {
            type: type,
            recipients: emailList.map((item) => item.email)
        };
        
        await api.post('/notifications/test-notification', testData);
        
        alert(`Notificação de teste para '${type}' enviada com sucesso!`);
    } catch (error) {
        console.error("Erro ao enviar teste:", error.response?.data || error.message);
        alert("Erro ao enviar notificação de teste");
    } finally {
        setSaving(false);
    }
  };  

  if (loading) {
    return <div>Carregando configurações...</div>
  }

  return (
    <NotificationContainer>
      <CardHeader>
        <h2>Configurações de Notificações</h2>
      </CardHeader>

      {success && <SuccessMessage>Email adicionado com sucesso!</SuccessMessage>}

      <NotificationCard>
        <CardHeader>
          <h3>Tipos de Notificação</h3>
        </CardHeader>

        {notificationTypes.map((notification) => (
          <div key={notification.id} className="notification-item">
            <div className="notification-info">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-desc">{notification.description}</div>
            </div>
            <div className="notification-toggle">
              <button
                type="button"
                className={`toggle-switch ${settings[notification.id] ? "active" : ""}`}
                aria-pressed={!!settings[notification.id]}
                onClick={() => toggleNotification(notification.id)}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <div className={`toggle-slider ${settings[notification.id] ? "active" : ""}`} />
              </button>
              <Button
                variant="secondary"
                onClick={() => testNotification(notification.id)}
                disabled={saving || !settings[notification.id]}
                style={{ fontSize: "12px", padding: "4px 8px" }}
              >
                {saving ? <Spinner /> : "Testar"}
              </Button>
            </div>
          </div>
        ))}
      </NotificationCard>

      <Card>
        <CardHeader>
          <h3>Lista de Emails para Notificações</h3>
        </CardHeader>

        <EmailList>
          {emailList.map((emailItem) => (
            <div key={emailItem.id} className="email-item">
              <div className="email-info">
                <div className="email-address">{emailItem.email}</div>
                <div className="email-role">{emailItem.role}</div>
              </div>
              <button className="remove-btn" onClick={() => removeEmail(emailItem.id)}>
                Remover
              </button>
            </div>
          ))}
        </EmailList>

        <AddEmailForm onSubmit={addEmail}>
          <Input
            className="email-input"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Digite o email para adicionar..."
            required
          />
          <Button type="submit" variant="primary">
            Adicionar
          </Button>
        </AddEmailForm>
      </Card>
    </NotificationContainer>
  )
}
