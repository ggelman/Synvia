import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SecurityAlertsProvider } from './components/security/SecurityAlertsProvider';
import { ThemeWrapper } from './styles/GlobalStyles';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DashboardFinanceiro } from './pages/DashboardFinanceiro';
import { NovaVenda } from './pages/NovaVenda';
import { HistoricoVendas } from './pages/HistoricoVendas';
import { CadastroProduto } from './pages/CadastroProduto';
import { CategoriasProdutos } from './pages/CategoriasProdutos';
import { CadastroCliente } from './pages/CadastroClientes';
import { GerenciamentoClientes } from './pages/GerenciamentoClientes';
import { GestaoEstoque } from './pages/GestaoEstoque';
import { GerenciamentoUsuarios } from './pages/GerenciamentoUsuarios';
import { SistemaBackup } from './pages/SistemaBackup';
import { Relatorios } from './pages/Relatorios';
import MonitorSegurancaPage from './pages/MonitorSegurancaPage';
import { PrevisaoIA } from './pages/PrevisaoIA';
import { ChatIA } from './pages/ChatIA';
import { CadastroClientePublico } from './pages/CadastroClientePublico';
import { CardapioDigital } from './pages/CardapioDigital';
import { PagamentoCliente } from './pages/PagamentoCliente';
import { PortalDireitosLGPD } from './pages/PortalDireitosLGPD';
import TermosUso from './pages/TermosUso';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import PortalDireitosTitular from './components/PortalDireitosTitular';
import AcessoQRCode from './pages/AcessoQRCode';
import DashboardAuditoria from './pages/DashboardAuditoria';
import LoginCliente from './pages/LoginCliente';
import RecuperarSenhaCliente from './pages/RecuperarSenhaCliente';

function App() {
  return (
    <ThemeWrapper>
      <AuthProvider>
        <SecurityAlertsProvider>
          <Router>
            <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Dashboard Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/financeiro" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardFinanceiro />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/auditoria" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardAuditoria />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Vendas Routes */}
              <Route 
                path="/vendas/nova" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <NovaVenda />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendas/historico" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <HistoricoVendas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Produtos Routes */}
              <Route 
                path="/produtos/novo" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CadastroProduto />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/produtos/categorias" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CategoriasProdutos />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Clientes Routes */}
              <Route 
                path="/clientes/novo" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CadastroCliente />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clientes" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GerenciamentoClientes />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Estoque Route */}
              <Route 
                path="/estoque" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GestaoEstoque />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/usuarios" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GerenciamentoUsuarios />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backup" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SistemaBackup />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Relatorios />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/security" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MonitorSegurancaPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* IA Routes */}
              <Route 
                path="/ia/previsao" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PrevisaoIA />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ia/chat" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ChatIA />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas Públicas para Clientes (LGPD - Fase 6) */}
              <Route path="/qr" element={<AcessoQRCode />} />
              <Route path="/cliente/cadastro" element={<CadastroClientePublico />} />
              <Route path="/cliente/cardapio" element={<CardapioDigital />} />
              <Route path="/cliente/pagamento" element={<PagamentoCliente />} />
              <Route path="/cliente/direitos-lgpd" element={<PortalDireitosLGPD />} />
              <Route path="/lgpd/portal" element={<PortalDireitosTitular />} />
              
              {/* Páginas Legais */}
              <Route path="/termos-uso" element={<TermosUso />} />
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              
              {/* Redirect legacy routes */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/vendas" element={<Navigate to="/vendas/nova" replace />} />
              <Route path="/produtos" element={<Navigate to="/produtos/novo" replace />} />
              <Route 
                path="/cliente/login" 
                element={<LoginCliente />} 
              />
              <Route 
                path="/cliente/recuperar-senha" 
                element={<RecuperarSenhaCliente />} 
              />
            </Routes>
          </div>
        </Router>
      </SecurityAlertsProvider>
    </AuthProvider>
  </ThemeWrapper>
);
}

export default App;
