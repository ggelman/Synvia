import { usePermissions } from "../hooks/usePermissions"
import styled from "styled-components"

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin: 20px;
`

const AccessDeniedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  color: #dc3545;
`

const AccessDeniedTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 16px;
  font-size: 24px;
`

const AccessDeniedMessage = styled.p`
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 8px;
`

const UserInfo = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  border-left: 4px solid #B8860B;
`

export const PermissionGuard = ({ children, requiredPermission, route }) => {
  const { hasPermission, canAccess, userProfile, userPermissions } = usePermissions()

  // Função auxiliar para mapear perfis para nomes legíveis
  const getProfileDisplayName = (profile) => {
    const profileMap = {
      administrador: "Administrador",
      gerente: "Gerente",
      funcionario: "Funcionário"
    };
    return profileMap[profile] || "Funcionário";
  };

  // Se uma rota específica foi fornecida, use canAccess
  if (route && !canAccess(route)) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedIcon>🚫</AccessDeniedIcon>
        <AccessDeniedTitle>Acesso Negado</AccessDeniedTitle>
        <AccessDeniedMessage>Você não tem permissão para acessar esta funcionalidade.</AccessDeniedMessage>
        <AccessDeniedMessage>Entre em contato com o administrador para solicitar acesso.</AccessDeniedMessage>
        <UserInfo>
          <strong>Seu Perfil:</strong> {getProfileDisplayName(userProfile)}
          <br />
          <strong>Suas Permissões:</strong> {userPermissions.join(", ") || "Nenhuma"}
        </UserInfo>
      </AccessDeniedContainer>
    )
  }

  // Se uma permissão específica foi fornecida, use hasPermission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedIcon>🚫</AccessDeniedIcon>
        <AccessDeniedTitle>Acesso Negado</AccessDeniedTitle>
        <AccessDeniedMessage>Você não tem permissão para acessar esta funcionalidade.</AccessDeniedMessage>
        <AccessDeniedMessage>
          Permissão necessária: <strong>{requiredPermission}</strong>
        </AccessDeniedMessage>
        <UserInfo>
          <strong>Seu Perfil:</strong> {getProfileDisplayName(userProfile)}
          <br />
          <strong>Suas Permissões:</strong> {userPermissions.join(", ") || "Nenhuma"}
        </UserInfo>
      </AccessDeniedContainer>
    )
  }

  return children
}
