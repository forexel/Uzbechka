const $ = (id) => document.getElementById(id);
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const store = {
  data: {},
  async save() {
    if (!auth.token) {
      renderStats();
      renderAuth();
      return;
    }
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({ progress: this.data })
      });
      if (!response.ok) throw new Error("save failed");
    } catch {
      showAuthError("Не удалось сохранить прогресс на сервере.");
    }
    renderStats();
  },
  bump(id, field) {
    this.data[id] ||= { known: 0, review: 0 };
    this.data[id][field] += 1;
    this.save();
  }
};

const auth = {
  token: localStorage.getItem("uzbek-trainer-token") || "",
  username: localStorage.getItem("uzbek-trainer-username") || "",
  mode: "login"
};

let cardDeck = [];
let cardIndex = 0;
let cardFlipped = false;
let cardKnownRound = 0;
let cardRepeatRound = 0;
let cardStartedAt = 0;
let currentPair = { ru: null, uz: null, done: 0, total: 0, errors: 0, startedAt: 0, savedResult: false };
let tenseTask = null;
let selectedPronoun = null;
let selectedSuffixes = [];
let tenseDone = 0;
let tenseAttempts = 0;
let tenseAnswered = false;
let tenseRound = 0;
let tenseStartedAt = 0;
let lastLessonMode = "cards";

function categoryName(type) {
  return {
    verb: "глагол",
    noun: "существительное",
    pronoun: "местоимение",
    question: "вопросительное",
    number: "числительное",
    other: "другое"
  }[type] || type;
}

function renderStats() {
  const totals = Object.values(store.data).reduce((acc, item) => {
    acc.known += item.known || 0;
    acc.review += item.review || 0;
    return acc;
  }, { known: 0, review: 0 });
  $("statKnown").textContent = totals.known;
  $("statReview").textContent = totals.review;
  $("statWords").textContent = WORDS.length;
}

function lessonName(mode) {
  return {
    cards: "Карточки",
    pairs: "Пары",
    tenses: "Времена"
  }[mode] || "Урок";
}

function scoreFromErrors(errors, total) {
  const penalty = total > 0 ? Math.ceil((errors / total) * 100) : errors * 10;
  return Math.max(0, Math.min(100, 100 - penalty));
}

function showLessonResult({ mode, total, errors, durationMs, done }) {
  lastLessonMode = mode;
  document.body.classList.remove("process-mode", "cards-process", "pairs-process", "tenses-process");
  document.body.classList.add("result-mode");
  document.querySelectorAll(".process-screen").forEach((item) => item.classList.add("hidden"));
  document.querySelectorAll(".setup-screen").forEach((item) => item.classList.remove("hidden"));
  document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
  $("lessonResult").classList.remove("hidden");
  const score = scoreFromErrors(errors, total);
  $("lessonResultType").textContent = `${lessonName(mode)} · результат`;
  $("lessonResultScore").textContent = `${score}/100`;
  $("lessonResultNote").textContent = score === 100
    ? "Лучший результат сегодня."
    : score >= 80
      ? "Один из лучших результатов сегодня."
      : "Есть что повторить в следующем круге.";
  $("lessonResultTime").textContent = formatDuration(durationMs);
  $("lessonResultErrors").textContent = errors;
  $("lessonResultDone").textContent = done;
}

function hideLessonResult() {
  document.body.classList.remove("result-mode");
  $("lessonResult").classList.add("hidden");
}

function showAuthError(message) {
  $("authError").textContent = message || "";
}

function renderAuth() {
  if (auth.token && auth.username) {
    document.body.classList.add("authenticated");
    $("authTitle").textContent = auth.username;
    $("authStatus").textContent = "Прогресс сохраняется на сервере.";
    $("authForm").classList.add("hidden");
    $("logoutBtn").classList.remove("hidden");
  } else {
    document.body.classList.remove("authenticated", "process-mode", "cards-process", "pairs-process", "tenses-process");
    const isRegister = auth.mode === "register";
    $("authTitle").textContent = isRegister ? "Регистрация" : "Вход";
    $("authStatus").textContent = isRegister
      ? "Создайте логин и пароль для сохранения прогресса."
      : "Введите логин и пароль, чтобы продолжить обучение.";
    $("authSubmitBtn").textContent = isRegister ? "Зарегистрироваться" : "Войти";
    $("authSwitchBtn").textContent = isRegister ? "Уже есть аккаунт? Войти" : "Регистрация";
    $("authPassword").autocomplete = isRegister ? "new-password" : "current-password";
    $("authForm").classList.remove("hidden");
    $("logoutBtn").classList.add("hidden");
  }
}

