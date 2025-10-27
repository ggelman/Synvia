import styled from "styled-components"
import PropTypes from "prop-types"

const StyledButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 120px;
  
  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background-color: ${props.theme.colors.primary};
          color: white;
          box-shadow: ${props.theme.shadows.button};
          
          &:hover {
            background-color: #3d6b4a;
            transform: translateY(-1px);
          }
        `
      case "success":
        return `
          background-color: ${props.theme.colors.success};
          color: white;
          
          &:hover {
            background-color: #218838;
          }
        `
      case "danger":
        return `
          background-color: ${props.theme.colors.danger};
          color: white;
          
          &:hover {
            background-color: #c82333;
          }
        `
      case "secondary":
      default:
        return `
          background-color: #5a6268;
          color: white;
          
          &:hover {
            background-color: #f24242;
          }
        `
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

export const Button = ({ children, variant = "secondary", ...props }) => {
  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["primary", "success", "danger", "secondary"]),
}
