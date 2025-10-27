import styled from "styled-components"
import { BRAND } from "../../config/branding"
import { useAuth } from "../../context/AuthContext"
import { usePermissions } from "../../hooks/usePermissions"
import { useNavigate, useLocation } from "react-router-dom"
import { useSecurityAlerts } from "../security/SecurityAlertsProvider"
import { QuickAccessPortal } from "./QuickAccessPortal"
import PropTypes from "prop-types"

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--synvia-gradient-bg);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 10% 20%, rgba(142, 194, 255, 0.25), transparent 45%),
                radial-gradient(circle at 90% 10%, rgba(91, 181, 162, 0.2), transparent 40%);
    filter: blur(80px);
    z-index: 0;
  }
`

const Sidebar = styled.aside`
  position: relative;
  z-index: 1;
  width: 280px;
  min-width: 280px;
  background: linear-gradient(160deg, rgba(15, 21, 38, 0.92), rgba(28, 44, 82, 0.88));
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 0 32px;
  box-shadow: 0 18px 40px rgba(7, 13, 32, 0.35);
  backdrop-filter: blur(8px);
`

const Logo = styled.div`
  padding: 0 24px 32px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 28px;

  .symbol {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0 auto 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }

  h3 {
    color: #f6f7fc;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    margin-top: 4px;
  }
`

const NavMenu = styled.nav`
  padding: 0 16px;
  display: grid;
  gap: 6px;
`

const NavItem = styled.div`
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    border-radius: 12px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.2s ease;
    letter-spacing: 0.01em;

    span {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    &:hover, &.active {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 12px 24px rgba(8, 12, 28, 0.24);
    }
  }
`

const MainContent = styled.main`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.94), rgba(239, 243, 251, 0.92));
  backdrop-filter: blur(6px);
`

const Header = styled.header`
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(20, 27, 65, 0.08);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  span {
    font-weight: 600;
    color: var(--synvia-text-secondary);
  }
`

const UserProfile = styled.span`
  background: var(--synvia-gradient-accent);
  color: white;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const LogoutButton = styled.button`
  background: rgba(218, 92, 92, 0.12);
  color: ${props => props.theme.colors.danger};
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 999px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(218, 92, 92, 0.18);
    transform: translateY(-1px);
  }
`

const ContentArea = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { canAccess, userProfile } = usePermissions()
  const { alerts } = useSecurityAlerts()
  const navigate = useNavigate()
  const location = useLocation()

  // Contar alertas nÃ£o lidos
  const unreadAlertsCount = alerts.filter(alert => !alert.read).length

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const allMenuItems = [
    { path: "/", label: "Dashboard", icon: "ðŸ ", permission: null },
    { path: "/financeiro", label: "Dashboard Financeiro", icon: "ðŸ’°", permission: "relatorios" },
    { path: "/auditoria", label: "Dashboard Auditoria", icon: "ðŸ”", permission: "auditoria" },
    { path: "/vendas/nova", label: "Nova Venda", icon: "ðŸ›’", permission: "vendas" },
    { path: "/vendas/historico", label: "HistÃ³rico de Vendas", icon: "ðŸ“‹", permission: "vendas" },
    { path: "/produtos/novo", label: "Cadastrar Produto", icon: "ðŸ“¦", permission: "produtos" },
    { path: "/produtos/categorias", label: "Categorias", icon: "ðŸ·ï¸", permission: "produtos" },
    { path: "/clientes/novo", label: "Cadastrar Cliente", icon: "ðŸ‘¥", permission: "clientes" },
    { path: "/clientes", label: "GestÃ£o de Clientes", icon: "â­", permission: "clientes" },
    { path: "/estoque", label: "GestÃ£o de Estoque", icon: "ðŸ“Š", permission: "estoque" },
    { path: "/usuarios", label: "UsuÃ¡rios", icon: "ðŸ‘¤", permission: "usuarios" },
    { path: "/backup", label: "Sistema de Backup", icon: "ðŸ’¾", permission: "backup" },
    { path: "/relatorios", label: "RelatÃ³rios", icon: "ðŸ“ˆ", permission: "relatorios" },
    {
      path: "/security",
      label: "Monitor de SeguranÃ§a",
      icon: "ðŸ”’",
      permission: "administrador",
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : 0
    },
    { path: "/ia/previsao", label: "PrevisÃ£o IA", icon: "ðŸ¤–", permission: "administrador" },
    { path: "/ia/chat", label: "Chat com IA", icon: "ðŸ’¬", permission: "administrador" },
  ]

  const menuItems = allMenuItems.filter((item) => {
    if (!item.permission) return true
    
    // Para itens especÃ­ficos de admin, verificar se Ã© administrador
    if (item.permission === "administrador") {
      return userProfile === "administrador"
    }
    
    // Para dashboard de auditoria - apenas admin e gerente
    if (item.permission === "auditoria") {
      return userProfile === "administrador" || userProfile === "gerente"
    }
    
    // Para outros itens, usar canAccess normal
    return canAccess(item.path)
  })

  const getProfileDisplayName = (profile) => {
    switch (profile) {
      case "administrador":
        return "Admin"
      case "gerente":
        return "Gerente"
      case "funcionario":
        return "FuncionÃ¡rio"
      default:
        return "UsuÃ¡rio"
    }
  }

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <img 
            src="/assets/synvia-logo.svg"
            alt="Logo Synvia"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/images/logoSynvia-Photoroom.png"
            }}
          />
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "var(--synvia-accent-primary)",
              borderRadius: "50%",
              margin: "0 auto 15px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "var(--synvia-snow)",
            }}
          >
            S
          </div>
          <h3>{BRAND.name}</h3>
          <p>{BRAND.tagline}</p>
        </Logo>

        <NavMenu>
          {menuItems.map((item) => (
            <NavItem key={item.path}>
              <a
                href={item.path}
                className={location.pathname === item.path ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(item.path)
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  {item.icon} {item.label}
                </div>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: "#dc3545",
                    color: "var(--synvia-snow)",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: "500",
                    display: "inline-block",
                    lineHeight: "1",
                  }}>
                    {item.badge}
                  </span>
                )}
              </a>
            </NavItem>
          ))}
        </NavMenu>
      </Sidebar>

      <MainContent>
        <Header>
          <h1 style={{ color: "#3D2C21", fontSize: "20px" }}>Sistema de GestÃ£o</h1>
          <UserInfo>
            <UserProfile>{getProfileDisplayName(userProfile)}</UserProfile>
            <span>OlÃ¡, {user?.nome}</span>
            <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
          </UserInfo>
        </Header>

        <ContentArea>{children}</ContentArea>
        
        {/* BotÃ£o de acesso rÃ¡pido ao portal do cliente */}
        <QuickAccessPortal />
      </MainContent>
    </LayoutContainer>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node,
}