async function authRequest() {
  showAuthError("");
  const username = $("authUsername").value.trim();
  const password = $("authPassword").value;
  const path = auth.mode === "register" ? "/api/register" : "/api/login";
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Ошибка входа.");
    auth.token = payload.token;
    auth.username = payload.username;
    localStorage.setItem("uzbek-trainer-token", auth.token);
    localStorage.setItem("uzbek-trainer-username", auth.username);
    store.data = payload.progress || {};
    $("authPassword").value = "";
    renderAuth();
    renderStats();
  } catch (error) {
    showAuthError(error.message);
  }
}

async function initAuth() {
  renderAuth();
  if (!auth.token) {
    renderStats();
    return;
  }
  try {
    const response = await fetch("/api/progress", {
      headers: { "Authorization": `Bearer ${auth.token}` }
    });
    if (!response.ok) throw new Error();
    const payload = await response.json();
    store.data = payload.progress || {};
  } catch {
    auth.token = "";
    auth.username = "";
    localStorage.removeItem("uzbek-trainer-token");
    localStorage.removeItem("uzbek-trainer-username");
    showAuthError("Сессия истекла, войдите снова.");
  }
  renderAuth();
  renderStats();
}

function logout() {
  auth.token = "";
  auth.username = "";
  store.data = {};
  localStorage.removeItem("uzbek-trainer-token");
  localStorage.removeItem("uzbek-trainer-username");
  document.querySelectorAll(".process-screen").forEach((item) => item.classList.add("hidden"));
  document.querySelectorAll(".setup-screen").forEach((item) => item.classList.remove("hidden"));
  renderAuth();
  renderStats();
}

function selectedCardTypes() {
  return [...document.querySelectorAll("#cardsSetup .checks input:checked")].map((item) => item.value);
}

function enterProcess(mode) {
  hideLessonResult();
  lastLessonMode = mode;
  document.body.classList.add("process-mode", `${mode}-process`);
  $(`${mode}Setup`).classList.add("hidden");
  $(`${mode}Process`).classList.remove("hidden");
}

function showSetup(mode) {
  hideLessonResult();
  document.body.classList.remove("process-mode", "cards-process", "pairs-process", "tenses-process");
  document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  document.querySelector(`.tab[data-mode="${mode}"]`)?.classList.add("active");
  $(`${mode}Panel`).classList.add("active");
  $(`${mode}Process`).classList.add("hidden");
  $(`${mode}Setup`).classList.remove("hidden");
}

function startCards() {
  const types = selectedCardTypes();
  const limit = 10;
  const pool = WORDS.filter((word) => types.includes(word.type));
  cardDeck = shuffle(pool).slice(0, limit);
  cardIndex = 0;
  cardFlipped = false;
  cardKnownRound = 0;
  cardRepeatRound = 0;
  cardStartedAt = Date.now();
  enterProcess("cards");
  renderCard();
}

function cardDirection() {
  return Math.random() > .5 ? "uz-ru" : "ru-uz";
}

function renderCard() {
  const word = cardDeck[cardIndex];
  $("cardBack").classList.add("hidden");
  $("flashcard").classList.remove("flipped");
  cardFlipped = false;
  updateCardRoundStats();
  if (!word) {
    $("cardCategory").textContent = "готово";
    $("cardVisual").textContent = "✓";
    $("cardFront").textContent = "Круг завершен";
    $("cardAnswer").textContent = "";
    $("cardPronunciation").textContent = "";
    $("cardHint").textContent = "";
    showLessonResult({
      mode: "cards",
      total: cardDeck.length,
      errors: cardRepeatRound,
      durationMs: Date.now() - cardStartedAt,
      done: cardKnownRound
    });
    return;
  }

  const dir = cardDirection();
  word._dir = dir;
  $("cardCategory").textContent = categoryName(word.type);
  $("cardVisual").textContent = word.visual;
  $("cardFront").textContent = dir === "uz-ru" ? word.uz : word.ru;
  $("cardAnswer").textContent = dir === "uz-ru" ? word.ru : word.uz;
  $("cardPronunciation").textContent = `[${word.pron}]`;
  $("cardHint").textContent = word.hint || "";
  $("cardProgress").textContent = `${cardIndex + 1} из ${cardDeck.length}`;
}

function updateCardRoundStats() {
  $("cardDoneCount").textContent = Math.min(cardIndex, cardDeck.length);
  $("cardTotalCount").textContent = cardDeck.length;
  $("cardKnownCount").textContent = cardKnownRound;
  $("cardRepeatCount").textContent = cardRepeatRound;
  $("knowCard").disabled = !cardFlipped || !cardDeck[cardIndex];
  $("reviewCard").disabled = !cardFlipped || !cardDeck[cardIndex];
}

