import styled from "styled-components"
import PropTypes from "prop-types"

const InputContainer = styled.div`
  margin-bottom: 16px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 14px;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.white};
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
  
  &.error {
    border-color: ${(props) => props.theme.colors.danger};
  }
`

const ErrorMessage = styled.span`
  color: ${(props) => props.theme.colors.danger};
  font-size: 14px;
  margin-top: 4px;
  display: block;
`

export const Input = ({ label, error, required, ...props }) => {
  return (
    <InputContainer>
      {label && (
        <Label>
          {label} {required && <span style={{ color: "#dc3545" }}>*</span>}
        </Label>
      )}
      <StyledInput className={error ? "error" : ""} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  )
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
}
