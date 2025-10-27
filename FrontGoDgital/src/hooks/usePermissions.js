import { useAuth } from "../context/AuthContext"

export const usePermissions = () => {
  const { user } = useAuth()

  const hasPermission = (permission) => {
    if (!user?.permissoes) return false
    return user.permissoes.includes(permission)
  }

  const canAccess = (route) => {
    if (!user) return false

    const routePermissions = {
      "/": [], 
      "/vendas/nova": ["vendas"],
      "/vendas/historico": ["vendas"],
      "/produtos/novo": ["produtos"],
      "/produtos/categorias": ["produtos"],
      "/clientes/novo": ["clientes"],
      "/clientes": ["clientes"],
      "/estoque": ["estoque"],
      "/usuarios": ["usuarios"],
      "/backup": ["backup"],
      "/relatorios": ["relatorios"],
      "/financeiro": ["relatorios"],
      "/security": ["seguranca"],
      "/ia/previsao": ["ia/previsao"], 
      "/ia/chat": ["relatorios"],
      "/auditoria": ["auditoria"], // Usar permissão específica de auditoria
    }

    const requiredPermissions = routePermissions[route]

    if (!requiredPermissions) return false 

    if (requiredPermissions.length === 0) return true 

    // Para rota de auditoria, verificar também se é admin ou gerente
    if (route === "/auditoria") {
      return hasPermission("auditoria") || user?.perfil === "administrador" || user?.perfil === "gerente"
    }

    return requiredPermissions.some((permission) => hasPermission(permission))
  }

  const isAdmin = () => {
    return user?.perfil === "administrador" 
  }

  const isGerente = () => {
    return user?.perfil === "gerente" 
  }
  
  const isFuncionario = () => {
    return user?.perfil === "funcionario" 
  }

  return {
    hasPermission,
    canAccess,
    isAdmin,
    isGerente,
    isFuncionario,
    userPermissions: user?.permissoes || [],
    userProfile: user?.perfil || null,
  }
}