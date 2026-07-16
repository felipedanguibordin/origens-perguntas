const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const db = require("./db");

const PORT = process.env.PORT || 3001;
const PROF_PASSWORD = process.env.PROF_PASSWORD || "origens2026";

// ---------------------------------------------------------------- helpers
function checkPassword(given) {
  const a = crypto.createHash("sha256").update(String(given || "")).digest();
  const b = crypto.createHash("sha256").update(PROF_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function requireProf(req, res, next) {
  if (!checkPassword(req.get("x-prof-key"))) {
    return res.status(401).json({ error: "Senha inválida." });
  }
  next();
}

function questionRow(q) {
  return {
    id: Number(q.id),
    text: q.text,
    name: q.name,
    answered: Boolean(Number(q.answered)),
    created_at: q.created_at,
  };
}

// captura erros de handlers async (Express 4 não faz isso sozinho)
const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// ---------------------------------------------------------------- app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- público: enviar pergunta ---------------------------------------
app.post(
  "/api/questions",
  ah(async (req, res) => {
    const { text, name } = req.body || {};

    const cleanText = String(text || "").trim();
    if (cleanText.length < 5) {
      return res
        .status(400)
        .json({ error: "Escreva a sua pergunta antes de enviar." });
    }
    if (cleanText.length > 2000) {
      return res.status(400).json({
        error: "A pergunta é muito longa (máximo de 2000 caracteres).",
      });
    }

    const cleanName = String(name || "").trim().slice(0, 120);

    await db.run("INSERT INTO questions (text, name) VALUES (?, ?)", [
      cleanText,
      cleanName,
    ]);

    res.status(201).json({
      ok: true,
      message: "Pergunta enviada! O professor vai recebê-la em instantes.",
    });
  }),
);

// ---- professor -------------------------------------------------------
app.post("/api/prof/login", (req, res) => {
  if (!checkPassword((req.body || {}).password)) {
    return res.status(401).json({ error: "Senha incorreta." });
  }
  res.json({ ok: true });
});

app.get(
  "/api/prof/questions",
  requireProf,
  ah(async (req, res) => {
    const rows = (
      await db.all("SELECT * FROM questions ORDER BY id DESC")
    ).map(questionRow);
    res.json({
      questions: rows,
      total: rows.length,
      pending: rows.filter((q) => !q.answered).length,
    });
  }),
);

app.put(
  "/api/prof/questions/:id",
  requireProf,
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const question = await db.get("SELECT * FROM questions WHERE id = ?", [id]);
    if (!question) {
      return res.status(404).json({ error: "Pergunta não encontrada." });
    }
    const answered = (req.body || {}).answered ? 1 : 0;
    await db.run("UPDATE questions SET answered = ? WHERE id = ?", [
      answered,
      id,
    ]);
    res.json(
      questionRow(await db.get("SELECT * FROM questions WHERE id = ?", [id])),
    );
  }),
);

app.delete(
  "/api/prof/questions/:id",
  requireProf,
  ah(async (req, res) => {
    const info = await db.run("DELETE FROM questions WHERE id = ?", [
      Number(req.params.id),
    ]);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Pergunta não encontrada." });
    }
    res.json({ ok: true });
  }),
);

// rota simples para manter o serviço acordado (UptimeRobot etc.)
app.get("/healthz", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno. Tente novamente." });
});

// ---------------------------------------------------------------- start
(async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      text       TEXT NOT NULL,
      name       TEXT NOT NULL DEFAULT '',
      answered   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  app.listen(PORT, () => {
    console.log(`Perguntas Origens no ar:  http://localhost:${PORT}`);
    console.log(
      `Painel do professor:      http://localhost:${PORT}/professor.html`,
    );
  });
})();
