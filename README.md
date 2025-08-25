# GymConnect 🏋️‍♂️

Uma plataforma web completa para personal trainers gerenciarem seus alunos e treinos de forma simples e eficiente.

## ✨ Funcionalidades

### Para Personal Trainers:
- **Cadastro e Login**: Sistema de autenticação seguro
- **Gestão de Alunos**: Adicione, visualize e gerencie seus alunos
- **Criação de Treinos**: Crie treinos personalizados com exercícios detalhados
- **Códigos de Acesso**: Geração automática de códigos únicos para cada aluno
- **Dashboard Intuitivo**: Interface moderna e responsiva

### Para Alunos:
- **Acesso Simples**: Visualize treinos através de um código de acesso
- **Sem Cadastro**: Não é necessário criar conta
- **Treinos Detalhados**: Visualize exercícios, séries, repetições e observações
- **Interface Responsiva**: Funciona perfeitamente em dispositivos móveis

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS
- **Autenticação**: JWT + bcrypt
- **Banco de Dados**: SQLite (pode ser facilmente migrado para PostgreSQL/MySQL)
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd GymConnect
```

2. **Instale todas as dependências:**
```bash
npm run install-all
```

3. **Inicie o desenvolvimento:**
```bash
npm run dev
```

Isso iniciará tanto o servidor backend (porta 5000) quanto o frontend React (porta 3000).

## 🏗️ Estrutura do Projeto

```
GymConnect/
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor principal
│   └── package.json       # Dependências do backend
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Auth)
│   │   ├── App.tsx        # Componente principal
│   │   └── index.tsx      # Ponto de entrada
│   ├── public/            # Arquivos públicos
│   └── package.json       # Dependências do frontend
└── package.json           # Scripts principais
```

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=5000
JWT_SECRET=sua-chave-secreta-aqui
```

### Banco de Dados
O SQLite é configurado automaticamente. O arquivo `gymconnect.db` será criado na primeira execução.

## 📱 Como Usar

### 1. Cadastro de Personal Trainer
- Acesse `/register`
- Preencha nome, email e senha
- Faça login na plataforma

### 2. Adicionando Alunos
- No dashboard, clique em "Adicionar Aluno"
- Preencha as informações do aluno
- Um código de acesso único será gerado automaticamente

### 3. Criando Treinos
- Selecione um aluno
- Clique em "Criar Treino"
- Adicione exercícios com séries, repetições, peso e descanso
- Salve o treino

### 4. Alunos Acessando Treinos
- Alunos acessam `/student-access`
- Digitam o código fornecido pelo personal
- Visualizam todos os treinos criados para eles

## 🔒 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação JWT para rotas protegidas
- Validação de dados em todas as entradas
- Códigos de acesso únicos e seguros

## 🚀 Deploy

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Sirva os arquivos da pasta build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

## 🎯 Roadmap

- [ ] Sistema de notificações
- [ ] Histórico de treinos
- [ ] Métricas e progresso
- [ ] App mobile
- [ ] Integração com wearables
- [ ] Sistema de pagamentos

---

**GymConnect** - Conectando personal trainers e alunos de forma simples e eficiente! 💪