function flipCard() {
  if (!cardDeck[cardIndex]) return;
  cardFlipped = !cardFlipped;
  $("cardBack").classList.toggle("hidden", !cardFlipped);
  $("flashcard").classList.toggle("flipped", cardFlipped);
  updateCardRoundStats();
}

function markCard(field) {
  const word = cardDeck[cardIndex];
  if (!word) return;
  if (!cardFlipped) {
    return;
  }
  store.bump(word.id, field);
  if (field === "known") cardKnownRound += 1;
  if (field === "review") cardRepeatRound += 1;
  cardIndex += 1;
  renderCard();
}

function startPairs() {
  const limit = Math.max(2, Math.min(7, Number($("pairLimit").value) || 7));
  const category = $("pairCategory").value;
  const pool = category === "all" ? WORDS : WORDS.filter((word) => word.type === category);
  const round = shuffle(pool).slice(0, limit);
  currentPair = { ru: null, uz: null, done: 0, total: round.length, errors: 0, startedAt: Date.now(), savedResult: false };
  enterProcess("pairs");
  $("pairBoard").classList.remove("hidden");
  $("pairResult").classList.add("hidden");
  $("ruColumn").innerHTML = "";
  $("uzColumn").innerHTML = "";
  shuffle(round).forEach((word) => $("ruColumn").appendChild(pairButton(word, "ru")));
  shuffle(round).forEach((word) => $("uzColumn").appendChild(pairButton(word, "uz")));
  updatePairStats();
}

function pairButton(word, side) {
  const button = document.createElement("button");
  button.className = "match-item";
  button.textContent = side === "ru" ? word.ru : word.uz;
  button.dataset.id = word.id;
  button.dataset.side = side;
  button.addEventListener("click", () => choosePair(button));
  return button;
}

function choosePair(button) {
  if (button.disabled) return;
  const side = button.dataset.side;
  const previous = currentPair[side];
  if (previous) previous.classList.remove("selected");
  currentPair[side] = previous === button ? null : button;
  button.classList.toggle("selected", currentPair[side] === button);
  if (currentPair.ru && currentPair.uz) checkPair();
}

function checkPair() {
  const ru = currentPair.ru;
  const uz = currentPair.uz;
  const ok = ru.dataset.id === uz.dataset.id;
  ru.classList.remove("selected");
  uz.classList.remove("selected");
  ru.classList.add(ok ? "correct" : "wrong");
  uz.classList.add(ok ? "correct" : "wrong");
  setTimeout(() => {
    if (ok) {
      ru.className = "match-item done";
      uz.className = "match-item done";
      ru.disabled = true;
      uz.disabled = true;
      currentPair.done += 1;
      store.bump(ru.dataset.id, "known");
    } else {
      currentPair.errors += 1;
      ru.classList.remove("wrong");
      uz.classList.remove("wrong");
    }
    currentPair.ru = null;
    currentPair.uz = null;
    updatePairStats();
    if (currentPair.done === currentPair.total) showPairResult();
  }, ok ? 550 : 650);
}

