import styled from "styled-components"

const EmptyTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
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
    margin-bottom: 20px;
    max-width: 300px;
    line-height: 1.4;
  }
`

const EmptyTableRow = styled.tr`
  td {
    padding: 40px 20px !important;
    text-align: center !important;
    border-bottom: none !important;
  }
`

export const EmptyTable = ({ 
  colSpan, 
  icon = "📋", 
  title = "Nenhum registro encontrado", 
  description = "Não há dados para exibir nesta tabela." 
}) => {
  return (
    <EmptyTableRow>
      <td colSpan={colSpan}>
        <EmptyTableContainer>
          <div className="empty-icon">{icon}</div>
          <div className="empty-title">{title}</div>
          <div className="empty-description">{description}</div>
        </EmptyTableContainer>
      </td>
    </EmptyTableRow>
  )
}