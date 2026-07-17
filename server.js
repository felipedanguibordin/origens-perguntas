// Servidor local (na Vercel quem atende é api/index.js)
const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Perguntas Origens no ar:  http://localhost:${PORT}`);
  console.log(
    `Painel de perguntas:      http://localhost:${PORT}/painel.html`,
  );
});
