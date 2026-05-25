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
const timerBox = document.getElementById("timerBox");
const timerText = document.getElementById("timerText");
const vlsPartsScreen = document.getElementById("vlsPartsScreen");
const zhtsPartsScreen = document.getElementById("zhtsPartsScreen");
const ptePartsScreen = document.getElementById("ptePartsScreen");
const biotPartsScreen = document.getElementById("biotPartsScreen");
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

  const q = questions[currentIndex];//Добавляю новую 120
  q.selected = selectedIndex;
  q.isCorrect = selectedIndex === q.c;

  
 /* if (selectedIndex === q.c) {
    score++;
  } else {
    const mistakeItem = {
      test: currentTestName,
      question: q.q,
      answers: q.a,
      correct: q.c,
      your: selectedIndex
    };*/

  if (q.isCorrect) {
  score++;
} else {
  const mistakeItem = {
    test: currentTestName,
    question: q.q,
    answers: q.a,
    correct: q.c,
    your: selectedIndex,
    subjectKey: q.subjectKey,
    subjectName: q.subjectName
  };

  mistakes.push(mistakeItem);
  saveMistake(mistakeItem);
}

   /* mistakes.push(mistakeItem);
    saveMistake(mistakeItem);
  }*/

  if (mode === "study") {
    showAnswerFeedback(selectedIndex);
  } else {
    document.querySelectorAll(".answer").forEach(btn => btn.disabled = true);
    feedback.className = "feedback good";
    feedback.innerHTML = "Ответ принят. В режиме экзамена правильный ответ будет в конце.";
  }

  miniScore.textContent = "Верно: " + score;


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
  showExamSubjectStats();
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
  zhtsPartsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  ptePartsScreen.classList.add("hidden");
  biotPartsScreen.classList.add("hidden");
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

  //questions = shuffleQuestions(copyQuestions(part));
  questions = copyQuestions(part);
  originalQuestions = copyQuestions(questions);

  vlsPartsScreen.classList.add("hidden");
  startQuiz();
}


window.openVlsPartsMenu = openVlsPartsMenu;
window.startVlsPart = startVlsPart;









function openZhtsPartsMenu() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  vlsPartsScreen.classList.add("hidden");
  zhtsPartsScreen.classList.remove("hidden");
}

function startZhtsPart(start, end, title) {
  if (typeof zhtsQuestions === "undefined" || !Array.isArray(zhtsQuestions)) {
    alert("Массив zhtsQuestions не найден в script.js");
    return;
  }

  const part = zhtsQuestions.slice(start, end);

  if (part.length === 0) {
    alert("В этом блоке нет вопросов");
    return;
  }

  isMistakesMode = false;
  currentTestKey = "zhts";
  currentTestName = title;

  // В частях ЖТС вопросы идут по порядку, без перемешивания
  questions = copyQuestions(part);
  originalQuestions = copyQuestions(questions);

  zhtsPartsScreen.classList.add("hidden");
  startQuiz();
}

window.openZhtsPartsMenu = openZhtsPartsMenu;
window.startZhtsPart = startZhtsPart;




//Кнопка экзамен на 120 вопросов 
/*function takeRandomQuestions(array, count) {
  const copied = copyQuestions(array);
  const shuffled = shuffleQuestions(copied);
  return shuffled.slice(0, count);
}

function addSubjectToQuestions(array, subjectKey, subjectName) {
  return array.map(q => ({
    ...q,
    subjectKey: subjectKey,
    subjectName: subjectName,
    selected: null,
    isCorrect: false
  }));
}*/

/*function startExam120() {
  if (
    typeof vlsQuestions === "undefined" ||
    typeof pteQuestions === "undefined" ||
    typeof biotQuestions === "undefined" ||
    typeof zhtsQuestions === "undefined"
  ) {
    alert("Не найдены массивы вопросов. Проверь script.js");
    return;
  }

  if (
    vlsQuestions.length < 30 ||
    pteQuestions.length < 30 ||
    biotQuestions.length < 30 ||
    zhtsQuestions.length < 30
  ) {
    alert("В одном из разделов меньше 30 вопросов");
    return;
  }

  const vlsPart = addSubjectToQuestions(
    takeRandomQuestions(vlsQuestions, 30),
    "vls",
    "ВЛС"
  );

  const ptePart = addSubjectToQuestions(
    takeRandomQuestions(pteQuestions, 30),
    "pte",
    "ПТЭ"
  );

  const biotPart = addSubjectToQuestions(
    takeRandomQuestions(biotQuestions, 30),
    "biot",
    "Охрана труда"
  );

  const zhtsPart = addSubjectToQuestions(
    takeRandomQuestions(zhtsQuestions, 30),
    "zhts",
    "ЖТС"
  );

  questions = shuffleQuestions([
    ...vlsPart,
    ...ptePart,
    ...biotPart,
    ...zhtsPart
  ]);

  originalQuestions = copyQuestions(questions);

  isMistakesMode = false;
  isFinalExam = true;
  currentTestKey = "exam";
  currentTestName = "Экзамен 120 вопросов";

  mistakes = [];
  score = 0;
  currentIndex = 0;
  selectedAnswer = null;

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  if (typeof vlsPartsScreen !== "undefined" && vlsPartsScreen) {
    vlsPartsScreen.classList.add("hidden");
  }

  if (typeof zhtsPartsScreen !== "undefined" && zhtsPartsScreen) {
    zhtsPartsScreen.classList.add("hidden");
  }

  if (typeof ptePartsScreen !== "undefined" && ptePartsScreen) {
    ptePartsScreen.classList.add("hidden");
  }

  quizScreen.classList.remove("hidden");

  startQuiz();

  if (typeof startExamTimer === "function") {
    startExamTimer(60 * 60);
  }
}

window.startExam120 = startExam120;
*/




