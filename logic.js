// logic.js
// Этот файл работает вместе с твоим script.js,
// где должны быть массивы: vlsQuestions, biotQuestions, pteQuestions.

const letters = ["А", "Б", "В", "Г"];

let mode = "study"; // study = показывает ответ сразу, exam = только в конце
let questions = [];
let originalQuestions = [];
let currentTestKey = "";
let currentTestName = "";
let currentIndex = 0;
let score = 0;
let answered = false;
let selectedAnswer = null;
let mistakes = [];
let isMistakesMode = false;

const testNames = {
  vls: "ВЛС",
  biot: "Охрана труда",
  pte: "ПТЭ",
  mistakes: "Повтор ошибок",
  zhts: "ЖТС"
};

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const vlsPartsScreen = document.getElementById("vlsPartsScreen");
const questionText = document.getElementById("questionText");
const questionTopic = document.getElementById("questionTopic");
const answersBox = document.getElementById("answersBox");
const counter = document.getElementById("counter");
const miniScore = document.getElementById("miniScore");
const progress = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const feedback = document.getElementById("feedback");

window.addEventListener("DOMContentLoaded", () => {
  updateCounts();
});

function safeArray(name) {
  try {
    return Array.isArray(window[name]) ? window[name] : [];
  } catch {
    return [];
  }
}

function updateCounts() {
  const vls = typeof vlsQuestions !== "undefined" && Array.isArray(vlsQuestions) ? vlsQuestions.length : 0;
  const biot = typeof biotQuestions !== "undefined" && Array.isArray(biotQuestions) ? biotQuestions.length : 0;
  const pte = typeof pteQuestions !== "undefined" && Array.isArray(pteQuestions) ? pteQuestions.length : 0;
  const zhts = typeof zhtsQuestions !== "undefined" &&Array.isArray(zhtsQuestions)? zhtsQuestions.length : 0;

  document.getElementById("vlsCount").textContent = vls + " вопросов";
  document.getElementById("biotCount").textContent = biot + " вопросов";
  document.getElementById("pteCount").textContent = pte + " вопросов";
  document.getElementById("zhtsCount").textContent =zhts + " вопросов";
}

function setMode(selectedMode) {
  mode = selectedMode;

  document.getElementById("studyModeBtn").classList.toggle("active", mode === "study");
  document.getElementById("examModeBtn").classList.toggle("active", mode === "exam");
}

function chooseTest(type) {
  isMistakesMode = false;
  currentTestKey = type;
  currentTestName = testNames[type] || "Тест";

  if (type === "vls") {
    questions = copyQuestions(vlsQuestions);
  }

  if (type === "biot") {
    questions = copyQuestions(biotQuestions);
  }

  if (type === "pte") {
    questions = copyQuestions(pteQuestions);
  }

  if (type === "zhts")
  questions = copyQuestions(zhtsQuestions);

  if (!questions || questions.length === 0) {
    alert("В этом разделе нет вопросов. Проверь файл script.js и название массива.");
    return;
  }

  questions = shuffleQuestions(questions);
  originalQuestions = copyQuestions(questions);

  startQuiz();
}

function startQuiz() {
  currentIndex = 0;
  score = 0;
  answered = false;
  selectedAnswer = null;
  mistakes = [];

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  answered = false;
  selectedAnswer = null;
  nextBtn.disabled = true;
  feedback.className = "feedback hidden";
  feedback.innerHTML = "";

  const q = questions[currentIndex];

  counter.textContent = currentTestName + " • Вопрос " + (currentIndex + 1) + " / " + questions.length;
  miniScore.textContent = "Верно: " + score;
  progress.style.width = ((currentIndex) / questions.length * 100) + "%";
  questionTopic.textContent = currentTestName;
  questionText.textContent = q.q;

  answersBox.innerHTML = "";

  q.a.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.innerHTML = `
      <span class="letter">${letters[index]}</span>
      <span>${escapeHtml(answer)}</span>
    `;
    btn.onclick = () => selectAnswer(index);
    answersBox.appendChild(btn);
  });
}

function selectAnswer(selectedIndex) {
  if (answered) return;

  answered = true;
  selectedAnswer = selectedIndex;
  nextBtn.disabled = false;

  const q = questions[currentIndex];

  if (selectedIndex === q.c) {
    score++;
  } else {
    const mistakeItem = {
      test: currentTestName,
      question: q.q,
      answers: q.a,
      correct: q.c,
      your: selectedIndex
    };

    mistakes.push(mistakeItem);
    saveMistake(mistakeItem);
  }

  if (mode === "study") {
    showAnswerFeedback(selectedIndex);
  } else {
    document.querySelectorAll(".answer").forEach(btn => btn.disabled = true);
    feedback.className = "feedback good";
    feedback.innerHTML = "Ответ принят. В режиме экзамена правильный ответ будет в конце.";
  }

  miniScore.textContent = "Верно: " + score;
}

