// Adaptador de banco: usa o Turso (nuvem) quando TURSO_DATABASE_URL está
// definida; caso contrário usa um arquivo SQLite local em data/perguntas.db.
const path = require("node:path");
const fs = require("node:fs");

const TURSO_URL = process.env.TURSO_DATABASE_URL;

let all, get, run, exec;

if (TURSO_URL) {
  const { createClient } = require("@libsql/client");
  const client = createClient({
    url: TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  all = async (sql, args = []) => (await client.execute({ sql, args })).rows;
  get = async (sql, args = []) =>
    (await client.execute({ sql, args })).rows[0];
  run = async (sql, args = []) => {
    const result = await client.execute({ sql, args });
    return { changes: result.rowsAffected };
  };
  exec = async (sql) => {
    await client.executeMultiple(sql);
  };

  console.log("Banco: Turso (nuvem)");
} else {
  const { DatabaseSync } = require("node:sqlite");
  const dataDir = path.join(__dirname, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "perguntas.db"));
  db.exec("PRAGMA journal_mode = WAL;");

  all = async (sql, args = []) => db.prepare(sql).all(...args);
  get = async (sql, args = []) => db.prepare(sql).get(...args);
  run = async (sql, args = []) => db.prepare(sql).run(...args);
  exec = async (sql) => db.exec(sql);

  console.log("Banco: SQLite local (data/perguntas.db)");
}

module.exports = { all, get, run, exec };
