document.addEventListener('DOMContentLoaded', () => {
    // ... (quizData remains the same)
    const quizData = [
      { question: "Что означает аббревиатура СИЗ?", options: ["Средства индивидуальной защиты","Система измерения защиты","Служба инженерной защиты","Средства изоляции зон"], answer: 0 },
      { question: "Что относится к средствам индивидуальной защиты?", options: ["Каска","Стол","Компьютер","Документ"], answer: 0 },
      { question: "Какой СИЗ защищает органы дыхания?", options: ["Респиратор","Очки","Каска","Беруши"], answer: 0 },
      { question: "Какой СИЗ защищает слух?", options: ["Беруши","Перчатки","Каска","Щиток"], answer: 0 },
      { question: "Что такое ПЭТ?", options: ["План эвакуации при ЧС","План электроснабжения","Программа обучения","Производственный этикет"], answer: 0 },
      { question: "Какой цвет используется для эвакуационных выходов?", options: ["Зелёный","Красный","Жёлтый","Синий"], answer: 0 },
      { question: "Что нужно сделать при обнаружении пожара?", options: ["Сообщить и эвакуироваться","Продолжить работу","Открыть окна","Игнорировать"], answer: 0 },
      { question: "Что обозначает знак огнетушителя?", options: ["Место нахождения огнетушителя","Запрет курения","Опасная зона","Выход"], answer: 0 },
      { question: "Кто обязан соблюдать охрану труда?", options: ["Все работники","Только руководство","Охрана","Инженеры"], answer: 0 },
      { question: "Какой СИЗ обязателен при работе на высоте?", options: ["Страховочная привязь","Беруши","Очки","Фартук"], answer: 0 },
      { question: "Что означает знак с молнией?", options: ["Опасность поражения электричеством","Пожар","Взрыв","Радиация"], answer: 0 },
      { question: "Что делать при неисправном оборудовании?", options: ["Сообщить руководству","Продолжить работу","Игнорировать","Починить самостоятельно"], answer: 0 },
      { question: "Какой знак является запрещающим?", options: ["Красный круг","Синий круг","Зелёный квадрат","Жёлтый треугольник"], answer: 0 },
      { question: "Что защищает каска?", options: ["Голову","Руки","Глаза","Слух"], answer: 0 },
      { question: "Что такое инструктаж по охране труда?", options: ["Обучение безопасной работе","Экзамен","Отчёт","Контроль"], answer: 0 },
      { question: "Когда проводится первичный инструктаж?", options: ["Перед началом работы","Раз в год","После отпуска","По желанию"], answer: 0 },
      { question: "Какой знак является предупреждающим?", options: ["Жёлтый треугольник","Красный круг","Синий квадрат","Зелёный прямоугольник"], answer: 0 },
      { question: "Что делать при утечке газа?", options: ["Эвакуироваться и сообщить","Включить свет","Игнорировать","Продолжить работу"], answer: 0 },
      { question: "Какие СИЗ применяются при шуме?", options: ["Беруши","Очки","Перчатки","Фартук"], answer: 0 },
      { question: "Что такое эвакуация?", options: ["Организованный вывод людей","Перерыв","Инструктаж","Отпуск"], answer: 0 },
      {question:"Что означает знак с изображением огня?", options:["Пожарная зона", "Опасность взрыва", "Запрет курения"], answer: 0},
      {question:"Что такое осознаность?", options:["Понимание и принятие", "Быстрая верификация ", "Пассивное наблюдение"], answer: 1}
    ];

    // ===== ПЕРЕМЕННЫЕ =====
    let currentQuestion = 0;
    let userAnswers = Array(quizData.length).fill(null);
    let timerInterval;
    let quizFinished = false;
    let isTimedMode = false;
    let progressChartInstance;

    // ===== ЭЛЕМЕНТЫ =====
    const modeSelectionEl = document.getElementById('mode-selection');
    const quizContainerEl = document.querySelector('.container:not(#mode-selection)');
    const timedModeBtn = document.getElementById('timed-mode-btn');
    const simpleModeBtn = document.getElementById('simple-mode-btn');
    const quitQuizBtn = document.getElementById('back-to-mode-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const resultEl = document.getElementById("result");
    const timerEl = document.getElementById("timer");
    const progressEl = document.getElementById("progress");
    const quizEl = document.getElementById("quiz");
    const resultTextEl = document.getElementById('result-text');
    const chartCanvas = document.getElementById('progressChart').getContext('2d');

    // ===== ФУНКЦИЯ ЗАДЕРЖКИ =====
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ===== ОБРАБОТЧИКИ КНОПОК МЕНЮ =====
    timedModeBtn.addEventListener('click', () => { isTimedMode = true; startQuiz(); });
    simpleModeBtn.addEventListener('click', () => { isTimedMode = false; startQuiz(); });
    quitQuizBtn.addEventListener('click', () => { finishTest(true); }); // true_means_quit
    backToMenuBtn.addEventListener('click', () => { resetQuiz(); });

    // ===== СБРОС КВИЗА =====
    function resetQuiz() {
        if (progressChartInstance) {
            progressChartInstance.destroy();
        }
        quizContainerEl.style.display = 'none';
        resultEl.classList.add('hidden');
        modeSelectionEl.style.display = 'block';
        quizEl.classList.remove('hidden');

        currentQuestion = 0;
        userAnswers.fill(null);
        quizFinished = false;
        clearInterval(timerInterval);
        timerEl.textContent = "10:00";
    }

    // ===== ЗАГРУЗКА ВОПРОСА (без изменений) =====
    async function loadQuestion(isInitial = false) {
        if (!isInitial) {
            questionEl.style.opacity = 0;
            optionsEl.style.opacity = 0;
            await sleep(300);
        }
        
        const q = quizData[currentQuestion];
        questionEl.textContent = q.question;
        optionsEl.innerHTML = "";
        
        q.options.forEach((option, index) => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.classList.add('option-btn');
            
            if (userAnswers[currentQuestion] === index) {
                btn.classList.add('selected');
            }
            
            btn.onclick = async () => {
                if (quizFinished) return;
                userAnswers[currentQuestion] = index;
                optionsEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                await sleep(300);
                
                if (currentQuestion < quizData.length - 1) {
                    currentQuestion++;
                    loadQuestion();
                } else {
                    finishTest(false); // false_means_completed
                }
            };
            
            optionsEl.appendChild(btn);
        });
        
        progressEl.textContent = `Вопрос ${currentQuestion + 1} из ${quizData.length}`;
        questionEl.style.opacity = 1;
        optionsEl.style.opacity = 1;
    }
    
    // ===== ТАЙМЕР =====
    function startTimer() {
        let timer = 10 * 60;
        timerInterval = setInterval(() => {
            if (quizFinished) {
                clearInterval(timerInterval);
                return;
            }
            const min = Math.floor(timer / 60);
            const sec = timer % 60;
            timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            
            if (timer-- <= 0) {
                finishTest(false);
            }
        }, 1000);
    }
    
    // ===== ЗАВЕРШЕНИЕ И ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА =====
    function finishTest(wasQuit) {
        if (quizFinished && !wasQuit) return;
        quizFinished = true;
        clearInterval(timerInterval);

        const answeredCount = userAnswers.filter(a => a !== null).length;

        if (answeredCount < 10 && wasQuit) {
            resetQuiz();
            return;
        }

        const correct = userAnswers.reduce((sum, ans, i) => sum + (ans !== null && ans === quizData[i].answer ? 1 : 0), 0);
        const incorrect = answeredCount - correct;
        
        quizEl.classList.add("hidden");
        resultEl.classList.remove("hidden");
        
        resultTextEl.textContent = `Отвечено ${answeredCount} из ${quizData.length}`;

        if (progressChartInstance) {
            progressChartInstance.destroy();
        }

        progressChartInstance = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Правильно', 'Неправильно'],
                datasets: [{
                    data: [correct, incorrect],
                    backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f0f0f0',
                            font: { size: 14 }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
    }
    
    // ===== СТАРТ =====
    async function startQuiz() {
        modeSelectionEl.style.display = 'none';
        quizContainerEl.style.display = 'block';
        quizContainerEl.classList.remove('slide-in');
        void quizContainerEl.offsetWidth;
        quizContainerEl.classList.add('slide-in');
        
        if (isTimedMode) {
            timerEl.style.display = 'block';
            startTimer();
        } else {
            timerEl.style.display = 'none';
        }
        
        await sleep(300);
        loadQuestion(true);
    }
});
