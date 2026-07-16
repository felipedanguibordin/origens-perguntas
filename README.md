# Perguntas — Conferência Origens

Plataforma para enviar perguntas sobre as aulas da Conferência Origens
(Profundo e Constante).

- **`/`** — página pública: campo de texto para a pergunta + nome opcional.
- **`/professor.html`** — painel do professor: mostra as perguntas ao vivo
  (atualiza a cada 5 segundos), com filtros e botões de "respondida"/excluir.
  Sem senha — só não divulgue o endereço para o público.

## Rodar localmente

```bash
npm install
npm start
# http://localhost:3001
```

Localmente os dados ficam em `data/perguntas.db` (SQLite). Requer Node 22.5+.

## Publicar (Vercel + Turso, tudo grátis)

As perguntas ficam guardadas no Turso (banco SQLite na nuvem); o site e a
API rodam na Vercel como funções serverless (`api/index.js` + `vercel.json`).
A Vercel não "dorme" e não pede cartão de crédito.

### 1. Criar o banco no Turso

1. Crie uma conta em https://turso.tech (pode entrar com GitHub).
2. Crie um banco (ex.: `origens-perguntas`) — pode ser pelo site.
3. Na página do banco (seção **Connect**), copie a **URL**
   (formato `libsql://origens-perguntas-xxxx.turso.io`) e gere um **token**
   com permissão **Read & Write** (botão "Create Token").

### 2. Subir o código no GitHub

```bash
git init -b main
git add .
git commit -m "Plataforma de perguntas Origens"
git remote add origin https://github.com/SEU-USUARIO/origens-perguntas.git
git push -u origin main
```

### 3. Criar o projeto na Vercel

1. Crie uma conta em https://vercel.com (**Continue with GitHub**).
2. **Add New → Project** → **Import** no repositório `origens-perguntas`.
3. Deixe **Framework Preset: Other** e os comandos de build em branco.
4. Em **Environment Variables**, adicione:
   - `TURSO_DATABASE_URL` = a URL `libsql://...` do passo 1
   - `TURSO_AUTH_TOKEN` = o token do passo 1
5. **Deploy**. A URL fica tipo `https://origens-perguntas.vercel.app`.

Divulgue só a URL principal; o painel do professor fica em
`/professor.html` (sem senha — não coloque esse link no telão).
