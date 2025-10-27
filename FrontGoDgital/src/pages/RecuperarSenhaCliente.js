import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: #f7f7f7;
`;

const Box = styled.div`
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #2d2d2d;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const InfoMsg = styled.p`
  color: #2d2d2d;
  margin-bottom: 1rem;
  font-size: 0.98rem;
`;

const ErrorMsg = styled.p`
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 0.98rem;
`;

const RecuperarSenhaCliente = () => {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/recuperar-senha', { email });
      setInfo('Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
    } catch (err) {
      setError('Erro ao solicitar recuperação de senha. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <Container>
      <Box>
        <Title>Recuperar Senha</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Seu e-mail cadastrado"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          {info && <InfoMsg>{info}</InfoMsg>}
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instruções'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default RecuperarSenhaCliente;
