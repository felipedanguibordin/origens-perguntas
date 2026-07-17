const statPending = document.getElementById("stat-pending");
const statTotal = document.getElementById("stat-total");
const questionsList = document.getElementById("questions-list");
const liveIndicator = document.getElementById("live-indicator");
const chips = document.querySelectorAll(".chip");

const REFRESH_MS = 5000;

let questions = [];
let filter = "pending";

// ------------------------------------------------------------ dados
async function loadQuestions() {
  try {
    const res = await fetch("/api/painel/questions");
    if (!res.ok) throw new Error("erro na resposta");
    const data = await res.json();
    questions = data.questions;
    statPending.textContent = data.pending;
    statTotal.textContent = data.total;
    liveIndicator.classList.remove("badge-closed");
    liveIndicator.textContent = "● ao vivo";
    render();
  } catch {
    liveIndicator.classList.add("badge-closed");
    liveIndicator.textContent = "● reconectando…";
  }
}

// ------------------------------------------------------------ render
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    render();
  });
});

function formatTime(createdAt) {
  // created_at vem como "YYYY-MM-DD HH:MM:SS" em UTC — converte para o
  // fuso de quem está vendo o painel
  const date = new Date(String(createdAt).replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  const visible = questions.filter((q) => {
    if (filter === "pending") return !q.answered;
    if (filter === "answered") return q.answered;
    return true;
  });

  if (visible.length === 0) {
    const msg =
      filter === "pending"
        ? "Nenhuma pergunta aguardando. 🌊"
        : "Nenhuma pergunta por aqui ainda.";
    questionsList.innerHTML = `<p class="muted" style="text-align: center">${msg}</p>`;
    return;
  }

  questionsList.innerHTML = visible
    .map(
      (q) => `
      <article class="question-item ${q.answered ? "is-answered" : ""}">
        <div class="question-meta">
          <span class="question-author">${q.name ? escapeHtml(q.name) : "Anônimo"}</span>
          <span class="question-time">${formatTime(q.created_at)}</span>
        </div>
        <p class="question-text">${escapeHtml(q.text)}</p>
        <div class="question-actions">
          <button class="btn btn-ghost btn-sm" data-action="toggle" data-id="${q.id}">
            ${q.answered ? "↩ Marcar como não respondida" : "✓ Marcar como respondida"}
          </button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${q.id}">
            Excluir
          </button>
        </div>
      </article>`,
    )
    .join("");
}

questionsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const question = questions.find((q) => q.id === id);
  if (!question) return;

  button.disabled = true;
  try {
    if (button.dataset.action === "toggle") {
      await fetch(`/api/painel/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answered: !question.answered }),
      });
    } else if (button.dataset.action === "delete") {
      if (!confirm("Excluir esta pergunta?")) return;
      await fetch(`/api/painel/questions/${id}`, { method: "DELETE" });
    }
    await loadQuestions();
  } finally {
    button.disabled = false;
  }
});

// ------------------------------------------------------------ init
loadQuestions();
setInterval(loadQuestions, REFRESH_MS);
