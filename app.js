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
  key: "uzbek-trainer-progress-v1",
  data: JSON.parse(localStorage.getItem("uzbek-trainer-progress-v1") || "{}"),
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
    renderStats();
  },
  bump(id, field) {
    this.data[id] ||= { known: 0, review: 0 };
    this.data[id][field] += 1;
    this.save();
  }
};

let cardDeck = [];
let cardIndex = 0;
let cardFlipped = false;
let cardKnownRound = 0;
let cardRepeatRound = 0;
let currentPair = { ru: null, uz: null, done: 0, total: 0, score: 0 };
let tenseTask = null;
let selectedPronoun = null;
let selectedSuffixes = [];
let tenseDone = 0;
let tenseAttempts = 0;
let tenseAnswered = false;

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

function selectedCardTypes() {
  return [...document.querySelectorAll(".checks input:checked")].map((item) => item.value);
}

function enterProcess(mode) {
  document.body.classList.add("process-mode", `${mode}-process`);
  $(`${mode}Setup`).classList.add("hidden");
  $(`${mode}Process`).classList.remove("hidden");
}

function showSetup(mode) {
  document.body.classList.remove("process-mode", "cards-process", "pairs-process", "tenses-process");
  $(`${mode}Process`).classList.add("hidden");
  $(`${mode}Setup`).classList.remove("hidden");
}

function startCards() {
  const types = selectedCardTypes();
  const limit = Math.max(1, Math.min(80, Number($("cardLimit").value) || 10));
  const pool = WORDS.filter((word) => types.includes(word.type));
  cardDeck = shuffle(pool).slice(0, limit);
  cardIndex = 0;
  cardFlipped = false;
  cardKnownRound = 0;
  cardRepeatRound = 0;
  enterProcess("cards");
  renderCard();
}

function cardDirection() {
  const dir = $("cardDirection").value;
  if (dir !== "mixed") return dir;
  return Math.random() > .5 ? "uz-ru" : "ru-uz";
}

function renderCard() {
  const word = cardDeck[cardIndex];
  $("cardBack").classList.add("hidden");
  cardFlipped = false;
  updateCardRoundStats();
  if (!word) {
    $("cardCategory").textContent = "готово";
    $("cardVisual").textContent = "✓";
    $("cardFront").textContent = "Круг завершен";
    $("cardAnswer").textContent = "";
    $("cardPronunciation").textContent = "";
    $("cardHint").textContent = "";
    $("cardProgress").textContent = "Круг завершен. Можно вернуться в настройки или начать заново.";
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
}

function flipCard() {
  if (!cardDeck[cardIndex]) return;
  cardFlipped = true;
  $("cardBack").classList.remove("hidden");
}

function markCard(field) {
  const word = cardDeck[cardIndex];
  if (!word) return;
  if (!cardFlipped) {
    flipCard();
    return;
  }
  store.bump(word.id, field);
  if (field === "known") cardKnownRound += 1;
  if (field === "review") cardRepeatRound += 1;
  cardIndex += 1;
  renderCard();
}

function startPairs() {
  const limit = Math.max(2, Math.min(10, Number($("pairLimit").value) || 10));
  const category = $("pairCategory").value;
  const pool = category === "all" ? WORDS : WORDS.filter((word) => word.type === category);
  const round = shuffle(pool).slice(0, limit);
  currentPair = { ru: null, uz: null, done: 0, total: round.length, score: 0 };
  enterProcess("pairs");
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
      currentPair.score += 1;
      store.bump(ru.dataset.id, "known");
    } else {
      ru.classList.remove("wrong");
      uz.classList.remove("wrong");
    }
    currentPair.ru = null;
    currentPair.uz = null;
    updatePairStats();
  }, ok ? 550 : 650);
}

function updatePairStats() {
  const round = currentPair.total ? Math.min(currentPair.done + 1, currentPair.total) : 0;
  $("pairDoneCount").textContent = `${round}/${currentPair.total}`;
  $("pairTotalCount").textContent = currentPair.score;
  $("pairProgress").textContent = "";
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
  const template = shuffle(TENSE_SENTENCE_PARTS)[0];
  const verb = WORDS.find((word) => word.uz === template.verb);
  const pronounIndex = Math.floor(Math.random() * PRONOUNS.length);
  const pronoun = PRONOUNS[pronounIndex];
  const tenseValue = $("tenseMode").value;
  const polarityValue = $("tensePolarity").value;
  const tense = tenseValue === "mixed" ? shuffle(Object.keys(TENSES))[0] : tenseValue;
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
  tenseAnswered = true;
  $("tenseDoneCount").textContent = tenseDone;
  $("tenseTotalCount").textContent = tenseAttempts;
  $("nextTense").classList.remove("hidden");
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
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
$("newTense").addEventListener("click", startTense);
$("nextTense").addEventListener("click", startTense);
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

renderStats();
