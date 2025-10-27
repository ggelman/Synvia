import { useState } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { Spinner } from "../components/Spinner"
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

export const CadastroProduto = () => {
  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    qtdAtual: "",
    qtdMinima: "",
    descricao: "",
    visivelCardapio: false,
    descricaoCardapio: "",
    imagemUrl: ""
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
    setSuccess(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome do produto é obrigatório"
    }

    if (!formData.preco || Number.parseFloat(formData.preco) <= 0) {
      newErrors.preco = "Preço deve ser maior que zero"
    }

    if (!formData.qtdAtual || Number.parseInt(formData.qtdAtual) < 0) {
      newErrors.qtdAtual = "Quantidade atual deve ser um número positivo"
    }

    if (!formData.qtdMinima || Number.parseInt(formData.qtdMinima) < 0) {
      newErrors.qtdMinima = "Quantidade mínima deve ser um número positivo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const produtoParaEnviar = {
        ...formData,
        preco: Number.parseFloat(formData.preco),
        qtdAtual: Number.parseInt(formData.qtdAtual),
        qtdMinima: Number.parseInt(formData.qtdMinima),
      };

      const response = await api.post('/produtos', produtoParaEnviar);

      console.log('Produto cadastrado com sucesso no backend:', response.data);
      setSuccess(true);
      setErrors({});

      setFormData({
        nome: "",
        preco: "",
        qtdAtual: "",
        qtdMinima: "",
        descricao: "",
        visivelCardapio: false,
        descricaoCardapio: "",
        imagemUrl: ""
      });
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error.response);
      setSuccess(false);

      if (error.response && error.response.status === 409) {
        setErrors({ nome: error.response.data });
      } else {
        setErrors({ form: 'Ocorreu um erro ao salvar o produto. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setFormData({
      nome: "",
      preco: "",
      qtdAtual: "",
      qtdMinima: "",
      descricao: "",
      visivelCardapio: false,
      descricaoCardapio: "",
      imagemUrl: ""
    })
    setErrors({})
    setSuccess(false)
  }

  return (
    <Card>
      <CardHeader>
        <h2>Cadastro de Produto</h2>
      </CardHeader>

      {success && <SuccessMessage>Produto cadastrado com sucesso!</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <Input
          label="Nome do Produto"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          error={errors.nome}
          required
          placeholder="Ex: Pão Francês"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Preço"
            type="number"
            step="0.01"
            min="0"
            name="preco"
            value={formData.preco}
            onChange={handleChange}
            error={errors.preco}
            required
            placeholder="0.00"
          />

          <Input
            label="Quantidade Atual"
            type="number"
            min="0"
            name="qtdAtual"
            value={formData.qtdAtual}
            onChange={handleChange}
            error={errors.qtdAtual}
            required
            placeholder="0"
          />
        </div>

        <Input
          label="Quantidade Mínima"
          type="number"
          min="0"
          name="qtdMinima"
          value={formData.qtdMinima}
          onChange={handleChange}
          error={errors.qtdMinima}
          required
          placeholder="0"
        />

        <Input
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descrição opcional do produto"
        />

        {/* Seção do Cardápio Digital */}
        <div style={{ 
          border: "1px solid #e0e0e0", 
          borderRadius: "8px", 
          padding: "16px", 
          marginTop: "16px",
          backgroundColor: "#f9f9f9"
        }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#333" }}>📱 Cardápio Digital</h4>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              <input
                type="checkbox"
                name="visivelCardapio"
                checked={formData.visivelCardapio}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  visivelCardapio: e.target.checked
                }))}
                style={{ transform: "scale(1.2)" }}
              />
              Exibir no cardápio digital para clientes
            </label>
          </div>

          {formData.visivelCardapio && (
            <>
              <Input
                label="Descrição para o Cardápio"
                name="descricaoCardapio"
                value={formData.descricaoCardapio}
                onChange={handleChange}
                placeholder="Descrição atrativa para o cardápio digital"
                style={{ marginBottom: "16px" }}
              />
              
              <Input
                label="URL da Imagem"
                name="imagemUrl"
                value={formData.imagemUrl}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem-produto.jpg"
                help="Link para imagem do produto (opcional)"
              />
            </>
          )}
        </div>

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
