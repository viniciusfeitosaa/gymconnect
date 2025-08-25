# 🚀 Guia de Deploy - GymConnect no Netlify

## 📋 Pré-requisitos

- ✅ Conta no [Netlify](https://netlify.com) (gratuita)
- ✅ Conta no [Neon](https://neon.tech) (gratuita)
- ✅ Git configurado no projeto
- ✅ Node.js 16+ instalado

## 🗄️ Configurar Banco Neon

### 1. Acessar o Neon Dashboard
- Faça login em [neon.tech](https://neon.tech)
- Acesse seu projeto `neondb`

### 2. Executar o Schema SQL
- Vá para a aba "SQL Editor"
- Copie e cole o conteúdo de `database/schema.sql`
- Execute o script para criar as tabelas

### 3. Verificar a String de Conexão
```
postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🛠️ Configurar Projeto Local

### 1. Instalar Dependências
```bash
cd client
npm install
npm install -g netlify-cli
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na pasta `client/`:
```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret
JWT_SECRET=gymconnect_super_secret_jwt_key_2024

# Environment
NODE_ENV=development
```

### 3. Testar Localmente
```bash
npm run dev
```
Isso iniciará o Netlify Dev com suas funções locais.

## 🌐 Deploy no Netlify

### 1. Conectar ao Netlify
```bash
netlify login
```

### 2. Inicializar Projeto
```bash
netlify init
```
- Escolha "Create & configure a new site"
- Escolha sua equipe
- Escolha um nome para o site (ex: `gymconnect-app`)

### 3. Configurar Build Settings
No dashboard do Netlify, configure:
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Functions directory**: `netlify/functions`

### 4. Configurar Variáveis de Ambiente
No dashboard do Netlify, vá em **Site settings > Environment variables**:
```
DATABASE_URL = postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET = gymconnect_super_secret_jwt_key_2024
NODE_ENV = production
```

### 5. Deploy Automático
```bash
git add .
git commit -m "Configurar deploy Netlify"
git push origin main
```

O Netlify detectará automaticamente as mudanças e fará o deploy.

## 🔧 Estrutura do Projeto

```
client/
├── src/                    # Código React
├── netlify/
│   ├── functions/         # Netlify Functions
│   │   └── index.js      # API principal
│   └── netlify.toml      # Configuração Netlify
├── package.json
└── .env.local            # Variáveis locais
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth` - Login

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users` - Listar usuários

### Alunos
- `POST /api/students` - Criar aluno
- `GET /api/students` - Listar alunos
- `GET /api/students/:id` - Buscar aluno

### Treinos
- `POST /api/workouts` - Criar treino
- `GET /api/workouts` - Listar treinos
- `GET /api/workouts/:id` - Buscar treinos do aluno

## 🚨 Troubleshooting

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Confirme se o banco Neon está ativo
- Teste a conexão localmente primeiro

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme se o Node.js está na versão correta
- Limpe o cache: `npm run build -- --reset-cache`

### Erro de Functions
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o arquivo `netlify.toml` está correto
- Teste localmente com `netlify dev`

## 🔒 Segurança

### Em Produção:
- ✅ Use HTTPS (automático no Netlify)
- ✅ Configure CORS adequadamente
- ✅ Hash senhas com bcrypt
- ✅ Use JWT para autenticação
- ✅ Valide todas as entradas
- ✅ Implemente rate limiting

### Variáveis Sensíveis:
- ❌ Nunca commite `.env.local`
- ✅ Use variáveis de ambiente do Netlify
- ✅ Rotacione JWT_SECRET regularmente

## 📊 Monitoramento

### Logs
- Acesse **Functions > Logs** no dashboard Netlify
- Monitore erros e performance

### Métricas
- **Analytics** para tráfego
- **Functions** para uso de API
- **Forms** se implementar formulários

## 🎯 Próximos Passos

1. **Implementar autenticação JWT**
2. **Adicionar validação de dados**
3. **Implementar upload de imagens**
4. **Adicionar testes automatizados**
5. **Configurar CI/CD pipeline**

## 📞 Suporte

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Issues**: Abra uma issue no repositório

---

**🎉 Parabéns! Seu GymConnect está rodando no Netlify com banco Neon!**
