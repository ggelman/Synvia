import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Card } from "../components/Card"
import { BRAND } from "../config/branding"
import { synviaTheme } from "../styles/theme"

const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -20% -40%;
    background: radial-gradient(circle at 0% 0%, rgba(142, 194, 255, 0.3), transparent 45%),
                radial-gradient(circle at 100% 10%, rgba(91, 181, 162, 0.25), transparent 40%),
                radial-gradient(circle at 50% 85%, rgba(255, 255, 255, 0.15), transparent 55%);
    filter: blur(40px);
    z-index: -1;
  }
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  padding: 48px 40px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(239, 244, 249, 0.92));
  box-shadow: 0 24px 60px rgba(20, 31, 65, 0.18);
  backdrop-filter: blur(12px);
`

const Logo = styled.header`
  margin-bottom: 32px;
  text-align: center;

  .symbol {
    width: 88px;
    height: 88px;
    margin: 0 auto 18px;
    border-radius: 24px;
    background: ${props => props.theme.colors.gradientCard};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 16px 32px rgba(20, 27, 65, 0.18);
  }

  img {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }

  h1 {
    color: var(--synvia-space-cadet);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  p {
    color: var(--synvia-text-secondary);
    font-size: 14px;
    margin-top: 6px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;

  label {
    font-size: 13px;
    color: var(--synvia-text-secondary);
    font-weight: 500;
  }
`

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 14px;
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(218, 92, 92, 0.12);
  border: 1px solid rgba(218, 92, 92, 0.25);
  border-radius: 10px;
`

const SupportBox = styled.div`
  margin-top: 32px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(52, 127, 196, 0.12), rgba(91, 181, 162, 0.12));
  border-radius: 18px;
  border: 1px solid rgba(52, 127, 196, 0.18);

  h4 {
    color: var(--synvia-space-cadet);
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
  }

  div {
    font-size: 14px;
    color: var(--synvia-text-secondary);

    strong {
      color: var(--synvia-space-cadet);
    }

    span {
      color: var(--synvia-text-muted);
      font-family: ${props => props.theme.typography.mono};
    }
  }
`

const PrimaryButton = styled(Button)`
  background: var(--synvia-accent-primary) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 14px 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(52, 127, 196, 0.25);
  }
`

export const Login = () => {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [otp, setOtp] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [mfaStep, setMfaStep] = useState("password")
  const [mfaSecret, setMfaSecret] = useState("")
  const [mfaUrl, setMfaUrl] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  const qrCodeUrl = useMemo(() => {
    if (!mfaUrl) return ""
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaUrl)}`
  }, [mfaUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      const resultado = await login(email, senha, mfaStep !== "password" ? otp : undefined)

      if (resultado.success) {
        setOtp("")
        setMfaStep("password")
        navigate("/")
        return
      }

      if (resultado.mfaSetupRequired) {
        setMfaStep("setup")
        setMfaSecret(resultado.secret || "")
        setMfaUrl(resultado.otpauthUrl || "")
        setOtp("")
        setErro("Finalize a configuração do autenticador e informe o código gerado.")
        return
      }

      if (resultado.mfaRequired) {
        setMfaStep("challenge")
        setOtp("")
        setErro("Informe o código do autenticador para continuar.")
        return
      }

      if (resultado.error) {
        setErro(resultado.error)
        if (resultado.error.toLowerCase().includes("mfa")) {
          setMfaStep("challenge")
        }
      } else {
        setErro("Credenciais inválidas. Verifique e tente novamente.")
      }
    } catch (error) {
      setErro("Erro ao conectar com o Synvia Core. Confirme se o backend está ativo em http://localhost:8080.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <LoginWrapper>
      <LoginCard>
        <Logo>
          <div className="symbol">
            <img
              src="/assets/synvia-logo.svg"
              alt="Logo Synvia"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/images/logoSynvia-Photoroom.png"
              }}
            />
          </div>
          <h1>{BRAND.name}</h1>
          <p>{BRAND.tagline}</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email">E-mail corporativo</label>
            <Input
              id="login-email"
              type="email"
              placeholder="ex.: admin@synvia.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password">Senha</label>
            <Input
              id="login-password"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {mfaStep !== "password" && (
            <div>
              <label htmlFor="login-mfa">Código do autenticador</label>
              <Input
                id="login-mfa"
                type="text"
                placeholder="000 000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
              />
            </div>
          )}

          <PrimaryButton type="submit" disabled={carregando}>
            {carregando ? "Validando..." : mfaStep === "password" ? "Entrar" : "Confirmar"}
          </PrimaryButton>
        </Form>

        {erro && <ErrorMessage>{erro}</ErrorMessage>}

        {mfaStep === "setup" && (
          <SupportBox style={{ marginTop: 24 }}>
            <h4>Configuração MFA necessária</h4>
            <p style={{ fontSize: "14px", marginBottom: "12px" }}>
              Escaneie o QR Code no seu aplicativo de autenticação ou insira o código manual para habilitar a dupla autenticação.
            </p>
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code MFA"
                style={{ margin: "10px auto", display: "block", border: "1px solid #e5ebf5", borderRadius: "12px", padding: "10px", background: "white" }}
              />
            )}
            <p style={{ fontFamily: synviaTheme.typography.mono, fontSize: "16px", letterSpacing: "2px", color: "var(--synvia-text-primary)" }}>{mfaSecret}</p>
            <p style={{ fontSize: "13px", color: "var(--synvia-text-muted)", marginTop: "8px" }}>
              Após cadastrar, informe o código de 6 dígitos acima para finalizar o acesso.
            </p>
          </SupportBox>
        )}

        <SupportBox>
          <h4>Credenciais para demonstração</h4>
          <div>
            <strong>Administrador:</strong> <span>admin@synvia.io</span> / <span>admin123</span>
            <br />
            <small style={{ color: "var(--synvia-text-muted)" }}>MFA será solicitado após o primeiro login.</small>
          </div>
        </SupportBox>
      </LoginCard>
    </LoginWrapper>
  )
}