function takeRandomQuestions(array, count) {
  const copied = copyQuestions(array);
  const shuffled = shuffleQuestions(copied);
  return shuffled.slice(0, count);
}

function addSubjectToQuestions(array, subjectKey, subjectName) {
  return array.map(q => ({
    ...q,
    subjectKey: subjectKey,
    subjectName: subjectName,
    selected: null,
    isCorrect: false
  }));
}

function startExam120() {
  if (
    typeof vlsQuestions === "undefined" ||
    typeof pteQuestions === "undefined" ||
    typeof biotQuestions === "undefined" ||
    typeof zhtsQuestions === "undefined"
  ) {
    alert("Не найдены массивы вопросов. Проверь script.js");
    return;
  }

  const vlsPart = addSubjectToQuestions(
    takeRandomQuestions(vlsQuestions, 30),
    "vls",
    "ВЛС"
  );

  const ptePart = addSubjectToQuestions(
    takeRandomQuestions(pteQuestions, 30),
    "pte",
    "ПТЭ"
  );

  const biotPart = addSubjectToQuestions(
    takeRandomQuestions(biotQuestions, 30),
    "biot",
    "Охрана труда"
  );

  const zhtsPart = addSubjectToQuestions(
    takeRandomQuestions(zhtsQuestions, 30),
    "zhts",
    "ЖТС"
  );

  questions = shuffleQuestions([
    ...vlsPart,
    ...ptePart,
    ...biotPart,
    ...zhtsPart
  ]);

  originalQuestions = copyQuestions(questions);

  isMistakesMode = false;
  isFinalExam = true;
  currentTestKey = "exam";
  currentTestName = "Экзамен 120 вопросов";

  mistakes = [];
  score = 0;
  currentIndex = 0;
  selectedAnswer = null;

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  if (typeof vlsPartsScreen !== "undefined" && vlsPartsScreen) {
    vlsPartsScreen.classList.add("hidden");
  }

  if (typeof zhtsPartsScreen !== "undefined" && zhtsPartsScreen) {
    zhtsPartsScreen.classList.add("hidden");
  }

  if (typeof ptePartsScreen !== "undefined" && ptePartsScreen) {
    ptePartsScreen.classList.add("hidden");
  }

  quizScreen.classList.remove("hidden");

  startQuiz();

  if (typeof startExamTimer === "function") {
    startExamTimer(60 * 60);
  }
}

window.startExam120 = startExam120;























// Таймер на экзамен 

let examTimer = null;
let examTimeLeft = 0;

function startExamTimer(seconds) {
  examTimeLeft = seconds;

  if (examTimer) {
    clearInterval(examTimer);
  }

  timerBox.classList.remove("hidden");

  updateExamTimerText();

  examTimer = setInterval(() => {
    examTimeLeft--;

    updateExamTimerText();

    if (examTimeLeft <= 0) {
      clearInterval(examTimer);
      examTimer = null;

      alert("Время экзамена закончилось");
      finishQuiz();
    }
  }, 1000);
}

function updateExamTimerText() {
  const minutes = Math.floor(examTimeLeft / 60);
  const seconds = examTimeLeft % 60;

  timerText.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

function stopTimer() {
  if (examTimer) {
    clearInterval(examTimer);
    examTimer = null;
  }

  timerBox.classList.add("hidden");
}









function openPtePartsMenu() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  vlsPartsScreen.classList.add("hidden");
  zhtsPartsScreen.classList.add("hidden");
  ptePartsScreen.classList.remove("hidden");
}

function startPtePart(start, end, title) {
  if (typeof pteQuestions === "undefined" || !Array.isArray(pteQuestions)) {
    alert("Массив pteQuestions не найден в script.js");
    return;
  }

  const part = pteQuestions.slice(start, end);

  if (part.length === 0) {
    alert("В этом блоке нет вопросов");
    return;
  }

  isMistakesMode = false;
  currentTestKey = "pte";
  currentTestName = title;

  // В частях ПТЭ вопросы идут по порядку, без перемешивания
  questions = copyQuestions(part);
  originalQuestions = copyQuestions(questions);

  ptePartsScreen.classList.add("hidden");
  startQuiz();
}

