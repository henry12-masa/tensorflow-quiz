const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";
const QUESTION_LIMIT = 50;

const quizInfo = {
  sasSpecialist: {
    title: "SAS Certified Specialist",
    desc: "Base SAS・DATAステップ・PROC・データ加工・集計"
  },
  sasProfessional: {
    title: "SAS Certified Professional",
    desc: "高度なSASプログラミング・SQL・マクロ・データ管理"
  },
  ibmDataScience: {
    title: "IBM Data Science Professional",
    desc: "Python・データ分析・機械学習・可視化・プロジェクト実践"
  },
  tensorflowDeveloper: {
    title: "TensorFlow Developer Certificate",
    desc: "TensorFlow・Keras・CNN・NLP・時系列・モデル評価"
  },
  fabricAnalytics: {
    title: "Microsoft Fabric Analytics Engineer",
    desc: "Fabric・Lakehouse・Warehouse・Power BI・セマンティックモデル・DAX"
  }
};

const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const quizList = document.getElementById("quizList");

if (type === "all") {
  document.title = "データ分析・AI資格クイズ";
  pageTitle.textContent = "データ分析・AI資格クイズ";
  pageDesc.textContent = "5カテゴリ・総数180問から50問を重複なしでランダム出題";
} else {
  const info = quizInfo[type] || quizInfo.sasSpecialist;
  document.title = info.title;
  pageTitle.textContent = info.title;
  pageDesc.textContent = info.desc;
}

quizList.innerHTML = `
  <a href="index.html" class="${type === "all" ? "active" : ""}">全カテゴリ50問</a>
  ${Object.keys(quizInfo).map(key => `
    <a href="?type=${key}" class="${type === key ? "active" : ""}">${quizInfo[key].title}</a>
  `).join("")}
`;

function normalizeQuestion(q){
  return {
    question: q.question || q.q,
    choices: q.choices || q.c,
    answer: q.answer || q.a,
    explanation: q.explanation || q.e || ""
  };
}

function shuffle(array){
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function uniqueQuestions(array){
  const seen = new Set();
  return array.filter(q => {
    const key = `${q.question}__${q.answer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let questions = [];

if (type === "all") {
  Object.keys(quizInfo).forEach(key => {
    if (window.quizData && Array.isArray(window.quizData[key])) {
      questions.push(...window.quizData[key].map(normalizeQuestion));
    }
  });
} else {
  questions = window.quizData?.[type] ? window.quizData[type].map(normalizeQuestion) : [];
}

questions = shuffle(uniqueQuestions(questions)).slice(0, QUESTION_LIMIT);

let currentIndex = 0;
let score = 0;
let answered = false;

const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");

function showQuestion() {
  answered = false;
  resultEl.textContent = "";
  nextBtn.style.display = "none";

  if (questions.length === 0) {
    questionEl.textContent = "問題データが読み込めませんでした";
    choicesEl.innerHTML = "";
    counter.textContent = "0 / 0";
    scoreEl.textContent = "スコア: 0";
    progressBar.style.width = "0%";
    return;
  }

  if (currentIndex >= questions.length) {
    questionEl.textContent = "終了！";
    choicesEl.innerHTML = "";
    counter.textContent = `${questions.length} / ${questions.length}`;
    scoreEl.textContent = `スコア: ${score}`;
    resultEl.textContent = `${questions.length}問中 ${score}問正解`;
    progressBar.style.width = "100%";
    return;
  }

  const q = questions[currentIndex];
  counter.textContent = `${currentIndex + 1} / ${questions.length}`;
  scoreEl.textContent = `スコア: ${score}`;
  questionEl.textContent = q.question;
  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  choicesEl.innerHTML = "";

  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => {
      if (answered) return;
      answered = true;

      if (choice === q.answer) {
        score++;
        resultEl.textContent = "正解！";
        btn.classList.add("correct");
      } else {
        resultEl.textContent = `不正解。正解は「${q.answer}」`;
        btn.classList.add("wrong");
      }

      [...choicesEl.children].forEach(b => {
        b.disabled = true;
        if (b.textContent === q.answer) b.classList.add("correct");
      });

      if (q.explanation) resultEl.textContent += ` ${q.explanation}`;
      scoreEl.textContent = `スコア: ${score}`;
      nextBtn.style.display = "block";
    };
    choicesEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  currentIndex++;
  showQuestion();
};

showQuestion();
