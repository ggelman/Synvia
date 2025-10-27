import styled from "styled-components"
import { useState } from "react"

const QuickAccessContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
`

const FloatingButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8860B, #DAA520);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(184, 134, 11, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const QuickMenu = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transform: translateY(${props => props.visible ? 0 : '10px'});
  transition: all 0.3s ease;
`

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  .icon {
    font-size: 18px;
    width: 20px;
    text-align: center;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .description {
      font-size: 12px;
      color: #666;
    }
  }
`

export const QuickAccessPortal = () => {
  const [menuVisible, setMenuVisible] = useState(false)

  const menuItems = [
    {
      title: "Portal do Cliente",
      description: "Acesso público via QR Code",
      icon: "🌐",
      action: () => window.open("/qr", "_blank")
    },
    {
      title: "Portal LGPD",
      description: "Direitos dos titulares",
      icon: "🛡️",
      action: () => window.open("/lgpd/portal", "_blank")
    },
    {
    title: "Cardápio Digital",
    description: "Menu digital Synvia integrado",
      icon: "📱",
      action: () => window.open("/cliente/cardapio", "_blank")
    }
  ]

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const handleItemClick = (action) => {
    action()
    setMenuVisible(false)
  }

  return (
    <QuickAccessContainer>
      <QuickMenu visible={menuVisible}>
        {menuItems.map((item, index) => (
          <MenuItem 
            key={index}
            onClick={() => handleItemClick(item.action)}
          >
            <span className="icon">{item.icon}</span>
            <div className="content">
              <div className="title">{item.title}</div>
              <div className="description">{item.description}</div>
            </div>
          </MenuItem>
        ))}
      </QuickMenu>
      
      <FloatingButton onClick={toggleMenu}>
        {menuVisible ? "✕" : "🚀"}
      </FloatingButton>
    </QuickAccessContainer>
  )
}
