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

## Publicar (Render + Turso, tudo grátis)

O plano grátis do Render desliga o serviço após 15 min sem uso e **apaga o
disco** quando isso acontece — por isso as perguntas ficam guardadas no
Turso (banco SQLite na nuvem), que não perde nada.

### 1. Criar o banco no Turso

1. Crie uma conta em https://turso.tech (pode entrar com GitHub).
2. Crie um banco (ex.: `origens-perguntas`) — pode ser pelo site.
3. Copie a **URL do banco** (formato `libsql://origens-perguntas-xxxx.turso.io`)
   e gere um **token** (botão "Create token" no painel do banco).

### 2. Subir o código no GitHub

```bash
git init
git add .
git commit -m "Plataforma de perguntas Origens"
gh repo create origens-perguntas --private --source=. --push
```

### 3. Criar o serviço no Render

1. Crie uma conta em https://render.com (entre com GitHub).
2. **New → Web Service** → escolha o repositório.
3. Configure:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Em **Environment variables**, adicione:
   - `TURSO_DATABASE_URL` = a URL `libsql://...` do passo 1
   - `TURSO_AUTH_TOKEN` = o token do passo 1
5. Deploy. A URL fica tipo `https://origens-perguntas.onrender.com`.

### 4. Manter no ar na sexta e no sábado

O plano grátis "dorme" após 15 minutos sem acessos (o primeiro acesso depois
disso demora ~50 s para acordar). Para não dormir durante o evento:

1. Crie uma conta grátis em https://uptimerobot.com.
2. Adicione um monitor **HTTP(s)** apontando para
   `https://SEU-APP.onrender.com/healthz` com intervalo de **5 minutos**.

Com isso o serviço fica acordado 24h — mais que suficiente para sexta e
sábado. O volume de perguntas de uma conferência (centenas de envios) é
tranquilo para o plano grátis dos dois serviços.
