import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PoliticaContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const PoliticaCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: #007bff;
  color: white;
  padding: 30px;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
  }

  p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const Content = styled.div`
  padding: 40px;
  line-height: 1.6;
  color: #333;

  h2 {
    color: #007bff;
    margin: 30px 0 15px 0;
    font-size: 1.5rem;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
  }

  h3 {
    color: #495057;
    margin: 25px 0 10px 0;
    font-size: 1.2rem;
  }

  p {
    margin: 15px 0;
    text-align: justify;
  }

  ul {
    margin: 15px 0;
    padding-left: 30px;
  }

  li {
    margin: 8px 0;
  }

  .highlight {
    background: #e7f3ff;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid #007bff;
    margin: 20px 0;
  }

  .contact-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 30px 0;
  }
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin: 20px 40px 40px;
  font-size: 1rem;
  
  &:hover {
    background: #5a6268;
  }
`;

export const PoliticaPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <PoliticaContainer>
      <PoliticaCard>
        <Header>
          <h1>🛡️ Política de Privacidade</h1>
          <p>{BRAND.legalName} - Política de Privacidade</p>
        </Header>

        <Content>
          <div className="highlight">
            <strong>📅 Última atualização:</strong> 10 de outubro de 2025<br/>
            <strong>⚖️ Base legal:</strong> Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
          </div>

          <h2>1. Quem Somos</h2>
          <p>
            A <strong>{BRAND.legalName}</strong> é comprometida com a proteção 
            da privacidade e segurança dos dados pessoais dos nossos clientes.
          </p>

          <h2>2. Dados Coletados</h2>
          <ul>
            <li><strong>Dados de identificação:</strong> Nome, email, telefone, CPF</li>
            <li><strong>Dados opcionais:</strong> Data de nascimento, endereço</li>
            <li><strong>Dados de navegação:</strong> IP, logs de acesso, cookies</li>
          </ul>

          <h2>3. Finalidades</h2>
          <h3>Serviços Essenciais</h3>
          <ul>
            <li>✅ Processamento de pedidos e atendimento</li>
            <li>✅ Suporte ao cliente</li>
            <li>✅ Gestão de conta</li>
          </ul>

          <h3>Marketing (Com Consentimento)</h3>
          <ul>
            <li>📧 Ofertas especiais por email</li>
            <li>📱 Comunicação via SMS/WhatsApp</li>
            <li>🎯 Publicidade personalizada</li>
          </ul>

          <h2>4. Seus Direitos LGPD</h2>
          <ul>
            <li><strong>📋 Acesso:</strong> Saber quais dados temos</li>
            <li><strong>✏️ Correção:</strong> Corrigir dados incorretos</li>
            <li><strong>🗑️ Exclusão:</strong> Solicitar eliminação</li>
            <li><strong>📦 Portabilidade:</strong> Receber dados estruturados</li>
            <li><strong>🚫 Revogação:</strong> Retirar consentimento</li>
          </ul>

          <h2>5. Segurança</h2>
          <ul>
            <li>🔒 Criptografia SSL/TLS</li>
            <li>🛡️ Sistemas de autenticação</li>
            <li>📊 Monitoramento de segurança</li>
            <li>👥 Treinamento da equipe</li>
          </ul>

          <h2>6. Retenção de Dados</h2>
          <ul>
            <li>Dados de cadastro: até 5 anos após último contato</li>
            <li>Dados de consentimento: até revogação + 1 ano</li>
            <li>Logs de auditoria: 5 anos</li>
          </ul>

          <div className="contact-info">
            <h2>Contato</h2>
            <p><strong>Encarregado de Dados (DPO)</strong></p>
            <p>Email: {BRAND.lgpdEmail}</p>
            <p>Telefone: (11) 3456-7891</p>
            <p>Atendimento: Segunda a sexta, 8h às 18h</p>
            
            <div style={{marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '6px'}}>
              <strong>Portal LGPD:</strong>
              <a href="/lgpd/portal" style={{color: '#007bff', textDecoration: 'underline', marginLeft: '10px'}}>
                Exercer direitos de proteção de dados
              </a>
            </div>
          </div>
        </Content>

        <BackButton onClick={() => navigate(-1)}>
          ← Voltar
        </BackButton>
      </PoliticaCard>
    </PoliticaContainer>
  );
};

export default PoliticaPrivacidade;
