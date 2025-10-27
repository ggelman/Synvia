# goDigital Code! - Sistema de Gesto Full-Stack para Synvias

![Java](https://img.shields.io/badge/Java-17-blue) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green) ![React](https://img.shields.io/badge/React-18-blue) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

Sistema de gesto completo e robusto para micro e pequenas empresas, focado em otimizar operaes, fornecer inteligncia de negcio e garantir conformidade legal.

##  Conceito do Projeto

O goDigital Code! foi projetado para resolver os desafios centrais de gesto de pequenos negcios, como Synvias, que frequentemente dependem de processos manuais. A soluo centraliza o controle de vendas, estoque, clientes e finanas em uma plataforma nica, intuitiva e segura, transformando dados operacionais em insights estratgicos.

##  Funcionalidades Implementadas

O sistema  dividido em trs pilares de valor:

###  Gesto Operacional
- **Ponto de Venda (PDV):** Registro rpido de vendas com busca de produtos e clientes.
- **Gesto de Produtos e Categorias:** CRUD completo para o catlogo.
- **Controle de Estoque:** Ajustes de entrada/sada e alertas automticos de estoque baixo.
- **Gesto de Clientes:** Cadastro e gerenciamento da base de clientes.
- **Programa de Fidelidade:** Sistema de pontos integrado ao PDV.
- **Impresso de Cupons:** Gerao de recibos de venda.

###  Gesto Financeira e Estratgica
- **Dashboard Principal:** KPIs dirios (faturamento, n de vendas, produto mais vendido).
- **Dashboard Financeiro:** Anlise de Receitas, Despesas e Lucro com filtros por perodo.
- **Evoluo de Faturamento:** Grfico dinmico para anlise de performance.
- **Gesto de Despesas:** CRUD completo para lanamentos de sadas (custos, salrios, etc.).
- **Metas Financeiras:** Criao e acompanhamento de metas de faturamento.
- **Alertas Proativos:** Notificaes de aniversariantes do dia para aes de marketing.

###  Governana e Segurana
- **Autenticao e Autorizao:** Login seguro com Tokens JWT e controle de acesso baseado em perfis (Administrador, Gerente, Operador) via Spring Security.
- **Conformidade com LGPD:**
  - Coleta de consentimento explcito.
  - Funcionalidades para anonimizao (direito ao esquecimento) e portabilidade de dados.
  - Pgina de Poltica de Privacidade.
- **Backup e Restaurao:** Sistema completo para criar backups (download de JSON) e restaurar o estado do sistema.
- **Auditoria:** Log persistente de aes crticas (edio, anonimizao, etc.) para rastreabilidade.

##  Arquitetura e Tecnologias

A aplicao segue uma arquitetura moderna e desacoplada, com um backend robusto servindo uma API RESTful para um frontend dinmico.

| Camada | Tecnologia/Framework | Justificativa |
| :--- | :--- | :--- |
| **Backend** | **Java 17 + Spring Boot 3** | Ecossistema maduro, seguro e performtico, ideal para aplicaes de negcio crticas. |
| | **Spring Security + JWT** | Padro de mercado para autenticao e autorizao, garantindo segurana robusta. |
| | **Spring Data JPA / Hibernate** | Alta produtividade e abstrao para a persistncia de dados. |
| **Frontend** | **React 18 + React Router** | Criao de interfaces de usurio reativas e dinmicas, com excelente experincia do dev. |
| | **Styled Components** | Estilizao componentizada e organizada, mantendo o escopo do CSS. |
| | **Axios** | Cliente HTTP robusto e padronizado para a comunicao com a API. |
| | **Recharts** | Biblioteca declarativa para a criao de grficos interativos e visualmente agradveis. |
| **Banco de Dados** | **MySQL 8.0** | Banco de dados relacional confivel, performtico e amplamente utilizado no mercado. |

##  Como Executar o Projeto

### Pr-requisitos
-   Java JDK 17+
-   Apache Maven 3.8+
-   Node.js 18+
-   MySQL Server 8.0

### 1. Configurao do Backend
```bash
# Clone o repositrio
git clone [URL_DO_SEU_REPOSITORIO]

# Navegue at a pasta do backend
cd ./synvia-core

# Configure o application.properties
# Abra src/main/resources/application.properties e ajuste as credenciais do seu banco de dados MySQL:
# spring.datasource.url=jdbc:mysql://localhost:3306/sua_database
# spring.datasource.username=seu_usuario
# spring.datasource.password=sua_senha
# E a pasta para os backups:
# backup.storage.location=C:/caminho/para/backups

# Compile e execute a aplicao
mvn spring-boot:run
```
O backend estar rodando em `http://localhost:8080`.

### 2. Configurao do Frontend
```bash
# Em um novo terminal, navegue at a pasta do frontend
cd ../FrontGoDgital # (Ajuste o nome da pasta se necessrio)

# Instale as dependncias
npm install

# Inicie o servidor de desenvolvimento
npm start
```
A aplicao estar acessvel em `http://localhost:3000`.

###  Credenciais de Teste
-   **Email:** `admin@synvia.io`
-   **Senha:** `admin123` 

##  Prximos Passos (Roadmap Futuro)
-   [ ] Implementar agendamento de backups (Scheduler).
-   [ ] Desenvolver um mdulo de gesto de fornecedores.
-   [ ] Criar painel de KPIs de performance de funcionrios.
-   [ ] Expandir o mdulo de IA para previso de demanda de produtos.


