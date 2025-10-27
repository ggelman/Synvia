import styled from "styled-components"

const EmptyChartContainer = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 2px dashed #dee2e6;
  text-align: center;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
    max-width: 250px;
    line-height: 1.4;
  }
`

export const EmptyChart = ({ 
  icon = "📊", 
  title = "Sem dados para exibir", 
  description = "Não há informações suficientes para gerar o gráfico." 
}) => {
  return (
    <EmptyChartContainer>
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-description">{description}</div>
    </EmptyChartContainer>
  )
}