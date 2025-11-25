# 🎉 ConectEvento
O **ConectEvento** é uma plataforma web inovadora que conecta organizadores de eventos a fornecedores de serviços, facilitando a busca, comparação e contratação de soluções essenciais para diferentes tipos de eventos, como casamentos, festas e reuniões corporativas.

Por meio de uma experiência ágil, eficiente e centralizada, a plataforma permite pesquisas personalizadas com base em critérios como tipo de evento, orçamento, localização e disponibilidade.

---

## 🔍 Visão Geral

### 🎯 Problema a Resolver
A organização de eventos no modelo tradicional enfrenta diversos desafios:
- Dificuldade na busca e comparação de fornecedores confiáveis
- Falta de centralização das informações sobre serviços
- Comunicação ineficiente entre organizadores e fornecedores
- Processo manual e demorado para solicitar orçamentos

### 🔹 Principais Funcionalidades
- **Cadastro e Perfis:** Criação de perfis completos para fornecedores com portfólio, serviços e preços
- **Pesquisa Avançada:** Filtros por localização, tipo de evento, faixa de preço e avaliações
- **Sistema de Avaliações:** Comentários e notas de clientes para fornecedores
- **Solicitação de Orçamentos:** Envio direto de solicitações com notificações automáticas
- **Roadmap Personalizado:** Guia dos fornecedores necessários para cada tipo de evento
- **Painel Administrativo:** Moderação de conteúdo e gerenciamento de usuários
---

## 🛠️ Tecnologias Utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

### 🎨 Front-end
- **Linguagem:** JavaScript / TypeScript
- **Framework:** React.js
- **Gerenciamento de Formulários:** React Hook Form
- **Estilização:** Tailwind CSS
- **Testes:** Jest

### 🖥️ Back-end
- **Linguagem:** JavaScript / TypeScript
- **Framework:** Node.js com Express
- **Arquitetura:** RESTful API seguindo padrão MVC
- **ORM:** Sequelize
- **Cache:** Redis para otimização de filtros
- **Testes:** Jest

### 🗄️ Banco de Dados
- **SGDB:** PostgreSQL
- **ORM:** Sequelize
- **Migrations:** Controle de versão do banco

### 🔒 Autenticação e Segurança
- **JWT (JSON Web Token)** com expiração e rotação de chaves
- **Hash de senhas:** bcrypt
- **Validação rigorosa** de CPF/CNPJ e dados de login
- **Prevenção de SQL Injection** com ORM
- **Configuração de CORS** e rate limiting

### ⚙️ DevOps e Ferramentas
- **Controle de versão:** GitHub
- **Gestão de projeto:** Jira
- **Containerização:** Docker
- **Testes de API:** Postman
- **CI/CD:** GitHub Actions
- **Hospedagem:** Aws Amplify (front-end) + AWS EC2, ECS e RDS (back-end)

---

## 🔐 Segurança do Projeto

A segurança é um dos pilares do **ConectEvento**. As práticas implementadas visam garantir a integridade da plataforma e a privacidade dos usuários:

### 🛡️ Medidas Implementadas
- **Proteção de Dados:** Hash bcrypt + armazenamento seguro
- **Validação Rigorosa:** Checagem em todas as entradas
- **Prevenção de Ataques:** Anti SQL Injection + CORS + Rate Limiting
- **Monitoramento:** Logs estruturados
- **Backups:** Automáticos semanais com testes de restauração
- **Testes de Segurança:** Análise de vulnerabilidades no CI/CD

## 🔗 Repositório Backend
 
**[ConectEvento Backend](https://github.com/WesllyHn/conectevento-backend)**

## 📄 Documentação do Projeto

📥 **[ConectEvento_final.pdf](https://github.com/user-attachments/files/23758077/ConectEvento_final.pdf)** - *Especificação técnica detalhada*


### 📚 Documentos Disponíveis
- Especificação de Requisitos
- Diagramas de Arquitetura (C4 Model)
- Casos de Uso UML
- Considerações de Segurança
- Stack Tecnológica Detalhada

---

## 👥 Sobre o Projeto

**Desenvolvido por:** Weslly Hendler Neres  
**Curso:** Engenharia de Software  
**Instituição:** Centro Universitário Católica de Santa Catarina - Joinville  
**Orientador:** Diogo Vinícius Winck

---

*ConectEvento - Em busca de Transformar a organização de eventos* ✨