function updatePairStats() {
  const round = currentPair.total ? Math.min(currentPair.done + 1, currentPair.total) : 0;
  $("pairDoneCount").textContent = `${round}/${currentPair.total}`;
  $("pairTotalCount").textContent = currentPair.errors;
  $("pairProgress").textContent = "";
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function comparePairResult(a, b) {
  if (a.errors !== b.errors) return a.errors - b.errors;
  return a.durationMs - b.durationMs;
}

function pairBestText(result, sameDayResults) {
  const sorted = [...sameDayResults].sort(comparePairResult);
  const best = sorted[0];
  if (!best || comparePairResult(result, best) < 0) return "Это лучший результат сегодня.";
  const withCurrent = [...sameDayResults, result].sort(comparePairResult);
  const rank = withCurrent.indexOf(result) + 1;
  if (rank <= 3) return "Это один из лучших результатов сегодня.";
  return `Лучший сегодня: ${best.errors} ошибок, ${formatDuration(best.durationMs)}.`;
}

function showPairResult() {
  if (currentPair.savedResult) return;
  currentPair.savedResult = true;
  const result = {
    date: todayKey(),
    total: currentPair.total,
    found: currentPair.done,
    errors: currentPair.errors,
    durationMs: Date.now() - currentPair.startedAt
  };
  const allResults = Array.isArray(store.data._pairResults) ? store.data._pairResults : [];
  const sameDayBefore = allResults.filter((item) => item.date === result.date && item.total === result.total);
  $("pairResultFound").textContent = `${result.found}/${result.total}`;
  $("pairResultErrors").textContent = result.errors;
  $("pairResultTime").textContent = formatDuration(result.durationMs);
  const score = scoreFromErrors(result.errors, result.total);
  $("pairResultScore").textContent = `${score}/100`;
  $("pairResultBest").textContent = `${score}/100. ${pairBestText(result, sameDayBefore)}`;
  $("pairBoard").classList.add("hidden");
  $("pairResult").classList.remove("hidden");
  store.data._pairResults = [...allResults, result].slice(-100);
  store.save();
}

function selectedTenseModes() {
  const checked = [...document.querySelectorAll('input[name="tenseMode"]:checked')].map((item) => item.value);
  return checked.length ? checked : Object.keys(TENSES);
}

function verbStem(verb) {
  if (verb === "yemoq") return "ye";
  return verb.replace(/moq$/, "");
}

function markerFor(stem, tense) {
  if (tense === "present") return "yap";
  if (tense === "past") return "di";
  return /[aeiouʻ]$/.test(stem) ? "y" : "a";
}

function surfaceVerb(stem, suffixes) {
  return stem + suffixes.filter((item) => item !== "—").join("");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isQuestionPolarity(polarity) {
  return polarity === "question" || polarity === "negativeQuestion";
}

function isNegativePolarity(polarity) {
  return polarity === "negative" || polarity === "negativeQuestion";
}

function buildRussianSentence(template, pronoun, pronounIndex, tense, polarity) {
  const subject = pronoun.ru.split("/")[0];
  const negative = isNegativePolarity(polarity) ? " не" : "";
  const punctuation = isQuestionPolarity(polarity) ? "?" : ".";
  const verb = template.ruVerb[tense][pronounIndex];
  return `${capitalize(subject)} ${template.contextRu[tense]}${negative} ${verb} ${template.objectRu}${punctuation}`;
}

function startTense() {
  if (!document.body.classList.contains("tenses-process")) {
    tenseRound = 0;
    tenseDone = 0;
    tenseAttempts = 0;
    tenseStartedAt = Date.now();
  }
  if (tenseRound >= 10) {
    showLessonResult({
      mode: "tenses",
      total: tenseAttempts || 10,
      errors: Math.max(0, tenseAttempts - tenseDone),
      durationMs: Date.now() - tenseStartedAt,
      done: tenseDone
    });
    return;
  }
  const template = shuffle(TENSE_SENTENCE_PARTS)[0];
  const verb = WORDS.find((word) => word.uz === template.verb);
  const pronounIndex = Math.floor(Math.random() * PRONOUNS.length);
  const pronoun = PRONOUNS[pronounIndex];
  const tenseValues = selectedTenseModes();
  const polarityValue = $("tensePolarity").value;
  const tense = shuffle(tenseValues)[0];
  const polarity = polarityValue === "mixed" ? shuffle(["positive", "negative", "question", "negativeQuestion"])[0] : polarityValue;
  const stem = verbStem(verb.uz);
  const suffixes = [];
  if (isNegativePolarity(polarity)) suffixes.push("ma");
  suffixes.push(markerFor(stem, tense));
  suffixes.push(pronoun[tense]);
  if (isQuestionPolarity(polarity)) suffixes.push("mi");

  enterProcess("tenses");
  tenseTask = { verb, template, pronoun, pronounIndex, tense, polarity, stem, suffixes };
  selectedPronoun = null;
  selectedSuffixes = [];
  tenseAnswered = false;
  renderTense();
}

function renderTense() {
  const { template, pronoun, pronounIndex, tense, polarity, stem, suffixes } = tenseTask;
  $("tenseRu").textContent = buildRussianSentence(template, pronoun, pronounIndex, tense, polarity);
  $("tenseMiddle").textContent = `${template.contextUz[tense]} ${template.objectUz}`;
  $("verbStem").textContent = stem;
  $("pronounSlot").textContent = "___";
  $("pronounSlot").classList.remove("filled");
  $("suffixSlots").innerHTML = suffixes.map((_, index) => `<div class="suffix-slot" data-index="${index}">+</div>`).join("");
  $("tenseResult").textContent = "";
  $("tenseResult").className = "tense-result";
  $("nextTense").classList.add("hidden");
  $("tenseDoneCount").textContent = `${tenseRound + 1}/10`;
  $("tenseTotalCount").textContent = Math.max(0, tenseAttempts - tenseDone);

  $("pronounOptions").innerHTML = "";
  shuffle(PRONOUNS).forEach((item) => {
    const button = document.createElement("button");
    button.textContent = item.uz;
    button.addEventListener("click", () => {
      if (tenseAnswered) return;
      selectedPronoun = item.uz;
      $("pronounSlot").textContent = item.uz;
      $("pronounSlot").classList.add("filled");
      checkTenseComplete();
    });
    $("pronounOptions").appendChild(button);
  });

  const distractors = ["ma", "yap", "di", "a", "y", "man", "san", "ti", "miz", "siz", "tilar", "m", "ng", "k", "ngiz", "lar", "dilar", "mi", "—"];
  const options = shuffle([...suffixes, ...shuffle(distractors.filter((item) => !suffixes.includes(item))).slice(0, 8)]);
  $("suffixOptions").innerHTML = "";
  options.forEach((item) => {
    const button = document.createElement("button");
    button.textContent = item;
    button.addEventListener("click", () => chooseSuffix(button, item));
    $("suffixOptions").appendChild(button);
  });
}

function chooseSuffix(button, value) {
  if (!tenseTask || tenseAnswered || button.classList.contains("used")) return;
  if (selectedSuffixes.length >= tenseTask.suffixes.length) return;
  const index = selectedSuffixes.length;
  selectedSuffixes.push(value);
  button.classList.add("used");
  const slot = document.querySelector(`.suffix-slot[data-index="${index}"]`);
  slot.textContent = value;
  slot.classList.add("filled");
  checkTenseComplete();
}

function checkTenseComplete() {
  if (!tenseTask || tenseAnswered || !selectedPronoun || selectedSuffixes.length !== tenseTask.suffixes.length) return;
  const pronounOk = selectedPronoun === tenseTask.pronoun.uz;
  const suffixOk = selectedSuffixes.every((item, index) => item === tenseTask.suffixes[index]);
  const result = $("tenseResult");
  if (pronounOk && suffixOk) {
    const uz = `${tenseTask.pronoun.uz} ${tenseTask.template.contextUz[tenseTask.tense]} ${tenseTask.template.objectUz} ${surfaceVerb(tenseTask.stem, tenseTask.suffixes)}`;
    result.textContent = `Верно: ${uz}`;
    result.className = "tense-result ok";
    tenseDone += 1;
  } else {
    const right = `${tenseTask.pronoun.uz} ... ${tenseTask.stem} + ${tenseTask.suffixes.join(" + ")}`;
    result.textContent = `Проверь структуру: ${right}`;
    result.className = "tense-result bad";
  }
  tenseAttempts += 1;
  tenseRound += 1;
  tenseAnswered = true;
  $("tenseDoneCount").textContent = `${Math.min(tenseRound, 10)}/10`;
  $("tenseTotalCount").textContent = Math.max(0, tenseAttempts - tenseDone);
  $("nextTense").classList.remove("hidden");
  $("nextTense").textContent = tenseRound >= 10 ? "Показать результат" : "Следующее предложение";
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    hideLessonResult();
    document.body.classList.remove("process-mode", "cards-process", "pairs-process", "tenses-process");
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`${button.dataset.mode}Panel`).classList.add("active");
  });
});