function showAnswerFeedback(selectedIndex) {
  const q = questions[currentIndex];
  const answerButtons = document.querySelectorAll(".answer");

  answerButtons.forEach((btn, index) => {
    btn.disabled = true;

    if (index === q.c) {
      btn.classList.add("correct");
    }

    if (index === selectedIndex && selectedIndex !== q.c) {
      btn.classList.add("wrong");
    }
  });

  if (selectedIndex === q.c) {
    feedback.className = "feedback good";
    feedback.innerHTML = "✅ Верно! Отлично.";
  } else {
    feedback.className = "feedback bad";
    feedback.innerHTML =
      "❌ Неверно. Правильный ответ: <b>" +
      letters[q.c] + ") " + escapeHtml(q.a[q.c]) + "</b>";
  }
}

function nextQuestion() {
  if (!answered) return;

  currentIndex++;

  if (currentIndex >= questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function finishQuiz() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  progress.style.width = "100%";

  const wrong = questions.length - score;
  const percent = Math.round((score / questions.length) * 100);

  document.getElementById("resultText").textContent =
    currentTestName + ": " + score + " из " + questions.length + " — " + percent + "%.";

  document.getElementById("rightCount").textContent = score;
  document.getElementById("wrongCount").textContent = wrong;

  drawChart(score, wrong);
  renderMistakes();
}

function drawChart(right, wrong) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const total = right + wrong;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 92;
  const lineWidth = 28;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(30, 41, 59, 0.95)";
  ctx.stroke();

  const rightAngle = total === 0 ? 0 : (right / total) * Math.PI * 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + rightAngle);
  ctx.strokeStyle = "#22c55e";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + rightAngle, Math.PI * 1.5);
  ctx.strokeStyle = "#ef4444";
  ctx.stroke();

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "900 34px -apple-system, BlinkMacSystemFont, Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const percent = total === 0 ? 0 : Math.round((right / total) * 100);
  ctx.fillText(percent + "%", centerX, centerY - 8);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, Segoe UI, Arial";
  ctx.fillText("результат", centerX, centerY + 24);
}

function renderMistakes() {
  const box = document.getElementById("mistakesBox");

  if (mistakes.length === 0) {
    box.innerHTML = `<div class="empty">🔥 Красавчик! Ошибок нет.</div>`;
    return;
  }

  box.innerHTML = "";

  mistakes.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "mistake";
    div.innerHTML = `
      <div class="mistake-q">№${index + 1}. ${escapeHtml(item.question)}</div>
      <div class="mistake-line">
        Твой ответ: <span class="red">${letters[item.your]}) ${escapeHtml(item.answers[item.your])}</span>
      </div>
      <div class="mistake-line">
        Правильно: <span class="green">${letters[item.correct]}) ${escapeHtml(item.answers[item.correct])}</span>
      </div>
    `;
    box.appendChild(div);
  });
}

function restartCurrent() {
  if (isMistakesMode) {
    startMistakesMode();
    return;
  }

  questions = shuffleQuestions(copyQuestions(originalQuestions));
  startQuiz();
}
function goHome() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  vlsPartsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  updateCounts();
}

function startMistakesMode() {
  const saved = getSavedMistakes();

  if (saved.length === 0) {
    alert("Пока ошибок нет.");
    return;
  }

  isMistakesMode = true;
  currentTestKey = "mistakes";
  currentTestName = "Повтор ошибок";

  questions = saved.map(item => ({
    q: item.question,
    a: item.answers,
    c: item.correct
  }));

  questions = shuffleQuestions(questions);
  originalQuestions = copyQuestions(questions);

  startQuiz();
}

function saveMistake(item) {
  const saved = getSavedMistakes();

  const exists = saved.some(x => x.question === item.question && x.test === item.test);
  if (!exists) {
    saved.push(item);
  }

  localStorage.setItem("ktzh_mistakes", JSON.stringify(saved));
}

function getSavedMistakes() {
  try {
    return JSON.parse(localStorage.getItem("ktzh_mistakes")) || [];
  } catch {
    return [];
  }
}

function clearSavedMistakes() {
  const ok = confirm("Очистить все сохранённые ошибки?");
  if (!ok) return;

  localStorage.removeItem("ktzh_mistakes");
  alert("Ошибки очищены.");
}

function shuffleQuestions(array) {
  const arr = copyQuestions(array);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function copyQuestions(array) {
  return JSON.parse(JSON.stringify(array || []));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}





function openVlsPartsMenu() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  vlsPartsScreen.classList.remove("hidden");
}



function openVlsPartsMenu() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  vlsPartsScreen.classList.remove("hidden");
}

function startVlsPart(start, end, title) {
  if (typeof vlsQuestions === "undefined" || !Array.isArray(vlsQuestions)) {
    alert("Массив vlsQuestions не найден в script.js");
    return;
  }

  const part = vlsQuestions.slice(start, end);

  if (part.length === 0) {
    alert("В этом блоке нет вопросов");
    return;
  }

  isMistakesMode = false;
  currentTestKey = "vls";
  currentTestName = title;

  questions = shuffleQuestions(copyQuestions(part));
  originalQuestions = copyQuestions(questions);

  vlsPartsScreen.classList.add("hidden");
  startQuiz();
}


window.openVlsPartsMenu = openVlsPartsMenu;
window.startVlsPart = startVlsPart;