window.openPtePartsMenu = openPtePartsMenu;
window.startPtePart = startPtePart;













function showExamSubjectStats() {
  const oldBox = document.getElementById("examSubjectStats");

  if (oldBox) {
    oldBox.remove();
  }

  if (!isFinalExam) {
    return;
  }

  const stats = {
    vls: { name: "ВЛС", correct: 0, total: 0 },
    pte: { name: "ПТЭ", correct: 0, total: 0 },
    biot: { name: "Охрана труда", correct: 0, total: 0 },
    zhts: { name: "ЖТС", correct: 0, total: 0 }
  };

  questions.forEach(q => {
    if (!q.subjectKey || !stats[q.subjectKey]) {
      return;
    }

    stats[q.subjectKey].total++;

    if (q.isCorrect) {
      stats[q.subjectKey].correct++;
    }
  });

  const passedAll = Object.values(stats).every(item => item.correct >= 18);

  const box = document.createElement("div");
  box.id = "examSubjectStats";
  box.className = "exam-subject-stats";

  box.innerHTML = `
    <h2>🎓 Результат по предметам</h2>

    <div class="subject-row">
      <span>📡 ${stats.vls.name}</span>
      <b>${stats.vls.correct} / ${stats.vls.total}</b>
      <small>${stats.vls.correct >= 18 ? "✅ сдал" : "❌ не сдал"}</small>
    </div>

    <div class="subject-row">
      <span>📘 ${stats.pte.name}</span>
      <b>${stats.pte.correct} / ${stats.pte.total}</b>
      <small>${stats.pte.correct >= 18 ? "✅ сдал" : "❌ не сдал"}</small>
    </div>

    <div class="subject-row">
      <span>🦺 ${stats.biot.name}</span>
      <b>${stats.biot.correct} / ${stats.biot.total}</b>
      <small>${stats.biot.correct >= 18 ? "✅ сдал" : "❌ не сдал"}</small>
    </div>

    <div class="subject-row">
      <span>🚆 ${stats.zhts.name}</span>
      <b>${stats.zhts.correct} / ${stats.zhts.total}</b>
      <small>${stats.zhts.correct >= 18 ? "✅ сдал" : "❌ не сдал"}</small>
    </div>

    <div class="${passedAll ? "exam-pass" : "exam-fail"}">
      ${
        passedAll
          ? "🔥 Да, ты чертов гений!"
          : "📚 Пока не сдал. Нужно минимум 18 правильных по каждому предмету."
      }
    </div>
  `;

  resultScreen.appendChild(box);
}












function openBiotPartsMenu() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  if (typeof vlsPartsScreen !== "undefined" && vlsPartsScreen) {
    vlsPartsScreen.classList.add("hidden");
  }

  if (typeof zhtsPartsScreen !== "undefined" && zhtsPartsScreen) {
    zhtsPartsScreen.classList.add("hidden");
  }

  if (typeof ptePartsScreen !== "undefined" && ptePartsScreen) {
    ptePartsScreen.classList.add("hidden");
  }

  biotPartsScreen.classList.remove("hidden");
}

function startBiotPart(start, end, title) {
  if (typeof biotQuestions === "undefined" || !Array.isArray(biotQuestions)) {
    alert("Массив biotQuestions не найден в script.js");
    return;
  }

  const part = biotQuestions.slice(start, end);

  if (part.length === 0) {
    alert("В этом блоке нет вопросов");
    return;
  }

  isMistakesMode = false;
  currentTestKey = "biot";
  currentTestName = title;

  questions = copyQuestions(part);
  originalQuestions = copyQuestions(questions);

  biotPartsScreen.classList.add("hidden");
  startQuiz();
}

window.openBiotPartsMenu = openBiotPartsMenu;
window.startBiotPart = startBiotPart;







if (typeof chooseTest === "function") window.chooseTest = chooseTest;

if (typeof openVlsPartsMenu === "function") window.openVlsPartsMenu = openVlsPartsMenu;
if (typeof startVlsPart === "function") window.startVlsPart = startVlsPart;

if (typeof openPtePartsMenu === "function") window.openPtePartsMenu = openPtePartsMenu;
if (typeof startPtePart === "function") window.startPtePart = startPtePart;

if (typeof openZhtsPartsMenu === "function") window.openZhtsPartsMenu = openZhtsPartsMenu;
if (typeof startZhtsPart === "function") window.startZhtsPart = startZhtsPart;

if (typeof openBiotPartsMenu === "function") window.openBiotPartsMenu = openBiotPartsMenu;
if (typeof startBiotPart === "function") window.startBiotPart = startBiotPart;

if (typeof startExam120 === "function") window.startExam120 = startExam120;
if (typeof goHome === "function") window.goHome = goHome;