$("newCards").addEventListener("click", startCards);
$("flipCard").addEventListener("click", flipCard);
$("flashcard").addEventListener("click", flipCard);
$("knowCard").addEventListener("click", () => markCard("known"));
$("reviewCard").addEventListener("click", () => markCard("review"));
$("newPairs").addEventListener("click", startPairs);
$("pairAgain").addEventListener("click", startPairs);
$("newTense").addEventListener("click", startTense);
$("nextTense").addEventListener("click", startTense);
$("lessonAgain").addEventListener("click", () => {
  const mode = lastLessonMode;
  hideLessonResult();
  showSetup(mode);
  if (mode === "cards") startCards();
  if (mode === "pairs") startPairs();
  if (mode === "tenses") startTense();
});
$("lessonHome").addEventListener("click", () => showSetup(lastLessonMode));
$("authSubmitBtn").addEventListener("click", authRequest);
$("authSwitchBtn").addEventListener("click", () => {
  auth.mode = auth.mode === "register" ? "login" : "register";
  showAuthError("");
  renderAuth();
});
$("logoutBtn").addEventListener("click", logout);
document.querySelectorAll(".back-setup").forEach((button) => {
  button.addEventListener("click", () => showSetup(button.dataset.target));
});

document.addEventListener("keydown", (event) => {
  if (!document.querySelector("#cardsPanel.active")) return;
  if (event.code === "Space") {
    event.preventDefault();
    flipCard();
  }
  if (event.code === "ArrowRight") markCard("known");
  if (event.code === "ArrowLeft") markCard("review");
});

initAuth();
