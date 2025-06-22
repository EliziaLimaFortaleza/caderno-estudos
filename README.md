# 📚 Caderno de Estudos

Uma aplicação completa para gerenciar seus estudos, revisões e caderno de erros, desenvolvida com React, TypeScript, Tailwind CSS e Firebase.

## ✨ Funcionalidades

### 🔹 Cadastro de Estudo
- ✅ Cadastro de novos registros de estudo (Concurso, Cargo, Matéria, Assunto)
- ✅ Edição e exclusão de registros
- ✅ Listagem organizada dos estudos

### 🔹 Revisão de Conteúdo
- ✅ Marcar estudos para revisão
- ✅ Controle de datas de estudo e revisão
- ✅ Listagem de revisões pendentes com ordenação por data
- ✅ Alertas de atraso nas revisões

### 🔹 Painel de Desempenho
- ✅ Estatísticas completas (total de assuntos, revisões, taxa de acerto)
- ✅ Desempenho por matéria
- ✅ Gráficos e indicadores visuais

### 🔹 Caderno de Erros
- ✅ Cadastro manual de questões
- ✅ Associação de questões a assuntos
- ✅ Comentários pessoais sobre questões
- ✅ Controle de acertos/erros
- ✅ Visualização e refazimento de questões

### 🔹 Sistema de Autenticação
- ✅ Login e cadastro de usuários
- ✅ Autenticação segura com Firebase

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Build Tool**: Create React App

## 🚀 Como Configurar

### 1. Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Firebase

### 2. Configuração do Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative a autenticação por email/senha
4. Crie um banco Firestore
5. Obtenha as credenciais do projeto

### 3. Configuração da Aplicação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd caderno-estudos
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
   - Abra o arquivo `src/firebase.ts`
   - Substitua as configurações pelas suas credenciais do Firebase:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};
```

4. Execute a aplicação:
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📱 Como Usar

### 1. Primeiro Acesso
- Crie uma conta com email e senha
- Faça login na aplicação

### 2. Cadastrando Estudos
- Vá para a aba "Novo Estudo"
- Preencha: Concurso, Cargo, Matéria e Assunto
- Clique em "Criar Estudo"

### 3. Gerenciando Revisões
- Na lista de estudos, clique em "Marcar para Revisar"
- As revisões aparecerão na aba "Revisões"
- Marque como "Concluída" quando revisar

### 4. Caderno de Erros
- Vá para a aba "Caderno de Erros"
- Clique em "Nova Questão"
- Associe a um assunto e adicione o enunciado
- Marque se acertou ou errou a questão

### 5. Acompanhando Desempenho
- Acesse a aba "Desempenho"
- Visualize estatísticas e progresso
- Acompanhe taxa de acerto por matéria

## 🎨 Interface

A aplicação possui uma interface moderna e responsiva:
- Design limpo e intuitivo
- Navegação por abas
- Cards organizados
- Indicadores visuais de progresso
- Responsivo para mobile e desktop

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ListaEstudos.tsx
│   ├── FormularioEstudo.tsx
│   ├── PainelDesempenho.tsx
│   ├── ListaRevisoes.tsx
│   └── CadernoErros.tsx
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── services/          # Serviços para Firebase
│   ├── estudoService.ts
│   ├── revisaoService.ts
│   └── questaoService.ts
├── types/             # Tipos TypeScript
│   └── index.ts
├── firebase.ts        # Configuração Firebase
└── App.tsx           # Componente principal
```

## 📊 Banco de Dados (Firestore)

A aplicação utiliza as seguintes coleções:

- **estudos**: Registros de estudos dos usuários
- **revisoes**: Controle de revisões pendentes
- **questoes**: Caderno de erros com questões
- **usuarios**: Perfis dos usuários (futuro)

## 🚀 Deploy

Para fazer deploy da aplicação:

1. Build da aplicação:
```bash
npm run build
```

2. Deploy no Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato através do email

---

**Desenvolvido com ❤️ para ajudar nos estudos!**
