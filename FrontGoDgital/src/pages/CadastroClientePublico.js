import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import api from '../services/api';
import { BRAND } from '../config/branding';

const ClienteContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--synvia-background) 0%, rgba(20, 27, 65, 0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const WelcomeCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
`;

const LogoBrand = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: var(--synvia-space-cadet);
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }
  
  p {
    color: var(--synvia-text-muted);
    font-size: 1.1rem;
    margin: 10px 0 0 0;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const ConsentimentoSection = styled.div`
  background: var(--synvia-surface-alt);
  border: 1px solid var(--synvia-border);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const ConsentimentoTitle = styled.h3`
  color: var(--synvia-text-primary);
  font-size: 1.2rem;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: "🛡️";
    font-size: 1.3rem;
  }
`;

const ConsentimentoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
  padding: 12px;
  background: var(--synvia-surface);
  border-radius: 6px;
  border: 1px solid var(--synvia-border);
  
  input[type="checkbox"] {
    margin-top: 2px;
    min-width: 18px;
    min-height: 18px;
  }
`;

const ConsentimentoText = styled.div`
  flex: 1;
  
  strong {
    color: var(--synvia-text-primary);
    display: block;
    margin-bottom: 4px;
  }
  
  small {
    color: var(--synvia-text-muted);
    line-height: 1.4;
  }
  
  &.obrigatorio {
    opacity: 0.7;
    
    strong:after {
      content: " (Obrigatório)";
      color: #dc3545;
      font-size: 0.8em;
    }
  }
`;

const TermosSection = styled.div`
  background: #e8f4f8;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #0c5460;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 30px;
  
  button[type="submit"] {
    background: #28a745 !important;
    
    &:hover {
      background: #218838 !important;
    }
    
    &:disabled {
      background: #6c757d !important;
    }
  }
  
  button[type="button"] {
    background: #6c757d;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #c3e6cb;
`;

const QRCodeInfo = styled.div`
  text-align: center;
  margin-bottom: 25px;
  padding: 15px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border-radius: 10px;
  border: 2px dashed #6c757d;
  
  p {
    margin: 0;
    color: var(--synvia-text-primary);
    font-size: 1rem;
  }
  
  .qr-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const OpcionalLabel = styled.span`
  color: #888;
  font-size: 0.85em;
  margin-left: 6px;
`;

export const CadastroClientePublico = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    senha: '',
    confirmarSenha: ''
  });

  const [consentimentos, setConsentimentos] = useState({
    servicoEssencial: true, // Obrigatório
    marketingEmail: false,
    marketingSMS: false,
    analisesPersonalizadas: false,
    compartilhamentoTerceiros: false,
    cookiesAnalytics: false
  });

  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Recuperar dados salvos ao voltar das páginas de políticas
  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem('cadastroClienteTemp');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        setFormData(prev => ({ ...prev, ...dados }));
        setConsentimentos(prev => ({ ...prev, ...dados.consentimentos || {} }));
      } catch (error) {
        console.error('Erro ao recuperar dados temporários:', error);
      }
    }
  }, []);

  // Salvar dados temporariamente ao navegar para políticas
  const salvarDadosTemporarios = () => {
    const dadosTemp = {
      ...formData,
      consentimentos
    };
    sessionStorage.setItem('cadastroClienteTemp', JSON.stringify(dadosTemp));
  };

  // Limpar dados temporários após cadastro bem-sucedido
  const limparDadosTemporarios = () => {
    sessionStorage.removeItem('cadastroClienteTemp');
  };

  // Função para formatação de CPF
  const formatarCPF = (cpf) => {
    // Remove todos os caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');

    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  // Função para formatação de data
  const formatarData = (data) => {
    // Remove todos os caracteres não numéricos
    const numbers = data.replace(/\D/g, '');

    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para formatação de CEP
  const formatarCEP = (cep) => {
    const numbers = cep.replace(/\D/g, '');

    // Aplica a máscara XXXXX-XXX
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  // Função para buscar endereço por CEP
  const buscarEnderecoPorCEP = async (cep) => {
    const cepNumbers = cep.replace(/\D/g, '');

    if (cepNumbers.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Formatação de CPF
    if (name === 'cpf') {
      const cpfFormatado = formatarCPF(value);
      setFormData(prev => ({
        ...prev,
        [name]: cpfFormatado
      }));
      return;
    }

    // Formatação de data de nascimento
    if (name === 'dataNascimento') {
      // Se o valor está em formato ISO (yyyy-mm-dd), converter para dd/mm/yyyy
      if (value.includes('-') && value.length === 10) {
        const [year, month, day] = value.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        setFormData(prev => ({
          ...prev,
          [name]: formattedDate
        }));
        return;
      } else {
        // Formatação manual enquanto digita
        const dataFormatada = formatarData(value);
        setFormData(prev => ({
          ...prev,
          [name]: dataFormatada
        }));
        return;
      }
    }

    // Formatação de CEP e busca automática
    if (name === 'cep') {
      const cepFormatado = formatarCEP(value);
      setFormData(prev => ({
        ...prev,
        [name]: cepFormatado
      }));

      // Buscar endereço automaticamente quando CEP estiver completo
      if (cepFormatado.length === 9) {
        buscarEnderecoPorCEP(cepFormatado);
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConsentimentoChange = (key) => {
    if (key === 'servicoEssencial') return; // Não pode ser alterado

    setConsentimentos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const validarCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;

    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    return true;
  };

  const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(senha);
  };

  const validarFormulario = () => {
    const { nome, email, telefone, cpf, numero, endereco } = formData;

    if (!nome.trim()) {
      alert('Nome é obrigatório');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      alert('Email válido é obrigatório');
      return false;
    }

    if (!telefone.trim()) {
      alert('Telefone é obrigatório');
      return false;
    }

    if (!cpf.trim() || !validarCPF(cpf)) {
      alert('CPF válido é obrigatório');
      return false;
    }

    if (!!endereco && !numero.trim()) {
      alert('Número do endereço é obrigatório se endereço for preenchido');
      return false;
    }

    if (!senha || !validarSenha(senha)) {
      alert('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.');
      return false;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return false;
    }

    if (!aceitouTermos) {
      alert('Você deve aceitar os termos de uso e política de privacidade');
      return false;
    }

    // Verificar se o consentimento obrigatório foi dado
    if (!consentimentos.servicoEssencial) {
      alert('O consentimento para serviços essenciais é obrigatório para realizar o cadastro');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      const dataParaEnvio = { ...formData };
      if (dataParaEnvio.dataNascimento && dataParaEnvio.dataNascimento.includes('/')) {
        const [dia, mes, ano] = dataParaEnvio.dataNascimento.split('/');
        if (dia && mes && ano && ano.length === 4) {
          dataParaEnvio.dataNascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }

      const clienteData = {
        nome: dataParaEnvio.nome,
        telefone: dataParaEnvio.telefone,
        email: dataParaEnvio.email,
        cpf: dataParaEnvio.cpf,
        dataNascimento: dataParaEnvio.dataNascimento,
        senha: dataParaEnvio.senha, 
        observacoes: '',
        participaFidelidade: false,
        consentimentoLgpd: consentimentos.servicoEssencial
      };

      const clienteResponse = await api.post('/clientes/publico', clienteData);
      const clienteId = clienteResponse.data.id;

      for (const [finalidade, consentimento] of Object.entries(consentimentos)) {
        if (consentimento) {
          await api.post('/api/public/lgpd/consentimento', {
            usuarioId: clienteId,
            finalidade: finalidade.toUpperCase(),
            consentimento,
            ipOrigem: window.location.hostname
          });
        }
      }

      await api.post('/api/auditoria/log', {
        usuarioId: clienteId,
        acao: 'CADASTRO_CLIENTE_PUBLICO',
        detalhes: 'Cliente cadastrado via QR Code com consentimentos LGPD',
        ipOrigem: window.location.hostname
      });

      limparDadosTemporarios();
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/cliente/verificar-email', {
          state: { email: formData.email, clienteId }
        });
      }, 5000);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.includes('CPF')) {
        alert('Já existe um cliente cadastrado com o CPF informado.');
      } else {
        alert('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <ClienteContainer>
        <WelcomeCard>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📧</div>
            <SuccessMessage>
              <h2 style={{ margin: '0 0 15px 0', color: '#155724' }}>
                Cadastro realizado com sucesso!
              </h2>
              <p style={{ margin: '0 0 20px 0', color: '#155724', fontSize: '1.1rem' }}>
                Um e-mail de verificação foi enviado para <strong>{formData.email}</strong>
              </p>
              <p style={{ margin: '0', color: '#6c757d' }}>
                Por favor, verifique sua caixa de entrada e confirme seu e-mail para ativar sua conta.
                <br />
                Redirecionando em alguns segundos...
              </p>
            </SuccessMessage>
            <div style={{ marginTop: '20px', color: '#6c757d' }}>
              <p>✓ Seus dados foram registrados com segurança</p>
              <p>✓ Consentimentos LGPD registrados</p>
              <p>📧 E-mail de verificação enviado</p>
            </div>
          </div>
        </WelcomeCard>
      </ClienteContainer>
    );
  }

  return (
    <ClienteContainer>
      <WelcomeCard>
        <CardHeader>
          <LogoBrand>
            <h1>{BRAND.name}</h1>
            <p>{BRAND.tagline}</p>
          </LogoBrand>

          {/* Seção de Login para Clientes Existentes */}
          <div style={{
            background: '#e8f4f8',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#0c5460' }}>
              <strong>Já é cliente?</strong>
            </p>
            <Button
              type="button"
              style={{
                background: '#0056b3',
                fontSize: '0.9rem',
                padding: '8px 16px'
              }}
              onClick={() => {
                salvarDadosTemporarios();
                navigate('/cliente/login');
              }}
            >
              Fazer Login
            </Button>
          </div>

          <QRCodeInfo>
            <div className="qr-icon">📱</div>
            <p>Você acessou através do QR Code da mesa</p>
          </QRCodeInfo>
        </CardHeader>

        <div style={{ padding: '0 30px 30px' }}>
          <Form onSubmit={handleSubmit}>
            <h2 style={{ color: '#495057', marginBottom: '20px' }}>
              Complete seu cadastro para continuar
            </h2>

            <Input
              label="Nome Completo"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu-email@exemplo.com"
              required
            />

            <Input
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
              required
            />

            <Input
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
              placeholder="000.000.000-00"
              required
            />

            <Input
              label={<span>Data de Nascimento <OpcionalLabel>(opcional)</OpcionalLabel></span>}
              name="dataNascimento"
              type="text"
              value={formData.dataNascimento}
              onChange={handleInputChange}
              placeholder="dd/mm/aaaa"
              maxLength="10"
            />

            <Input
              label={<span>CEP <OpcionalLabel>(opcional)</OpcionalLabel></span>}
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
              placeholder="00000-000"
              maxLength="9"
            />

            <Input
              label={<span>Endereço <OpcionalLabel>(opcional)</OpcionalLabel></span>}
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              placeholder="Rua/Avenida (preenchido automaticamente)"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <Input
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="123"
                required={!!formData.endereco}
              />
              <Input
                label={<span>Complemento <OpcionalLabel>(opcional)</OpcionalLabel></span>}
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                placeholder="Apto 45, Bloco B, etc."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label={<span>Bairro <OpcionalLabel>(opcional)</OpcionalLabel></span>}
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                placeholder="Bairro (preenchido automaticamente)"
              />
              <Input
                label={<span>Cidade <OpcionalLabel>(opcional)</OpcionalLabel></span>}
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Cidade (preenchido automaticamente)"
              />
            </div>

            <Input
              label={<span>Observações <OpcionalLabel>(opcional)</OpcionalLabel></span>}
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              as="textarea"
              rows={2}
              placeholder="Preferências, restrições alimentares, etc."
            />

            <Input
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="Digite sua senha"
              required
            />

            <Input
              label="Confirmar Senha"
              name="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              placeholder="Confirme sua senha"
              required
            />

            {/* Seção de Consentimentos LGPD */}
            <ConsentimentoSection>
              <ConsentimentoTitle>
                Gestão de Privacidade e Consentimentos
              </ConsentimentoTitle>

              <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '0.9rem' }}>
                Conforme a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento
                para algumas formas de uso dos seus dados:
              </p>

              <ConsentimentoItem>
                <input
                  type="checkbox"
                  checked={consentimentos.servicoEssencial}
                  disabled
                />
                <ConsentimentoText className="obrigatorio">
                  <strong>Serviços Essenciais</strong>
                  <small>
                    Processamento de pedidos, atendimento ao cliente e gestão da conta.
                    Base legal: execução de contrato.
                  </small>
                </ConsentimentoText>
              </ConsentimentoItem>

              <ConsentimentoItem>
                <input
                  type="checkbox"
                  checked={consentimentos.marketingEmail}
                  onChange={() => handleConsentimentoChange('marketingEmail')}
                />
                <ConsentimentoText>
                  <strong>Marketing por Email</strong>
                  <small>
                    Receber ofertas especiais, novidades e promoções por email.
                    Você pode revogar a qualquer momento.
                  </small>
                </ConsentimentoText>
              </ConsentimentoItem>

              <ConsentimentoItem>
                <input
                  type="checkbox"
                  checked={consentimentos.marketingSMS}
                  onChange={() => handleConsentimentoChange('marketingSMS')}
                />
                <ConsentimentoText>
                  <strong>Marketing por SMS</strong>
                  <small>
                    Receber ofertas e avisos importantes via SMS/WhatsApp.
                  </small>
                </ConsentimentoText>
              </ConsentimentoItem>

              <ConsentimentoItem>
                <input
                  type="checkbox"
                  checked={consentimentos.analisesPersonalizadas}
                  onChange={() => handleConsentimentoChange('analisesPersonalizadas')}
                />
                <ConsentimentoText>
                  <strong>Análises Personalizadas</strong>
                  <small>
                    Usar IA para analisar suas preferências e sugerir produtos personalizados.
                  </small>
                </ConsentimentoText>
              </ConsentimentoItem>

              <ConsentimentoItem>
                <input
                  type="checkbox"
                  checked={consentimentos.cookiesAnalytics}
                  onChange={() => handleConsentimentoChange('cookiesAnalytics')}
                />
                <ConsentimentoText>
                  <strong>Cookies de Analytics</strong>
                  <small>
                    Melhorar a experiência do site através de análise de navegação.
                  </small>
                </ConsentimentoText>
              </ConsentimentoItem>
            </ConsentimentoSection>

            {/* Termos de Uso */}
            <TermosSection>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <p style={{ margin: 0 }}>
                    Li e aceito os{' '}
                    <a
                      href="/termos-uso"
                      style={{ color: '#0056b3', textDecoration: 'underline' }}
                      onClick={salvarDadosTemporarios}
                    >
                      Termos de Uso
                    </a>
                    {' '}e a{' '}
                    <a
                      href="/politica-privacidade"
                      style={{ color: '#0056b3', textDecoration: 'underline' }}
                      onClick={salvarDadosTemporarios}
                    >
                      Política de Privacidade
                    </a>
                    {' '}da {BRAND.legalName}. *
                  </p>
                </div>
              </div>
            </TermosSection>

            <ButtonGroup>
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.history.back()}
                style={{ flex: 1 }}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={loading || !aceitouTermos}
                style={{ flex: 2 }}
              >
                {loading ? <Spinner size="small" /> : 'Continuar para o Cardápio'}
              </Button>
            </ButtonGroup>
          </Form>
        </div>
      </WelcomeCard>
    </ClienteContainer>
  );
};
