const form = document.getElementById("question-form");
const textInput = document.getElementById("f-text");
const nameInput = document.getElementById("f-name");
const charCount = document.getElementById("char-count");
const formError = document.getElementById("form-error");
const btnSubmit = document.getElementById("btn-submit");
const questionSection = document.getElementById("question-section");
const successSection = document.getElementById("success-section");
const successMessage = document.getElementById("success-message");
const btnAgain = document.getElementById("btn-again");

textInput.addEventListener("input", () => {
  charCount.textContent = `${textInput.value.length} / 2000`;
});

function showError(message) {
  formError.textContent = message;
  formError.classList.add("show");
}

function clearError() {
  formError.textContent = "";
  formError.classList.remove("show");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const text = textInput.value.trim();
  if (text.length < 5) {
    showError("Escreva a sua pergunta antes de enviar.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Enviando…";

  try {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, name: nameInput.value }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Não foi possível enviar. Tente novamente.");
      return;
    }

    successMessage.textContent = data.message;
    questionSection.classList.add("hidden");
    successSection.classList.remove("hidden");
  } catch {
    showError("Falha de conexão. Verifique sua internet e tente novamente.");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Enviar pergunta";
  }
});

btnAgain.addEventListener("click", () => {
  form.reset();
  charCount.textContent = "0 / 2000";
  clearError();
  successSection.classList.add("hidden");
  questionSection.classList.remove("hidden");
  textInput.focus();
});
