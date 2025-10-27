import styled from "styled-components"

export const Card = styled.div`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${(props) => props.theme.shadows.card};
  margin-bottom: 20px;
`

export const CardHeader = styled.div`
  margin-bottom: 20px;
  
  h2 {
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 24px;
    font-weight: 700;
  }
`
