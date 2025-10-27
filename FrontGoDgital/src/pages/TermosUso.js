import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const TermosContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const TermosCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: #28a745;
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
    color: #28a745;
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
    background: #fff3cd;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid #ffc107;
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

export const TermosUso = () => {
  const navigate = useNavigate();

  return (
    <TermosContainer>
      <TermosCard>
        <Header>
          <h1>🥖 Termos de Uso</h1>
          <p>{BRAND.legalName} - Termos de Uso</p>
        </Header>

        <Content>
          <div className="highlight">
            <strong>Última atualização:</strong> 10 de outubro de 2025<br/>
            <strong>Data de vigência:</strong> 10 de outubro de 2025
          </div>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o cardápio digital da {BRAND.legalName} através do QR Code, 
            você concorda em ficar vinculado a estes Termos de Uso. Se você não concordar com 
            qualquer parte destes termos, não deve usar nosso serviço.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            O cardápio digital é uma plataforma que permite aos clientes:
          </p>
          <ul>
            <li>Visualizar produtos disponíveis na plataforma</li>
            <li>Acessar informações detalhadas sobre produtos</li>
            <li>Registrar preferências pessoais (mediante consentimento)</li>
            <li>Exercer direitos relacionados à proteção de dados (LGPD)</li>
          </ul>

          <h2>3. Cadastro e Conta de Usuário</h2>
          <h3>3.1. Informações Necessárias</h3>
          <p>
            Para usar alguns recursos do serviço, você pode precisar fornecer:
          </p>
          <ul>
            <li>Nome completo</li>
            <li>Email válido</li>
            <li>Telefone para contato</li>
            <li>CPF (para identificação única)</li>
            <li>Data de nascimento (opcional)</li>
          </ul>

          <h3>3.2. Veracidade das Informações</h3>
          <p>
            Você se compromete a fornecer informações verdadeiras, precisas e atualizadas. 
            É sua responsabilidade manter suas informações atualizadas.
          </p>

          <h2>4. Uso Aceitável</h2>
          <p>
            Você concorda em usar o serviço apenas para:
          </p>
          <ul>
            <li>Finalidades legais e legítimas</li>
            <li>Consultar informações sobre produtos</li>
            <li>Exercer seus direitos de proteção de dados</li>
          </ul>

          <h3>4.1. Condutas Proibidas</h3>
          <p>É expressamente proibido:</p>
          <ul>
            <li>Tentar acessar sistemas não autorizados</li>
            <li>Usar o serviço para fins comerciais não autorizados</li>
            <li>Interferir no funcionamento normal do sistema</li>
            <li>Fornecer informações falsas ou enganosas</li>
          </ul>

          <h2>5. Proteção de Dados (LGPD)</h2>
          <p>
            O tratamento dos seus dados pessoais está detalhado em nossa 
            <a href="/politica-privacidade" style={{color: '#28a745', textDecoration: 'underline'}}>
              Política de Privacidade
            </a>, que faz parte integrante destes termos.
          </p>

          <h2>6. Propriedade Intelectual</h2>
          <p>
            Todos os conteúdos do cardápio digital, incluindo textos, imagens, design e 
            funcionalidades, são propriedade da {BRAND.legalName} e estão protegidos 
            por leis de propriedade intelectual.
          </p>

          <h2>7. Limitação de Responsabilidade</h2>
          <p>
            A {BRAND.legalName} não se responsabiliza por:
          </p>
          <ul>
            <li>Interrupções temporárias do serviço</li>
            <li>Problemas de conectividade de internet</li>
            <li>Uso indevido das informações por terceiros não autorizados</li>
          </ul>

          <h2>8. Modificações dos Termos</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento. 
            As alterações entrarão em vigor imediatamente após a publicação. 
            O uso continuado do serviço após modificações constitui aceitação dos novos termos.
          </p>

          <h2>9. Cancelamento e Exclusão</h2>
          <p>
            Você pode solicitar a exclusão dos seus dados a qualquer momento através do 
            portal LGPD. A {BRAND.legalName} também se reserva o direito de 
            suspender contas que violem estes termos.
          </p>

          <h2>10. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis brasileiras, incluindo:
          </p>
          <ul>
            <li>Lei Geral de Proteção de Dados (Lei 13.709/2018)</li>
            <li>Marco Civil da Internet (Lei 12.965/2014)</li>
            <li>Código de Defesa do Consumidor (Lei 8.078/1990)</li>
          </ul>

          <div className="contact-info">
            <h2>📞 Contato e Suporte</h2>
            <p><strong>{BRAND.legalName}</strong></p>
            <p>📧 Email: contato@plataformasantamarcelina.com.br</p>
            <p>📱 Telefone: (11) 3456-7890</p>
            <p>🏢 Endereço: Rua das Delícias, 123 - São Paulo, SP</p>
            <p>🕒 Horário de Atendimento: Segunda a Sexta, 8h às 18h</p>
            
            <div style={{marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '6px'}}>
              <strong>🛡️ Encarregado de Dados (DPO)</strong><br/>
              Email: lgpd@plataformasantamarcelina.com.br<br/>
              Para exercer seus direitos LGPD e proteção de dados
            </div>
          </div>
        </Content>

        <BackButton onClick={() => navigate(-1)}>
          ← Voltar
        </BackButton>
      </TermosCard>
    </TermosContainer>
  );
};

export default TermosUso;