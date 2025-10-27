import { useState } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
import { Link } from 'react-router-dom';
import api from "../services/api";

const Form = styled.form`
  display: grid;
  gap: 16px;
`
const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 20px;
`
const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`
const RadioGroup = styled.div`
  margin-bottom: 16px;
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 14px;
  }
  .radio-options {
    display: flex;
    gap: 20px;
    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      input[type="radio"] { margin: 0; }
      span {
        font-size: 16px;
        color: ${(props) => props.theme.colors.textPrimary};
      }
    }
  }
`

const ConsentContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;

  label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #495057;

    a {
      color: ${(props) => props.theme.colors.primary};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  p {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
    margin-left: 28px; 
  }
`

export const CadastroCliente = () => {
  const initialFormData = {
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    dataNascimento: "",
    participaFidelidade: true,
    observacoes: "",
    consentimentoLgpd: false,
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'participaFidelidade') {
      newValue = value === 'sim';
    } else {
      newValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setSuccess(false)
  }

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+$/, "$1")
  }

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+$/, "$1")
  }

  const formatDate = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+$/, "$1");
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, telefone: formatted }))
  }

  const handleDateChange = (e) => {
    const formatted = formatDate(e.target.value);
    setFormData((prev) => ({ ...prev, dataNascimento: formatted }));
  };

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nome.trim()) newErrors.nome = "Nome do cliente é obrigatório"
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório"
    else if (formData.telefone.replace(/\D/g, "").length < 10) newErrors.telefone = "Telefone deve ter pelo menos 10 dígitos"
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório"
    else if (formData.cpf.replace(/\D/g, "").length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos"

    if (formData.email && !/^[\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de e-mail inválido"
    }

    if (formData.dataNascimento) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = formData.dataNascimento.split('/');
      const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      if (birthDate > today) {
        newErrors.dataNascimento = "A data de nascimento não pode ser no futuro."
      }
    }

    if (!formData.consentimentoLgpd) {
      newErrors.consentimentoLgpd = "Você deve aceitar os termos para continuar."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)
    setErrors({})

    try {
      const parts = formData.dataNascimento.split('/');
      const dataNascimentoISO = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : null;

      const clienteParaEnviar = {
        nome: formData.nome,
        telefone: formData.telefone.replace(/\D/g, ""),
        cpf: formData.cpf.replace(/\D/g, ""),
        email: formData.email,
        dataNascimento: dataNascimentoISO,
        participaFidelidade: formData.participaFidelidade,
        observacoes: formData.observacoes,
        consentimentoLgpd: formData.consentimentoLgpd,
      };

      await api.post("/clientes", clienteParaEnviar)
      setSuccess(true)
      setFormData(initialFormData)

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || "Ocorreu um erro ao salvar o cliente."
      console.error("Erro ao cadastrar cliente:", errorMessage)
      setErrors({ form: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setErrors({})
    setSuccess(false)
  }

  return (
    <Card>
      <CardHeader>
        <h2>Cadastro de Cliente</h2>
      </CardHeader>

      {success && <SuccessMessage>Cliente cadastrado com sucesso!</SuccessMessage>}
      {errors.form && <div style={{ color: 'red', marginBottom: '16px' }}>{errors.form}</div>}

      <Form onSubmit={handleSubmit}>
        <Input
          label="Nome do Cliente"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          error={errors.nome}
          required
          placeholder="Nome completo do cliente"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Telefone (DDD)"
            name="telefone"
            value={formData.telefone}
            onChange={handlePhoneChange}
            error={errors.telefone}
            required
            placeholder="(11) 99999-9999"
            maxLength="15"
          />

          <Input
            label="CPF"
            name="cpf"
            value={formData.cpf}
            onChange={handleCPFChange}
            error={errors.cpf}
            required
            placeholder="000.000.000-00"
            maxLength="14"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="email@exemplo.com"
        />

        <Input
          label="Data de Nascimento"
          type="text"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleDateChange}
          error={errors.dataNascimento}
          placeholder="dd/mm/aaaa"
          maxLength="10"
        />

        <RadioGroup>
          <label htmlFor="fidelidade-sim">Deseja participar do programa de fidelidade? *</label>
          <div className="radio-options">
            <div className="radio-option">
              <input aria-label="Input field"
                type="radio"
                id="fidelidade-sim"
                name="participaFidelidade"
                value="sim"
                checked={formData.participaFidelidade === true}
                onChange={handleChange}
              />
              <span>Sim</span>
            </div>
            <div className="radio-option">
              <input aria-label="Input field"
                type="radio"
                id="fidelidade-nao"
                name="participaFidelidade"
                value="nao"
                checked={formData.participaFidelidade === false}
                onChange={handleChange}
              />
              <span>Não</span>
            </div>
          </div>
        </RadioGroup>

        <Input
          label="Observações"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          placeholder="Informações adicionais sobre o cliente"
        />

        <ConsentContainer>
          <label>
            <input aria-label="Input field"
              type="checkbox"
              name="consentimentoLgpd"
              checked={formData.consentimentoLgpd}
              onChange={handleChange}
            />
            <span>
              Eu li e concordo com a{" "}
              <Link to="/politica-de-privacidade">
                Política de Privacidade
              </Link>
              {" "}e autorizo o tratamento dos meus dados pessoais.
            </span>
          </label>
          {errors.consentimentoLgpd && <p>{errors.consentimentoLgpd}</p>}
        </ConsentContainer>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? <Spinner /> : "Salvar"}
          </Button>
        </ButtonGroup>
      </Form>
    </Card>
  )
}
