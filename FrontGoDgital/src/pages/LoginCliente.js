import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: #f7f7f7;
`;

const LoginBox = styled.div`
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

const ErrorMsg = styled.p`
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 0.98rem;
`;

const LinkRecuperarSenha = styled.a`
  display: block;
  margin-top: 1rem;
  color: #007bff;
  text-align: right;
  font-size: 0.98rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: #0056b3;
  }
`;

const LoginCliente = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      if (response.status === 200) {
        localStorage.setItem('accessToken', response.data.accessToken);
        navigate('/dashboard');
      } else {
        setError('Email ou senha inválidos.');
      }
    } catch (err) {
      setError('Email ou senha inválidos.');
    }
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Login do Cliente</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <LinkRecuperarSenha href="/cliente/recuperar-senha">Esqueceu a senha?</LinkRecuperarSenha>
        </form>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginCliente;
