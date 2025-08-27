# 🧪 **GUIA DE TESTE - Sistema Multi-Personal GymConnect**

## 📋 **Pré-requisitos**

1. **Backend rodando**: `node server.js` (porta 3001)
2. **Frontend rodando**: `npm start` (porta 3000)
3. **Dependências instaladas**: `bcryptjs`, `jsonwebtoken`

## 🔐 **Credenciais de Teste**

### **Personal Trainer João Silva**
- **Email**: `joao@academia.com`
- **Senha**: `Admin123!`

## 🚀 **Teste 1: Sistema de Autenticação**

### **1.1 Login do Personal**
1. Acesse `/login`
2. Use as credenciais acima
3. **Resultado esperado**: Login bem-sucedido, redirecionamento para `/dashboard`

### **1.2 Verificar Token JWT**
1. Abra DevTools → Application → Local Storage
2. Verifique se existe um `token` com formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Resultado esperado**: Token JWT válido armazenado

## 👥 **Teste 2: Sistema de Alunos**

### **2.1 Dashboard Stats**
1. Acesse `/dashboard`
2. **Resultado esperado**: 
   - Total de alunos: 3
   - Total de treinos: 3
   - Lista de alunos recentes: Ana, Carlos, Fernanda

### **2.2 Listar Alunos**
1. Acesse `/dashboard/students`
2. **Resultado esperado**: Apenas 3 alunos (Ana, Carlos, Fernanda)
3. **Verificar**: Todos pertencem ao João Silva

### **2.3 Criar Novo Aluno**
1. Acesse `/dashboard/students/new`
2. Preencha:
   - Nome: `Teste Aluno`
   - Código: `TEST001`
   - Observações: `Aluno de teste`
3. Clique em "Salvar Aluno"
4. **Resultado esperado**: Aluno criado, redirecionamento para lista
5. **Verificar**: Aluno aparece na lista com `personalId` correto

### **2.4 Excluir Aluno**
1. Na lista de alunos, clique no botão de excluir
2. Confirme a exclusão
3. **Resultado esperado**: Aluno removido da lista
4. **Verificar**: Dashboard stats atualizados

## 💪 **Teste 3: Sistema de Treinos**

### **3.1 Listar Treinos**
1. Acesse `/dashboard/workouts`
2. **Resultado esperado**: 3 treinos (Força Superior, Inferiores, Cardio)
3. **Verificar**: Todos vinculados aos alunos do João Silva

### **3.2 Criar Novo Treino**
1. Acesse `/dashboard/workouts/new`
2. Preencha:
   - Nome: `Treino Teste`
   - Descrição: `Treino para teste`
   - Aluno: Selecione um aluno existente
   - Adicione exercícios
3. Clique em "Salvar Treino"
4. **Resultado esperado**: Treino criado com sucesso
5. **Verificar**: Treino aparece na lista com `personalId` correto

### **3.3 Excluir Treino**
1. Na lista de treinos, clique no botão de excluir
2. Confirme a exclusão
3. **Resultado esperado**: Treino removido da lista

## 🔒 **Teste 4: Segurança e Isolamento**

### **4.1 Verificar Isolamento de Dados**
1. **Dashboard**: Deve mostrar apenas dados do João Silva
2. **Alunos**: Apenas alunos criados pelo João
3. **Treinos**: Apenas treinos criados pelo João

### **4.2 Verificar Middleware de Autenticação**
1. Tente acessar `/api/students` sem token
2. **Resultado esperado**: Erro 401 "Token de acesso necessário"

### **4.3 Verificar Filtragem por Personal**
1. Faça login como João
2. Crie um novo aluno
3. **Verificar**: Aluno só aparece para João, não para outros personais

## 📱 **Teste 5: Acesso de Alunos**

### **5.1 Acesso com Código Válido**
1. Acesse `/student-access`
2. Digite: `ANA001`
3. **Resultado esperado**: Redirecionamento para treinos da Ana

### **5.2 Verificar Treinos do Aluno**
1. Acesse `/student-workouts/ANA001`
2. **Resultado esperado**: Lista de treinos da Ana Beatriz
3. **Verificar**: Apenas treinos criados pelo João Silva

### **5.3 Acesso com Código Inválido**
1. Digite um código inexistente: `INVALID`
2. **Resultado esperado**: Erro 404 "Código de acesso inválido"

## 🧪 **Teste 6: Cenários de Erro**

### **6.1 Token Expirado**
1. Aguarde 24 horas (ou modifique o código para 1 minuto)
2. **Resultado esperado**: Erro 403 "Token inválido ou expirado"

### **6.2 Acesso Não Autorizado**
1. Tente excluir um aluno que não pertence ao personal
2. **Resultado esperado**: Erro 404 "Aluno não encontrado ou não autorizado"

### **6.3 Validações de Formulário**
1. Tente criar aluno sem nome
2. **Resultado esperado**: Erro de validação no frontend

## 📊 **Verificações Finais**

### **✅ Checklist de Funcionalidades**
- [ ] Login com JWT funcionando
- [ ] Dashboard mostrando dados corretos
- [ ] Alunos sendo criados com personalId correto
- [ ] Treinos sendo criados com personalId correto
- [ ] Filtragem de dados por personal funcionando
- [ ] Exclusão de dados verificando permissões
- [ ] Acesso de alunos funcionando
- [ ] Middleware de autenticação protegendo rotas

### **🔍 Verificações de Segurança**
- [ ] Senhas hasheadas com bcrypt
- [ ] Tokens JWT com expiração
- [ ] Rotas protegidas por autenticação
- [ ] Dados isolados por personal
- [ ] Validação de permissões em operações

## 🚨 **Problemas Comuns e Soluções**

### **Erro: "Token de acesso necessário"**
- **Causa**: Token não está sendo enviado no header
- **Solução**: Verificar se o login foi bem-sucedido e o token foi armazenado

### **Erro: "Token inválido ou expirado"**
- **Causa**: Token expirou ou é inválido
- **Solução**: Fazer login novamente

### **Dados não aparecem**
- **Causa**: Filtragem por personalId não está funcionando
- **Solução**: Verificar se o middleware está extraindo o `req.user.id` corretamente

### **Erro de CORS**
- **Causa**: Backend não está configurado para aceitar requisições do frontend
- **Solução**: Verificar se o `server.js` tem `app.use(cors())`

## 🎯 **Próximos Passos**

Após confirmar que todos os testes passaram:

1. **Implementar banco de dados PostgreSQL**
2. **Adicionar mais validações**
3. **Implementar sistema de recuperação de senha**
4. **Adicionar logs de auditoria**
5. **Implementar rate limiting**
6. **Adicionar testes automatizados**
