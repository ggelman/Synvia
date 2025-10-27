import styled from "styled-components"

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin: 20px 0;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 12px;
  }
  
  .empty-description {
    font-size: 16px;
    color: ${(props) => props.theme.colors.secondary};
    margin-bottom: 24px;
    max-width: 400px;
    line-height: 1.5;
  }
  
  .empty-action {
    margin-top: 16px;
  }
`

export const EmptyState = ({ 
  icon = "📋", 
  title = "Nenhum dado encontrado", 
  description = "Não há informações para exibir no momento.", 
  action = null 
}) => {
  return (
    <EmptyStateContainer>
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-description">{description}</div>
      {action && <div className="empty-action">{action}</div>}
    </EmptyStateContainer>
  )
}