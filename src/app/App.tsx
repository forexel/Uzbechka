import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowLeft, Eye, EyeOff, Check, RotateCcw, Clock,
  Star, AlertCircle, BookOpen, Zap, X,
} from "lucide-react";
import { WORDS, type Word, type WordType } from "./words";

// ─── Types ─────────────────────────────────────────────────────────────────
type Screen = "login" | "register" | "home" | "flashcard" | "pairs" | "tenses" | "phrases" | "result";
type LessonType = "flashcard" | "pairs" | "tenses" | "phrases";
type TenseMode = "present_yap" | "past_di" | "present_future" | "past_gan";
type BaseTenseMode = Exclude<TenseMode, "past_gan">;
type WordGroupId =
  | "noun_a1"
  | "noun_a2"
  | "verb_basic"
  | "verb_daily"
  | "verb_complex"
  | "pronoun_basic"
  | "pronoun_cases"
  | "number_1_10"
  | "number_large"
  | "number_time"
  | "number_ordinal"
  | "question_basic"
  | "question_cases"
  | "other_time"
  | "other_descriptive"
  | "other_service";

interface ResultData {
  lessonType: LessonType;
  timeSeconds: number;
  errors: number;
  score: number;
  wordsReinforced: number;
  wordIds?: string[];
}

interface AuthPayload {
  token: string;
  username: string;
  progress: Record<string, unknown>;
}

async function apiAuth(path: "/api/login" | "/api/register", username: string, password: string): Promise<AuthPayload> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Ошибка авторизации");
  return payload;
}

async function apiProgress(token: string): Promise<Record<string, unknown>> {
  const response = await fetch("/api/progress", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Требуется вход");
  const payload = await response.json();
  return payload.progress || {};
}

async function saveProgress(token: string, progress: Record<string, unknown>) {
  await fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ progress }),
  });
}

// ─── Data ──────────────────────────────────────────────────────────────────
interface LearningWord extends Word {
  cat: WordType | "num";
  img: string | null;
}

const FLASHCARDS: LearningWord[] = WORDS.map((word) => ({
  ...word,
  cat: word.type === "number" ? "num" : word.type,
  img: null,
}));

const PAIRS_WORDS = FLASHCARDS;

const COMMON_PHRASES: PhraseEx[] = [
  { id: "phrase-1", ru: "Здравствуйте.", uz: "Assalomu alaykum.", words: ["Assalomu", "alaykum"], distractors: ["Rahmat", "xayr", "nima"] },
  { id: "phrase-2", ru: "И вам здравствуйте.", uz: "Vaalaykum assalom.", words: ["Vaalaykum", "assalom"], distractors: ["Salom", "siz", "yaxshi"] },
  { id: "phrase-3", ru: "Привет.", uz: "Salom.", words: ["Salom"], distractors: ["Xayr", "Rahmat", "Mayli"] },
  { id: "phrase-4", ru: "До свидания.", uz: "Xayr.", words: ["Xayr"], distractors: ["Salom", "Iltimos", "ha"] },
  { id: "phrase-5", ru: "До встречи.", uz: "Koʻrishguncha.", words: ["Koʻrishguncha"], distractors: ["Bugun", "Rahmat", "qayerda"] },
  { id: "phrase-6", ru: "Спасибо.", uz: "Rahmat.", words: ["Rahmat"], distractors: ["Marhamat", "Xayr", "yoʻq"] },
  { id: "phrase-7", ru: "Большое спасибо.", uz: "Katta rahmat.", words: ["Katta", "rahmat"], distractors: ["kichkina", "salom", "emas"] },
  { id: "phrase-8", ru: "Пожалуйста.", uz: "Marhamat.", words: ["Marhamat"], distractors: ["Rahmat", "Uzr", "qachon"] },
  { id: "phrase-9", ru: "Извините.", uz: "Kechirasiz.", words: ["Kechirasiz"], distractors: ["Bilasiz", "Rahmat", "men"] },
  { id: "phrase-10", ru: "Простите.", uz: "Uzr.", words: ["Uzr"], distractors: ["Ular", "Salom", "bor"] },
  { id: "phrase-11", ru: "Как вы?", uz: "Yaxshimisiz?", words: ["Yaxshimisiz"], distractors: ["Yaxshi", "nima", "siz"] },
  { id: "phrase-12", ru: "Я хорошо.", uz: "Men yaxshiman.", words: ["Men", "yaxshiman"], distractors: ["siz", "yomon", "qayerda"] },
  { id: "phrase-13", ru: "Как дела?", uz: "Ishlar qanday?", words: ["Ishlar", "qanday"], distractors: ["qachon", "rahmat", "men"] },
  { id: "phrase-14", ru: "Дела хорошо.", uz: "Ishlar yaxshi.", words: ["Ishlar", "yaxshi"], distractors: ["yomon", "nima", "xayr"] },
  { id: "phrase-15", ru: "Как вас зовут?", uz: "Ismingiz nima?", words: ["Ismingiz", "nima"], distractors: ["qayerda", "rahmat", "men"] },
  { id: "phrase-16", ru: "Меня зовут Владислав.", uz: "Mening ismim Vladislav.", words: ["Mening", "ismim", "Vladislav"], distractors: ["sizning", "qanday", "xayr"] },
  { id: "phrase-17", ru: "Рад познакомиться.", uz: "Tanishganimdan xursandman.", words: ["Tanishganimdan", "xursandman"], distractors: ["rahmat", "kecha", "bor"] },
  { id: "phrase-18", ru: "Пожалуйста, повторите.", uz: "Iltimos, takrorlang.", words: ["Iltimos", "takrorlang"], distractors: ["Rahmat", "yozing", "xayr"] },
  { id: "phrase-19", ru: "Да, договорились.", uz: "Ha, boʻladi.", words: ["Ha", "boʻladi"], distractors: ["yoʻq", "emas", "qachon"] },
  { id: "phrase-20", ru: "Ладно.", uz: "Mayli.", words: ["Mayli"], distractors: ["Salom", "Rahmat", "qayerga"] },
  { id: "phrase-21", ru: "Увидимся завтра.", uz: "Ertaga koʻrishamiz.", words: ["Ertaga", "koʻrishamiz"], distractors: ["kecha", "boramiz", "rahmat"] },
  { id: "phrase-22", ru: "Доброе утро.", uz: "Xayrli tong.", words: ["Xayrli", "tong"], distractors: ["kech", "salom", "bugun"] },
  { id: "phrase-23", ru: "Добрый вечер.", uz: "Xayrli kech.", words: ["Xayrli", "kech"], distractors: ["tong", "rahmat", "qayerda"] },
  { id: "phrase-24", ru: "Спокойной ночи.", uz: "Xayrli tun.", words: ["Xayrli", "tun"], distractors: ["kun", "salom", "mayli"] },
  { id: "phrase-25", ru: "Я не понимаю.", uz: "Men tushunmayapman.", words: ["Men", "tushunmayapman"], distractors: ["bilaman", "siz", "rahmat"] },
  { id: "phrase-26", ru: "Я не знаю.", uz: "Men bilmayman.", words: ["Men", "bilmayman"], distractors: ["bilaman", "qayerda", "siz"] },
  { id: "phrase-27", ru: "Вы говорите по-русски?", uz: "Siz ruscha gapirasizmi?", words: ["Siz", "ruscha", "gapirasizmi"], distractors: ["men", "oʻzbekcha", "qayerda"] },
  { id: "phrase-28", ru: "Говорите медленнее, пожалуйста.", uz: "Iltimos, sekinroq gapiring.", words: ["Iltimos", "sekinroq", "gapiring"], distractors: ["tezroq", "rahmat", "yozing"] },
  { id: "phrase-29", ru: "Повторите еще раз, пожалуйста.", uz: "Iltimos, yana bir marta takrorlang.", words: ["Iltimos", "yana", "bir", "marta", "takrorlang"], distractors: ["rahmat", "tez", "yoʻq"] },
  { id: "phrase-30", ru: "Напишите, пожалуйста.", uz: "Iltimos, yozib bering.", words: ["Iltimos", "yozib", "bering"], distractors: ["ayting", "rahmat", "qayerga"] },
  { id: "phrase-31", ru: "Покажите, пожалуйста.", uz: "Iltimos, koʻrsating.", words: ["Iltimos", "koʻrsating"], distractors: ["yozing", "kutmoq", "xayr"] },
  { id: "phrase-32", ru: "Подождите, пожалуйста.", uz: "Iltimos, kuting.", words: ["Iltimos", "kuting"], distractors: ["keling", "rahmat", "hozir"] },
  { id: "phrase-33", ru: "Сколько это стоит?", uz: "Bu qancha turadi?", words: ["Bu", "qancha", "turadi"], distractors: ["qayerda", "kerak", "men"] },
  { id: "phrase-34", ru: "Который час?", uz: "Soat necha?", words: ["Soat", "necha"], distractors: ["qachon", "qayerda", "bugun"] },
  { id: "phrase-35", ru: "Где туалет?", uz: "Hojatxona qayerda?", words: ["Hojatxona", "qayerda"], distractors: ["maktab", "qachon", "bor"] },
  { id: "phrase-36", ru: "Где метро?", uz: "Metro qayerda?", words: ["Metro", "qayerda"], distractors: ["qayerga", "uy", "rahmat"] },
  { id: "phrase-37", ru: "Где находится аптека?", uz: "Dorixona qayerda?", words: ["Dorixona", "qayerda"], distractors: ["oshxona", "qachon", "yoʻq"] },
  { id: "phrase-38", ru: "Мне нужна вода.", uz: "Menga suv kerak.", words: ["Menga", "suv", "kerak"], distractors: ["choy", "sizga", "bor"] },
  { id: "phrase-39", ru: "Мне нужно такси.", uz: "Menga taksi kerak.", words: ["Menga", "taksi", "kerak"], distractors: ["suv", "sizga", "qayerda"] },
  { id: "phrase-40", ru: "Я хочу чай.", uz: "Men choy xohlayman.", words: ["Men", "choy", "xohlayman"], distractors: ["suv", "siz", "kerak"] },
  { id: "phrase-41", ru: "Я хочу оплатить.", uz: "Men toʻlamoqchiman.", words: ["Men", "toʻlamoqchiman"], distractors: ["xohlayman", "rahmat", "siz"] },
  { id: "phrase-42", ru: "Можно?", uz: "Mumkinmi?", words: ["Mumkinmi"], distractors: ["Kerakmi", "Rahmat", "Yoʻq"] },
  { id: "phrase-43", ru: "Мне можно?", uz: "Menga mumkinmi?", words: ["Menga", "mumkinmi"], distractors: ["sizga", "kerakmi", "rahmat"] },
  { id: "phrase-44", ru: "Помогите мне, пожалуйста.", uz: "Iltimos, menga yordam bering.", words: ["Iltimos", "menga", "yordam", "bering"], distractors: ["rahmat", "sizga", "yozing"] },
  { id: "phrase-45", ru: "Вы можете мне помочь?", uz: "Menga yordam bera olasizmi?", words: ["Menga", "yordam", "bera", "olasizmi"], distractors: ["kerak", "qayerda", "rahmat"] },
  { id: "phrase-46", ru: "Я заблудился.", uz: "Men adashib qoldim.", words: ["Men", "adashib", "qoldim"], distractors: ["keldim", "siz", "bugun"] },
  { id: "phrase-47", ru: "Нет проблем.", uz: "Muammo yoʻq.", words: ["Muammo", "yoʻq"], distractors: ["bor", "rahmat", "yaxshi"] },
  { id: "phrase-48", ru: "Все хорошо.", uz: "Hammasi yaxshi.", words: ["Hammasi", "yaxshi"], distractors: ["yomon", "nima", "rahmat"] },
  { id: "phrase-49", ru: "Ничего страшного.", uz: "Hechqisi yoʻq.", words: ["Hechqisi", "yoʻq"], distractors: ["bor", "salom", "yaxshi"] },
  { id: "phrase-50", ru: "Откуда вы?", uz: "Siz qayerdansiz?", words: ["Siz", "qayerdansiz"], distractors: ["qayerda", "men", "rahmat"] },
  { id: "phrase-51", ru: "Я из России.", uz: "Men Rossiyadanman.", words: ["Men", "Rossiyadanman"], distractors: ["siz", "qayerdansiz", "Toshkentdanman"] },
  { id: "phrase-52", ru: "Я учу узбекский язык.", uz: "Men oʻzbek tilini oʻrganyapman.", words: ["Men", "oʻzbek", "tilini", "oʻrganyapman"], distractors: ["ruscha", "gapiryapman", "siz"] },
  { id: "phrase-53", ru: "Я немного говорю по-узбекски.", uz: "Men ozgina oʻzbekcha gapiraman.", words: ["Men", "ozgina", "oʻzbekcha", "gapiraman"], distractors: ["ruscha", "koʻp", "bilmayman"] },
  { id: "phrase-54", ru: "Что это значит?", uz: "Bu nimani anglatadi?", words: ["Bu", "nimani", "anglatadi"], distractors: ["qayerda", "kerak", "rahmat"] },
  { id: "phrase-55", ru: "Я не понимаю это слово.", uz: "Men bu soʻzni tushunmayapman.", words: ["Men", "bu", "soʻzni", "tushunmayapman"], distractors: ["bilaman", "gapiraman", "siz"] },
  { id: "phrase-56", ru: "Позвоните мне.", uz: "Menga qoʻngʻiroq qiling.", words: ["Menga", "qoʻngʻiroq", "qiling"], distractors: ["yozing", "sizga", "rahmat"] },
  { id: "phrase-57", ru: "Позвоню позже.", uz: "Keyin qoʻngʻiroq qilaman.", words: ["Keyin", "qoʻngʻiroq", "qilaman"], distractors: ["hozir", "yozaman", "rahmat"] },
  { id: "phrase-58", ru: "Пойдем.", uz: "Ketdik.", words: ["Ketdik"], distractors: ["Keldik", "Rahmat", "Mayli"] },
  { id: "phrase-59", ru: "Я голоден.", uz: "Men ochman.", words: ["Men", "ochman"], distractors: ["chanqadim", "siz", "yaxshi"] },
  { id: "phrase-60", ru: "Я хочу пить.", uz: "Men chanqadim.", words: ["Men", "chanqadim"], distractors: ["ochman", "choy", "kerak"] },
  { id: "phrase-61", ru: "Хорошо.", uz: "Yaxshi.", words: ["Yaxshi"], distractors: ["Yomon", "Rahmat", "Salom"] },
  { id: "phrase-62", ru: "Очень хорошо.", uz: "Juda yaxshi.", words: ["Juda", "yaxshi"], distractors: ["yomon", "oz", "rahmat"] },
  { id: "phrase-63", ru: "Неплохо.", uz: "Yomon emas.", words: ["Yomon", "emas"], distractors: ["yaxshi", "juda", "bor"] },
  { id: "phrase-64", ru: "Отлично.", uz: "Ajoyib.", words: ["Ajoyib"], distractors: ["Qiyin", "Rahmat", "Mayli"] },
  { id: "phrase-65", ru: "Все в порядке.", uz: "Hammasi joyida.", words: ["Hammasi", "joyida"], distractors: ["yaxshi", "yoʻq", "rahmat"] },
  { id: "phrase-66", ru: "Как прошел день?", uz: "Kuningiz qanday oʻtdi?", words: ["Kuningiz", "qanday", "oʻtdi"], distractors: ["bugun", "qayerda", "rahmat"] },
  { id: "phrase-67", ru: "День прошел хорошо.", uz: "Kunim yaxshi oʻtdi.", words: ["Kunim", "yaxshi", "oʻtdi"], distractors: ["yomon", "qanday", "rahmat"] },
  { id: "phrase-68", ru: "Как настроение?", uz: "Kayfiyatingiz qanday?", words: ["Kayfiyatingiz", "qanday"], distractors: ["qachon", "yaxshi", "rahmat"] },
  { id: "phrase-69", ru: "Настроение хорошее.", uz: "Kayfiyatim yaxshi.", words: ["Kayfiyatim", "yaxshi"], distractors: ["yomon", "qanday", "salom"] },
  { id: "phrase-70", ru: "Что нового?", uz: "Nima yangilik?", words: ["Nima", "yangilik"], distractors: ["qayerda", "rahmat", "bor"] },
  { id: "phrase-71", ru: "Ничего нового.", uz: "Yangilik yoʻq.", words: ["Yangilik", "yoʻq"], distractors: ["bor", "nima", "rahmat"] },
  { id: "phrase-72", ru: "Давно не виделись.", uz: "Anchadan beri koʻrishmadik.", words: ["Anchadan", "beri", "koʻrishmadik"], distractors: ["bugun", "rahmat", "koʻrdik"] },
  { id: "phrase-73", ru: "Рад вас видеть.", uz: "Sizni koʻrganimdan xursandman.", words: ["Sizni", "koʻrganimdan", "xursandman"], distractors: ["menga", "rahmat", "qayerda"] },
  { id: "phrase-74", ru: "Хорошего дня.", uz: "Kuningiz yaxshi oʻtsin.", words: ["Kuningiz", "yaxshi", "oʻtsin"], distractors: ["kecha", "rahmat", "boʻlsin"] },
  { id: "phrase-75", ru: "Хорошего вечера.", uz: "Kechingiz yaxshi oʻtsin.", words: ["Kechingiz", "yaxshi", "oʻtsin"], distractors: ["tong", "rahmat", "kun"] },
  { id: "phrase-76", ru: "Хороших выходных.", uz: "Dam olish kunlaringiz yaxshi oʻtsin.", words: ["Dam", "olish", "kunlaringiz", "yaxshi", "oʻtsin"], distractors: ["ish", "kecha", "rahmat"] },
  { id: "phrase-77", ru: "Удачи.", uz: "Omad.", words: ["Omad"], distractors: ["Rahmat", "Salom", "Xayr"] },
  { id: "phrase-78", ru: "Поздравляю.", uz: "Tabriklayman.", words: ["Tabriklayman"], distractors: ["Kechirasiz", "Rahmat", "Mayli"] },
  { id: "phrase-79", ru: "Будьте здоровы.", uz: "Sogʻ boʻling.", words: ["Sogʻ", "boʻling"], distractors: ["yaxshi", "rahmat", "emas"] },
  { id: "phrase-80", ru: "Приятного аппетита.", uz: "Yoqimli ishtaha.", words: ["Yoqimli", "ishtaha"], distractors: ["mazali", "rahmat", "choy"] },
  { id: "phrase-81", ru: "Добро пожаловать.", uz: "Xush kelibsiz.", words: ["Xush", "kelibsiz"], distractors: ["xayr", "rahmat", "keling"] },
  { id: "phrase-82", ru: "Заходите, пожалуйста.", uz: "Marhamat, kiring.", words: ["Marhamat", "kiring"], distractors: ["chiqing", "rahmat", "xayr"] },
  { id: "phrase-83", ru: "Садитесь, пожалуйста.", uz: "Marhamat, oʻtiring.", words: ["Marhamat", "oʻtiring"], distractors: ["turing", "rahmat", "kiring"] },
  { id: "phrase-84", ru: "Хотите чай?", uz: "Choy ichasizmi?", words: ["Choy", "ichasizmi"], distractors: ["suv", "yeysizmi", "rahmat"] },
  { id: "phrase-85", ru: "Да, конечно.", uz: "Ha, albatta.", words: ["Ha", "albatta"], distractors: ["yoʻq", "rahmat", "mayli"] },
  { id: "phrase-86", ru: "Нет, спасибо.", uz: "Yoʻq, rahmat.", words: ["Yoʻq", "rahmat"], distractors: ["ha", "marhamat", "mayli"] },
  { id: "phrase-87", ru: "Не сейчас.", uz: "Hozir emas.", words: ["Hozir", "emas"], distractors: ["keyin", "rahmat", "bor"] },
  { id: "phrase-88", ru: "Позже.", uz: "Keyinroq.", words: ["Keyinroq"], distractors: ["Hozir", "Rahmat", "Salom"] },
  { id: "phrase-89", ru: "Что вы делаете?", uz: "Nima qilyapsiz?", words: ["Nima", "qilyapsiz"], distractors: ["qayerda", "men", "rahmat"] },
  { id: "phrase-90", ru: "Куда вы идете?", uz: "Qayerga ketyapsiz?", words: ["Qayerga", "ketyapsiz"], distractors: ["qayerda", "kelayapsiz", "rahmat"] },
  { id: "phrase-91", ru: "Где вы живете?", uz: "Qayerda yashaysiz?", words: ["Qayerda", "yashaysiz"], distractors: ["qayerga", "ishlaysiz", "rahmat"] },
  { id: "phrase-92", ru: "Сколько вам лет?", uz: "Yoshingiz nechida?", words: ["Yoshingiz", "nechida"], distractors: ["qachon", "qancha", "rahmat"] },
  { id: "phrase-93", ru: "Что это?", uz: "Bu nima?", words: ["Bu", "nima"], distractors: ["qachon", "qayerda", "rahmat"] },
  { id: "phrase-94", ru: "Я сейчас провожу урок.", uz: "Men hozir dars o‘tyapman.", words: ["Men", "hozir", "dars", "o‘tyapman"], distractors: ["kecha", "ish", "uxladim"] },
  { id: "phrase-95", ru: "Будем больше говорить по-узбекски.", uz: "Ko‘proq o‘zbekcha gapiramiz.", words: ["Ko‘proq", "o‘zbekcha", "gapiramiz"], distractors: ["ruscha", "kamroq", "yozamiz"] },
  { id: "phrase-96", ru: "Сколько часов Вы спали вчера?", uz: "Kecha necha soat uxladingiz?", words: ["Kecha", "necha", "soat", "uxladingiz"], distractors: ["qachon", "ishdan", "keldingiz"] },
  { id: "phrase-97", ru: "Я вчера спал семь часов.", uz: "Men kecha yetti soat uxladim.", words: ["Men", "kecha", "yetti", "soat", "uxladim"], distractors: ["sakkiz", "bugun", "ketdim"] },
  { id: "phrase-98", ru: "Во сколько?", uz: "Soat nechada?", words: ["Soat", "nechada"], distractors: ["qachon", "qayerda", "kecha"] },
  { id: "phrase-99", ru: "В девять часов.", uz: "Soat to‘qqizda.", words: ["Soat", "to‘qqizda"], distractors: ["yettida", "nechada", "kecha"] },
  { id: "phrase-100", ru: "Когда Вы ушли с работы?", uz: "Siz ishdan qachon ketdingiz?", words: ["Siz", "ishdan", "qachon", "ketdingiz"], distractors: ["ishga", "keldingiz", "hozir"] },
  { id: "phrase-101", ru: "Я ушёл с работы в семь часов.", uz: "Men ishdan soat yettida ketdim.", words: ["Men", "ishdan", "soat", "yettida", "ketdim"], distractors: ["to‘qqizda", "keldim", "ishga"] },
  { id: "phrase-102", ru: "Что Вы сейчас делаете?", uz: "Siz hozir nima qilyapsiz?", words: ["Siz", "hozir", "nima", "qilyapsiz"], distractors: ["kecha", "qachon", "uxladingiz"] },
  { id: "phrase-103", ru: "Вы любите плов?", uz: "Siz oshni yaxshi ko‘rasizmi?", words: ["Siz", "oshni", "yaxshi", "ko‘rasizmi"], distractors: ["ichasizmi", "yomon", "rahmat"] },
  { id: "phrase-104", ru: "Я спал восемь часов.", uz: "Men sakkiz soat uxladim.", words: ["Men", "sakkiz", "soat", "uxladim"], distractors: ["yetti", "kecha", "ketdim"] },
];

const PHRASE_WORD_BANK = Array.from(new Set(COMMON_PHRASES.flatMap(phrase => [...phrase.words, ...phrase.distractors])));

function phraseChipsFor(exercise: PhraseEx) {
  const chips = Array.from(new Set([...exercise.words, ...exercise.distractors]));
  const extras = shuffle(PHRASE_WORD_BANK.filter(word => !chips.includes(word)));
  return shuffle([...chips, ...extras.slice(0, Math.max(0, 10 - chips.length))]);
}

type PronounUz = "men" | "sen" | "u" | "biz" | "siz";

interface TensesEx {
  tense: TenseMode;
  ru: string;
  uz_stem: string;
  pronouns: string[];
  correct_pronoun: string;
  chips: string[];
  correct_chips: string[];
  negative?: boolean;
  question?: boolean;
}

interface PhraseEx {
  id: string;
  ru: string;
  uz: string;
  words: string[];
  distractors: string[];
}

const PRONOUNS: { uz: PronounUz; ru: string; present: string; past: string; future: string; gan: string; edi: string }[] = [
  { uz: "men", ru: "Я", present: "man", past: "m", future: "man", gan: "man", edi: "edim" },
  { uz: "sen", ru: "Ты", present: "san", past: "ng", future: "san", gan: "san", edi: "eding" },
  { uz: "u", ru: "Он/она", present: "ti", past: "", future: "di", gan: "", edi: "edi" },
  { uz: "biz", ru: "Мы", present: "miz", past: "k", future: "miz", gan: "miz", edi: "edik" },
  { uz: "siz", ru: "Вы", present: "siz", past: "ngiz", future: "siz", gan: "siz", edi: "edingiz" },
];

type RuForms = Record<PronounUz, string>;

interface TenseScenario {
  stem: string;
  uz: Record<BaseTenseMode, string>;
  ruObject: string;
  verbs: Record<BaseTenseMode, RuForms>;
}

const RU_SUBJECT: Record<PronounUz, string> = {
  men: "Я",
  sen: "Ты",
  u: "Он",
  biz: "Мы",
  siz: "Вы",
};

const TENSE_CUES: Record<BaseTenseMode, { uz: string; ru: string }> = {
  present_yap: { uz: "hozir", ru: "сейчас" },
  past_di: { uz: "kecha", ru: "вчера" },
  present_future: { uz: "ertaga", ru: "завтра" },
};

const TENSE_SCENARIOS: TenseScenario[] = [
  {
    stem: "oʻqi",
    uz: { present_yap: "kitob oʻqi", past_di: "kitob oʻqi", present_future: "kitob oʻqi" },
    ruObject: "книгу",
    verbs: {
      present_yap: { men: "читаю", sen: "читаешь", u: "читает", biz: "читаем", siz: "читаете" },
      past_di: { men: "читал", sen: "читал", u: "читал", biz: "читали", siz: "читали" },
      present_future: { men: "прочитаю", sen: "прочитаешь", u: "прочитает", biz: "прочитаем", siz: "прочитаете" },
    },
  },
  {
    stem: "yoz",
    uz: { present_yap: "reja yoz", past_di: "reja yoz", present_future: "reja yoz" },
    ruObject: "план",
    verbs: {
      present_yap: { men: "пишу", sen: "пишешь", u: "пишет", biz: "пишем", siz: "пишете" },
      past_di: { men: "писал", sen: "писал", u: "писал", biz: "писали", siz: "писали" },
      present_future: { men: "напишу", sen: "напишешь", u: "напишет", biz: "напишем", siz: "напишете" },
    },
  },
  {
    stem: "ich",
    uz: { present_yap: "choy ich", past_di: "choy ich", present_future: "choy ich" },
    ruObject: "чай",
    verbs: {
      present_yap: { men: "пью", sen: "пьешь", u: "пьет", biz: "пьем", siz: "пьете" },
      past_di: { men: "пил", sen: "пил", u: "пил", biz: "пили", siz: "пили" },
      present_future: { men: "выпью", sen: "выпьешь", u: "выпьет", biz: "выпьем", siz: "выпьете" },
    },
  },
  {
    stem: "ye",
    uz: { present_yap: "ovqat ye", past_di: "ovqat ye", present_future: "ovqat ye" },
    ruObject: "еду",
    verbs: {
      present_yap: { men: "ем", sen: "ешь", u: "ест", biz: "едим", siz: "едите" },
      past_di: { men: "ел", sen: "ел", u: "ел", biz: "ели", siz: "ели" },
      present_future: { men: "поем", sen: "поешь", u: "поест", biz: "поедим", siz: "поедите" },
    },
  },
  {
    stem: "ishla",
    uz: { present_yap: "ofisda ishla", past_di: "ofisda ishla", present_future: "ofisda ishla" },
    ruObject: "в офисе",
    verbs: {
      present_yap: { men: "работаю", sen: "работаешь", u: "работает", biz: "работаем", siz: "работаете" },
      past_di: { men: "работал", sen: "работал", u: "работал", biz: "работали", siz: "работали" },
      present_future: { men: "буду работать", sen: "будешь работать", u: "будет работать", biz: "будем работать", siz: "будете работать" },
    },
  },
  {
    stem: "saqla",
    uz: { present_yap: "hujjat saqla", past_di: "hujjat saqla", present_future: "hujjat saqla" },
    ruObject: "документ",
    verbs: {
      present_yap: { men: "сохраняю", sen: "сохраняешь", u: "сохраняет", biz: "сохраняем", siz: "сохраняете" },
      past_di: { men: "сохранил", sen: "сохранил", u: "сохранил", biz: "сохранили", siz: "сохранили" },
      present_future: { men: "сохраню", sen: "сохранишь", u: "сохранит", biz: "сохраним", siz: "сохраните" },
    },
  },
  {
    stem: "sana",
    uz: { present_yap: "pul sana", past_di: "pul sana", present_future: "pul sana" },
    ruObject: "деньги",
    verbs: {
      present_yap: { men: "считаю", sen: "считаешь", u: "считает", biz: "считаем", siz: "считаете" },
      past_di: { men: "считал", sen: "считал", u: "считал", biz: "считали", siz: "считали" },
      present_future: { men: "посчитаю", sen: "посчитаешь", u: "посчитает", biz: "посчитаем", siz: "посчитаете" },
    },
  },
  {
    stem: "koʻr",
    uz: { present_yap: "odam koʻr", past_di: "odam koʻr", present_future: "odam koʻr" },
    ruObject: "человека",
    verbs: {
      present_yap: { men: "вижу", sen: "видишь", u: "видит", biz: "видим", siz: "видите" },
      past_di: { men: "видел", sen: "видел", u: "видел", biz: "видели", siz: "видели" },
      present_future: { men: "увижу", sen: "увидишь", u: "увидит", biz: "увидим", siz: "увидите" },
    },
  },
  {
    stem: "soʻra",
    uz: { present_yap: "rahbardan soʻra", past_di: "rahbardan soʻra", present_future: "rahbardan soʻra" },
    ruObject: "руководителя",
    verbs: {
      present_yap: { men: "спрашиваю", sen: "спрашиваешь", u: "спрашивает", biz: "спрашиваем", siz: "спрашиваете" },
      past_di: { men: "спросил", sen: "спросил", u: "спросил", biz: "спросили", siz: "спросили" },
      present_future: { men: "спрошу", sen: "спросишь", u: "спросит", biz: "спросим", siz: "спросите" },
    },
  },
  {
    stem: "tanla",
    uz: { present_yap: "ovqat tanla", past_di: "ovqat tanla", present_future: "ovqat tanla" },
    ruObject: "еду",
    verbs: {
      present_yap: { men: "выбираю", sen: "выбираешь", u: "выбирает", biz: "выбираем", siz: "выбираете" },
      past_di: { men: "выбрал", sen: "выбрал", u: "выбрал", biz: "выбрали", siz: "выбрали" },
      present_future: { men: "выберу", sen: "выберешь", u: "выберет", biz: "выберем", siz: "выберете" },
    },
  },
  {
    stem: "yech",
    uz: { present_yap: "masala yech", past_di: "masala yech", present_future: "masala yech" },
    ruObject: "задачу",
    verbs: {
      present_yap: { men: "решаю", sen: "решаешь", u: "решает", biz: "решаем", siz: "решаете" },
      past_di: { men: "решил", sen: "решил", u: "решил", biz: "решили", siz: "решили" },
      present_future: { men: "решу", sen: "решишь", u: "решит", biz: "решим", siz: "решите" },
    },
  },
  {
    stem: "bor",
    uz: { present_yap: "ishga bor", past_di: "ishga bor", present_future: "ishga bor" },
    ruObject: "на работу",
    verbs: {
      present_yap: { men: "иду", sen: "идешь", u: "идет", biz: "идем", siz: "идете" },
      past_di: { men: "ходил", sen: "ходил", u: "ходил", biz: "ходили", siz: "ходили" },
      present_future: { men: "пойду", sen: "пойдешь", u: "пойдет", biz: "пойдем", siz: "пойдете" },
    },
  },
  {
    stem: "qayt",
    uz: { present_yap: "ofisdan qayt", past_di: "ofisdan qayt", present_future: "ofisdan qayt" },
    ruObject: "из офиса",
    verbs: {
      present_yap: { men: "возвращаюсь", sen: "возвращаешься", u: "возвращается", biz: "возвращаемся", siz: "возвращаетесь" },
      past_di: { men: "вернулся", sen: "вернулся", u: "вернулся", biz: "вернулись", siz: "вернулись" },
      present_future: { men: "вернусь", sen: "вернешься", u: "вернется", biz: "вернемся", siz: "вернетесь" },
    },
  },
  {
    stem: "kel",
    uz: { present_yap: "maktabga kel", past_di: "maktabga kel", present_future: "maktabga kel" },
    ruObject: "в школу",
    verbs: {
      present_yap: { men: "прихожу", sen: "приходишь", u: "приходит", biz: "приходим", siz: "приходите" },
      past_di: { men: "пришел", sen: "пришел", u: "пришел", biz: "пришли", siz: "пришли" },
      present_future: { men: "приду", sen: "придешь", u: "придет", biz: "придем", siz: "придете" },
    },
  },
  {
    stem: "kut",
    uz: { present_yap: "doʻst kut", past_di: "doʻst kut", present_future: "doʻst kut" },
    ruObject: "друга",
    verbs: {
      present_yap: { men: "жду", sen: "ждешь", u: "ждет", biz: "ждем", siz: "ждете" },
      past_di: { men: "ждал", sen: "ждал", u: "ждал", biz: "ждали", siz: "ждали" },
      present_future: { men: "подожду", sen: "подождешь", u: "подождет", biz: "подождем", siz: "подождете" },
    },
  },
  {
    stem: "uchrash",
    uz: { present_yap: "darsdan keyin uchrash", past_di: "darsdan keyin uchrash", present_future: "darsdan keyin uchrash" },
    ruObject: "после урока",
    verbs: {
      present_yap: { men: "встречаюсь", sen: "встречаешься", u: "встречается", biz: "встречаемся", siz: "встречаетесь" },
      past_di: { men: "встретился", sen: "встретился", u: "встретился", biz: "встретились", siz: "встретились" },
      present_future: { men: "встречусь", sen: "встретишься", u: "встретится", biz: "встретимся", siz: "встретитесь" },
    },
  },
  {
    stem: "och",
    uz: { present_yap: "hujjat och", past_di: "hujjat och", present_future: "hujjat och" },
    ruObject: "документ",
    verbs: {
      present_yap: { men: "открываю", sen: "открываешь", u: "открывает", biz: "открываем", siz: "открываете" },
      past_di: { men: "открыл", sen: "открыл", u: "открыл", biz: "открыли", siz: "открыли" },
      present_future: { men: "открою", sen: "откроешь", u: "откроет", biz: "откроем", siz: "откроете" },
    },
  },
  {
    stem: "yop",
    uz: { present_yap: "hujjat yop", past_di: "hujjat yop", present_future: "hujjat yop" },
    ruObject: "документ",
    verbs: {
      present_yap: { men: "закрываю", sen: "закрываешь", u: "закрывает", biz: "закрываем", siz: "закрываете" },
      past_di: { men: "закрыл", sen: "закрыл", u: "закрыл", biz: "закрыли", siz: "закрыли" },
      present_future: { men: "закрою", sen: "закроешь", u: "закроет", biz: "закроем", siz: "закроете" },
    },
  },
];

interface GanScenario {
  stem: string;
  uz: string;
  ruObject: string;
  experience: RuForms;
  remotePast: RuForms;
}

const GAN_SCENARIOS: GanScenario[] = [
  {
    stem: "oʻqi",
    uz: "bu kitobni oʻqi",
    ruObject: "эту книгу",
    experience: { men: "читал", sen: "читал", u: "читал", biz: "читали", siz: "читали" },
    remotePast: { men: "уже читал", sen: "уже читал", u: "уже читал", biz: "уже читали", siz: "уже читали" },
  },
  {
    stem: "yasha",
    uz: "bu yerda yasha",
    ruObject: "здесь",
    experience: { men: "жил", sen: "жил", u: "жил", biz: "жили", siz: "жили" },
    remotePast: { men: "уже жил", sen: "уже жил", u: "уже жил", biz: "уже жили", siz: "уже жили" },
  },
  {
    stem: "ishla",
    uz: "bu sohada ishla",
    ruObject: "в этой сфере",
    experience: { men: "работал", sen: "работал", u: "работал", biz: "работали", siz: "работали" },
    remotePast: { men: "уже работал", sen: "уже работал", u: "уже работал", biz: "уже работали", siz: "уже работали" },
  },
  {
    stem: "koʻr",
    uz: "bu filmni koʻr",
    ruObject: "этот фильм",
    experience: { men: "видел", sen: "видел", u: "видел", biz: "видели", siz: "видели" },
    remotePast: { men: "уже видел", sen: "уже видел", u: "уже видел", biz: "уже видели", siz: "уже видели" },
  },
  {
    stem: "yeb koʻr",
    uz: "bu taomni yeb koʻr",
    ruObject: "это блюдо",
    experience: { men: "пробовал", sen: "пробовал", u: "пробовал", biz: "пробовали", siz: "пробовали" },
    remotePast: { men: "уже пробовал", sen: "уже пробовал", u: "уже пробовал", biz: "уже пробовали", siz: "уже пробовали" },
  },
  {
    stem: "ek",
    uz: "bu daraxtni ek",
    ruObject: "это дерево",
    experience: { men: "сажал", sen: "сажал", u: "сажал", biz: "сажали", siz: "сажали" },
    remotePast: { men: "уже сажал", sen: "уже сажал", u: "уже сажал", biz: "уже сажали", siz: "уже сажали" },
  },
  {
    stem: "eshit",
    uz: "bu qoʻshiqni eshit",
    ruObject: "эту песню",
    experience: { men: "слышал", sen: "слышал", u: "слышал", biz: "слышали", siz: "слышали" },
    remotePast: { men: "уже слышал", sen: "уже слышал", u: "уже слышал", biz: "уже слышали", siz: "уже слышали" },
  },
  {
    stem: "tani",
    uz: "bu yigitni tani",
    ruObject: "этого парня",
    experience: { men: "знал", sen: "знал", u: "знал", biz: "знали", siz: "знали" },
    remotePast: { men: "уже знал", sen: "уже знал", u: "уже знал", biz: "уже знали", siz: "уже знали" },
  },
];

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function makeTenseChips(correct: string[], mode: TenseMode) {
  const extras = mode === "past_gan"
    ? ["gan", "ma", "man", "san", "miz", "siz", "lar", "edim", "eding", "edi", "edik", "edingiz", "edilar", "mi", "di", "m", "ng", "ngiz", "k", "yap", "a", "y"]
    : mode === "past_di"
      ? ["di", "m", "ng", "ngiz", "k", "mi", "ma", "man", "san", "miz", "siz", "gan", "edim"]
    : mode === "present_future"
      ? ["a", "y", "man", "san", "di", "miz", "siz", "mi", "ma", "yap", "gan", "m", "ng"]
      : ["ma", "yap", "man", "san", "ti", "miz", "siz", "mi", "di", "a", "y", "gan", "edim"];
  return Array.from(new Set([...correct, ...shuffle(extras).slice(0, 9)]));
}

function pick<T>(items: T[], index: number) {
  return items[Math.abs(index) % items.length];
}

function buildTenseBank(size = 10000): TensesEx[] {
  const modes: TenseMode[] = ["present_yap", "past_di", "present_future", "past_gan"];

  return Array.from({ length: size }, (_, i) => {
    const mode = modes[i % modes.length];
    const pronoun = PRONOUNS[(i * 7 + 2) % PRONOUNS.length];
    if (mode === "past_gan") {
      const scenario = GAN_SCENARIOS[(i * 13 + Math.floor(i / modes.length)) % GAN_SCENARIOS.length];
      const variant = i % 6;
      const remotePast = variant >= 3;
      const negative = variant === 1 || variant === 4;
      const question = variant === 2 || variant === 5;
      const cue = remotePast
        ? pick([{ uz: "oʻshanda", ru: "тогда" }, { uz: "yoshligimda", ru: "в детстве" }, { uz: "koʻp yillar oldin", ru: "много лет назад" }], i)
        : negative
          ? { uz: "hech qachon", ru: "никогда" }
          : pick([{ uz: "oldin", ru: "раньше" }, { uz: "avval", ru: "прежде" }, { uz: "qayerdadir", ru: "где-то раньше" }], i);
      const subject = RU_SUBJECT[pronoun.uz];
      const verb = (remotePast ? scenario.remotePast : scenario.experience)[pronoun.uz];
      const ruCore = remotePast && negative
        ? `${subject} ${cue.ru} еще не ${scenario.experience[pronoun.uz]} ${scenario.ruObject}`
        : `${subject} ${cue.ru} ${negative ? "не " : ""}${verb} ${scenario.ruObject}`;
      const correct = remotePast
        ? [...(negative ? ["ma"] : []), "gan", pronoun.edi, ...(question ? ["mi"] : [])]
        : [...(negative ? ["ma"] : []), "gan", ...(pronoun.gan ? [pronoun.gan] : []), ...(question ? ["mi"] : [])];
      const wrongPronouns = shuffle(PRONOUNS.filter(p => p.uz !== pronoun.uz).map(p => p.uz)).slice(0, 3);

      return {
        tense: mode,
        ru: `${sentenceCase(ruCore)}${question ? "?" : "."}`,
        uz_stem: `${cue.uz} ${scenario.uz}`.replace(/\s+/g, " ").trim(),
        pronouns: shuffle([pronoun.uz, ...wrongPronouns]),
        correct_pronoun: pronoun.uz,
        chips: makeTenseChips(correct, mode),
        correct_chips: correct,
        negative,
        question,
      };
    }

    const scenario = TENSE_SCENARIOS[(i * 17 + Math.floor(i / modes.length)) % TENSE_SCENARIOS.length];
    const variant = i % 8;
    const negative = variant === 2 || variant === 6;
    const question = variant === 1 || variant === 5 || variant === 6;
    const cue = TENSE_CUES[mode];
    const subject = RU_SUBJECT[pronoun.uz];
    const verb = scenario.verbs[mode][pronoun.uz];
    const ruCore = `${subject} ${cue.ru} ${negative ? "не " : ""}${verb} ${scenario.ruObject}`;
    const ru = `${sentenceCase(ruCore)}${question ? "?" : "."}`;

    const personChip = mode === "past_di" ? pronoun.past : mode === "present_future" ? pronoun.future : pronoun.present;
    const correct = mode === "past_di"
      ? [...(negative ? ["ma"] : []), "di", ...(personChip ? [personChip] : []), ...(question ? ["mi"] : [])]
      : mode === "present_future"
        ? [...(negative ? ["ma", "y"] : [scenario.stem.endsWith("a") ? "y" : "a"]), personChip, ...(question ? ["mi"] : [])]
        : [...(negative ? ["ma"] : []), "yap", personChip, ...(question ? ["mi"] : [])];

    const wrongPronouns = shuffle(PRONOUNS.filter(p => p.uz !== pronoun.uz).map(p => p.uz)).slice(0, 3);

    return {
      tense: mode,
      ru,
      uz_stem: `${cue.uz} ${scenario.uz[mode]}`.replace(/\s+/g, " ").trim(),
      pronouns: shuffle([pronoun.uz, ...wrongPronouns]),
      correct_pronoun: pronoun.uz,
      chips: makeTenseChips(correct, mode),
      correct_chips: correct,
      negative,
      question,
    };
  });
}

const TENSES_EX: TensesEx[] = buildTenseBank();

const CATEGORY_DEFS: { id: WordType; label: string }[] = [
  { id: "noun", label: "Существительные" },
  { id: "pronoun", label: "Местоимения" },
  { id: "verb", label: "Глаголы" },
  { id: "number", label: "Числительные" },
  { id: "question", label: "Вопросительные слова" },
  { id: "other", label: "Другое" },
];

const normalizeUz = (value: string) => value
  .toLowerCase()
  .replace(/[ʻ‘’`']/g, "'")
  .replace(/\s+/g, " ")
  .trim();

function uzSet(items: string[]) {
  return new Set(items.map(normalizeUz));
}

const PRONOUN_BASIC = uzSet(["men", "sen", "u", "biz", "siz", "ular"]);
const NUMBER_SIMPLE = uzSet(["nol", "bir", "ikki", "uch", "toʻrt", "besh", "olti", "yetti", "sakkiz", "toʻqqiz", "oʻn"]);
const NUMBER_LARGE = uzSet(["yigirma", "oʻttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "toʻqson", "yuz", "ming", "million"]);
const NUMBER_TIME = uzSet([
  "sakkiz soat", "yetti soat", "soat nechada", "soat toʻqqizda", "uch kun", "ikki oy", "bir yil",
  "uch soat", "soat uch", "ikki yildan keyin", "uch kundan keyin", "ikki oydan keyin",
  "bir haftadan keyin", "uch marta", "uch ming soʻm", "besh yuz ming soʻm", "bir million soʻm",
  "oʻn sakkiz yildan keyin",
]);
const NUMBER_ORDINAL = uzSet([
  "birinchi", "ikkinchi", "uchinchi", "toʻrtinchi", "beshinchi", "oltinchi",
  "yettinchi", "sakkizinchi", "toʻqqizinchi", "oʻninchi",
]);

const NOUN_A1 = uzSet([
  "odam", "kishi", "uy", "xona", "koʻcha", "bank", "yordam", "ish", "ofis", "institut",
  "maktab", "kitob", "hujjat", "pul", "kun", "hafta", "oy", "yil", "soat", "daqiqa",
  "soniya", "oila", "ota", "ona", "aka", "uka", "opa", "singil", "bola", "erkak", "ayol",
  "doʻst", "ism", "til", "shahar", "mamlakat", "doʻkon", "bozor", "mehmonxona", "bekat",
  "aeroport", "suv", "sut", "olma", "meva", "sabzavot", "tuxum", "guruch", "shoʻrva",
  "tuz", "shakar", "bosh", "qoʻl", "oyoq", "koʻz", "quloq", "ogʻiz", "choy", "non",
  "ovqat", "taom", "goʻsht", "oshxona", "dorixona", "qoʻshiq", "film", "oʻyin", "daraxt",
]);
const VERB_BASIC = uzSet([
  "kirmoq", "chiqmoq", "kelmoq", "bormoq", "ketmoq", "qaytmoq", "olmoq", "bermoq",
  "ichmoq", "yemoq", "uxlamoq", "ishlamoq", "yashamoq", "oʻqimoq", "yozmoq", "qilmoq",
  "gapirmoq", "aytmoq", "bilmoq", "tushunmoq",
]);
const VERB_DAILY = uzSet([
  "kutmoq", "koʻrmoq", "qaramoq", "soʻramoq", "yordam bermoq", "tayyorlamoq", "pishmoq",
  "pishirmoq", "sevmoq", "yaxshi ko'rmoq", "tinglamoq", "ochmoq", "yopmoq", "oʻtirmoq",
  "sanamoq", "saqlamoq", "tanlamoq", "uchrashmoq",
]);
const QUESTION_BASIC = uzSet(["nima", "kim", "qachon", "qayerda", "qayerga", "qayerdan", "qanday", "qancha", "necha", "nechta", "nega"]);
const QUESTION_CASES = uzSet(["nimani", "kimni", "nimaga"]);
const OTHER_TIME = uzSet([
  "bugun", "bugungi", "kecha", "ertaga", "hozir", "hozirgina", "ertalab", "kunduzi",
  "kechqurun", "kechasi", "tun", "oldin", "avval", "koʻp yillar oldin", "oʻshanda",
  "har doim", "hech qachon", "keyingi", "boshida", "dushanba", "seshanba", "chorshanba",
  "payshanba", "juma", "shanba", "yakshanba",
]);
const OTHER_DESCRIPTIVE = uzSet([
  "katta", "kichkina", "kichik", "yaxshi", "yomon", "qiziq", "qiziqarli", "uzoq", "oz",
  "kam", "koʻp", "koʻproq", "mazali", "mazali emas", "qimmat", "arzon", "ajoyib", "qiyin",
  "oson", "zerikarli", "tinch", "zoʻr", "bunday", "islomiy", "anʼanaviy", "chiroyli",
  "issiq", "sovuq", "tez", "sekin", "oq", "qora", "qizil", "koʻk", "yashil", "sariq",
  "yangi", "eski",
]);
const OTHER_SERVICE = uzSet([
  "ha", "yoʻq", "bor", "emas", "bor edi", "yoʻq edi", "va", "iltimos", "uzr", "xayr",
  "uchun", "haqida", "marta", "ta", "dona", "boshqa", "keyin", "dan", "gacha", "foiz",
  "yarim", "chorak", "oʻzbekcha", "bu yerda", "u yerda", "men bilan", "darsdan keyin",
  "darsdan oldin", "oʻtgan hafta", "har kuni", "yoshligimda", "bolaligimda",
]);

const WORD_GROUP_DEFS: { id: WordGroupId; category: WordType; label: string; desc: string; fallback?: boolean; match: (word: Word) => boolean }[] = [
  { id: "noun_a1", category: "noun", label: "A1: базовые", desc: "Дом, работа, еда, семья, город", match: word => NOUN_A1.has(normalizeUz(word.uz)) },
  { id: "noun_a2", category: "noun", label: "A2: расширение", desc: "Рабочие, учебные и абстрактные слова", fallback: true, match: word => !NOUN_A1.has(normalizeUz(word.uz)) },
  { id: "pronoun_basic", category: "pronoun", label: "Базовые", desc: "Я, ты, он/она, мы, вы, они", match: word => PRONOUN_BASIC.has(normalizeUz(word.uz)) },
  { id: "pronoun_cases", category: "pronoun", label: "Падежи", desc: "Мне, меня, у меня, мой, от меня", fallback: true, match: word => !PRONOUN_BASIC.has(normalizeUz(word.uz)) },
  { id: "verb_basic", category: "verb", label: "Легкие", desc: "Частые действия на каждый день", match: word => VERB_BASIC.has(normalizeUz(word.uz)) },
  { id: "verb_daily", category: "verb", label: "Обычные", desc: "Учеба, работа, просьбы, быт", match: word => VERB_DAILY.has(normalizeUz(word.uz)) },
  { id: "verb_complex", category: "verb", label: "Сложные", desc: "Составные и менее частотные глаголы", fallback: true, match: word => !VERB_BASIC.has(normalizeUz(word.uz)) && !VERB_DAILY.has(normalizeUz(word.uz)) },
  { id: "number_1_10", category: "number", label: "1-10", desc: "Первые числа без перегруза", match: word => NUMBER_SIMPLE.has(normalizeUz(word.uz)) },
  { id: "number_large", category: "number", label: "До миллиона", desc: "Десятки, сто, тысяча, миллион", match: word => NUMBER_LARGE.has(normalizeUz(word.uz)) },
  { id: "number_time", category: "number", label: "Время и счет", desc: "Часы, дни, суммы, разы", match: word => NUMBER_TIME.has(normalizeUz(word.uz)) },
  { id: "number_ordinal", category: "number", label: "Порядковые", desc: "Первый, второй, третий...", match: word => NUMBER_ORDINAL.has(normalizeUz(word.uz)) },
  { id: "question_basic", category: "question", label: "Базовые", desc: "Что, кто, где, куда, когда", match: word => QUESTION_BASIC.has(normalizeUz(word.uz)) },
  { id: "question_cases", category: "question", label: "Падежные", desc: "Кого, что, чему/зачем", fallback: true, match: word => QUESTION_CASES.has(normalizeUz(word.uz)) || !QUESTION_BASIC.has(normalizeUz(word.uz)) },
  { id: "other_time", category: "other", label: "Время", desc: "Сегодня, завтра, дни недели", match: word => OTHER_TIME.has(normalizeUz(word.uz)) },
  { id: "other_descriptive", category: "other", label: "Описания", desc: "Хороший, сложно, дорого, цвета", match: word => OTHER_DESCRIPTIVE.has(normalizeUz(word.uz)) },
  { id: "other_service", category: "other", label: "Служебные", desc: "Да/нет, после, до, частицы, фразы", fallback: true, match: word => OTHER_SERVICE.has(normalizeUz(word.uz)) || (!OTHER_TIME.has(normalizeUz(word.uz)) && !OTHER_DESCRIPTIVE.has(normalizeUz(word.uz))) },
];

const TENSE_MODE_DEFS: { id: TenseMode; label: string; desc: string }[] = [
  { id: "present_yap", label: "Настоящее -yap", desc: "Пройдено: действие сейчас, в процессе. qilyapman" },
  { id: "past_di", label: "Прошедшее -di", desc: "Пройдено: конкретно сделал/было. qildim, yedingizmi" },
  { id: "present_future", label: "Настоящее-будущее -a/-y", desc: "Следующее: обычно делает или сделает. boraman, yechasiz" },
  { id: "past_gan", label: "Опыт и давнопрошедшее -gan", desc: "Новая тема: ko‘rganman = видел когда-то, ko‘rgan edim = уже видел тогда" },
];

// ─── Utils ─────────────────────────────────────────────────────────────────
function cn(...cs: (string | false | undefined | null)[]) {
  return cs.filter(Boolean).join(" ");
}
function img(id: string, w = 600, h = 450) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;
}
function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
function score100(errors: number, total = 10) {
  return Math.max(0, Math.min(100, 100 - Math.ceil((errors / total) * 100)));
}
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function progressResults(progress: Record<string, unknown>): ResultData[] {
  return Array.isArray(progress.results) ? progress.results as ResultData[] : [];
}

function knownWordIds(progress: Record<string, unknown>): Set<string> {
  const known = progress.knownWords && typeof progress.knownWords === "object"
    ? progress.knownWords as Record<string, unknown>
    : {};
  const ids = new Set(Object.keys(known).filter((id) => known[id]));

  // Compatibility with the previous static app progress shape: { [wordId]: { known: n } }.
  Object.entries(progress).forEach(([id, value]) => {
    if (value && typeof value === "object" && "known" in value && Number((value as { known?: unknown }).known) > 0) {
      ids.add(id);
    }
  });
  return ids;
}

function categoryRows(progress: Record<string, unknown>) {
  const known = knownWordIds(progress);
  return CATEGORY_DEFS.map((category) => {
    const words = WORDS.filter((word) => word.type === category.id);
    return {
      ...category,
      learned: words.filter((word) => known.has(word.id)).length,
      total: words.length,
    };
  });
}

function groupsForCategory(category: WordType) {
  return WORD_GROUP_DEFS.filter((group) => group.category === category);
}

function defaultGroupFor(category: WordType): WordGroupId | undefined {
  return groupsForCategory(category)[0]?.id;
}

function groupRows(progress: Record<string, unknown>, category: WordType) {
  const known = knownWordIds(progress);
  return groupsForCategory(category).map((group) => {
    const words = WORDS.filter((word) => word.type === group.category && group.match(word));
    return {
      ...group,
      learned: words.filter((word) => known.has(word.id)).length,
      total: words.length,
    };
  }).filter((group) => group.total > 0);
}

function wordsForTypes(types: WordType[], groups: WordGroupId[] = []) {
  const allowed = new Set(types.length ? types : ["noun"]);
  const activeGroups = WORD_GROUP_DEFS.filter((group) => groups.includes(group.id));
  if (!activeGroups.length) return FLASHCARDS.filter((word) => allowed.has(word.type));
  return FLASHCARDS.filter((word) =>
    allowed.has(word.type) &&
    activeGroups.some((group) => group.category === word.type && group.match(word))
  );
}

function lessonWords(types: WordType[], progress: Record<string, unknown>, count: number, groups: WordGroupId[] = []) {
  const selected = wordsForTypes(types, groups);
  const known = knownWordIds(progress);
  const newWords = shuffle(selected.filter((word) => !known.has(word.id)));
  const repeatWords = shuffle(selected.filter((word) => known.has(word.id)));
  const deck = [...newWords.slice(0, count)];

  if (deck.length < count) {
    deck.push(...repeatWords.filter((word) => !deck.some((item) => item.id === word.id)).slice(0, count - deck.length));
  }

  while (deck.length < count && selected.length > 0) {
    deck.push(...shuffle(selected).slice(0, count - deck.length));
  }

  return deck.slice(0, count);
}

// ─── Primitives ────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  full?: boolean;
}

function Btn({ variant = "primary", size = "md", loading, full, children, className, disabled, ...p }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed";
  const sz  = { sm: "px-4 py-2 text-sm", md: "px-5 py-3 text-[15px]", lg: "px-6 py-[14px] text-base" }[size];
  const vr  = {
    primary:   "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-200",
    secondary: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 focus-visible:ring-zinc-400 disabled:opacity-40",
    ghost:     "bg-transparent text-zinc-600 hover:bg-zinc-100 focus-visible:ring-zinc-300",
    danger:    "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 disabled:bg-red-200",
    success:   "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-400",
    amber:     "bg-amber-400 text-amber-900 hover:bg-amber-500 focus-visible:ring-amber-400",
  }[variant];
  return (
    <button className={cn(base, sz, vr, full && "w-full", className)} disabled={disabled || loading} {...p}>
      {loading
        ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>{children}</>
        : children}
    </button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  right?: React.ReactNode;
}

function Field({ label, error, right, className, ...p }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-zinc-700">{label}</label>}
      <div className="relative">
        <input
          className={cn(
            "w-full px-4 py-3 rounded-2xl border bg-white text-zinc-900 placeholder:text-zinc-400 transition-all",
            "focus:outline-none focus:ring-2 focus:border-transparent",
            error
              ? "border-red-300 bg-red-50 focus:ring-red-400"
              : "border-zinc-200 focus:ring-emerald-500",
            right && "pr-12",
            className
          )}
          {...p}
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{right}</div>}
      </div>
      {error && (
        <span className="text-sm text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </span>
      )}
    </div>
  );
}

function Bar({ value, max, green }: { value: number; max: number; green?: boolean }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", green ? "bg-emerald-500" : "bg-zinc-300")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function LessonTopBar({
  onBack, center, right,
}: { onBack: () => void; center: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-zinc-100 sticky top-0 z-10">
      <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1 flex items-center justify-center">{center}</div>
      <div className="flex items-center gap-3">{right ?? <div className="w-7" />}</div>
    </div>
  );
}

function ProgressStrip({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-[3px] bg-zinc-100">
      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

// ─── Abstract illustrations (pronouns / numbers / question words) ──────────
function AbstractCard({ card }: { card: typeof FLASHCARDS[0] }) {
  if (card.cat === "pronoun") {
    const isSelf = card.uz === "men";
    return (
      <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 240 180" className="w-full h-full">
          {isSelf ? (
            <>
              <circle cx="120" cy="72" r="32" fill="#16A34A" opacity="0.15"/>
              <circle cx="120" cy="72" r="22" fill="#16A34A" opacity="0.6"/>
              <rect x="96" y="104" width="48" height="52" rx="10" fill="#16A34A" opacity="0.4"/>
              <path d="M96 148 L72 168" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" opacity="0.3"/>
              <path d="M144 148 L168 168" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" opacity="0.3"/>
              <path d="M136 82 Q160 60 152 44" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <polygon points="155,37 149,47 161,45" fill="#F59E0B"/>
              <text x="120" y="77" textAnchor="middle" fontSize="13" fill="white" fontWeight="700" fontFamily="monospace">MEN</text>
            </>
          ) : (
            <>
              {/* Self (faded) */}
              <circle cx="80" cy="72" r="20" fill="#94A3B8" opacity="0.25"/>
              <rect x="62" y="96" width="36" height="44" rx="8" fill="#94A3B8" opacity="0.2"/>
              {/* Other (highlighted) */}
              <circle cx="160" cy="72" r="26" fill="#F59E0B" opacity="0.7"/>
              <rect x="136" y="100" width="48" height="52" rx="10" fill="#F59E0B" opacity="0.5"/>
              <path d="M100 74 L134 74" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" markerEnd="url(#ar)"/>
              <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#F59E0B"/></marker></defs>
              <text x="160" y="77" textAnchor="middle" fontSize="12" fill="white" fontWeight="700" fontFamily="monospace">SEN</text>
            </>
          )}
        </svg>
      </div>
    );
  }
  if (card.cat === "num") {
    return (
      <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center">
        <svg viewBox="0 0 240 180" className="w-full h-full">
          <text x="120" y="130" textAnchor="middle" fontSize="110" fontWeight="800" fill="#7C3AED" opacity="0.12">5</text>
          <text x="120" y="128" textAnchor="middle" fontSize="100" fontWeight="800" fill="#7C3AED" opacity="0.7">5</text>
          <text x="120" y="162" textAnchor="middle" fontSize="14" fill="#7C3AED" opacity="0.5" fontWeight="600">бesh</text>
        </svg>
      </div>
    );
  }
  if (card.cat === "question") {
    return (
      <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <svg viewBox="0 0 240 180" className="w-full h-full">
          <text x="120" y="130" textAnchor="middle" fontSize="110" fontWeight="800" fill="#D97706" opacity="0.12">?</text>
          <text x="120" y="128" textAnchor="middle" fontSize="100" fontWeight="800" fill="#D97706" opacity="0.7">?</text>
          <text x="120" y="162" textAnchor="middle" fontSize="14" fill="#D97706" opacity="0.5" fontWeight="600">qanday</text>
        </svg>
      </div>
    );
  }
  const palette = card.cat === "verb"
    ? { from: "#ECFDF5", to: "#D1FAE5", ink: "#059669", soft: "#A7F3D0" }
    : card.cat === "noun"
      ? { from: "#EFF6FF", to: "#DBEAFE", ink: "#2563EB", soft: "#BFDBFE" }
      : { from: "#FFF7ED", to: "#FFEDD5", ink: "#EA580C", soft: "#FED7AA" };
  const label = card.cat === "verb" ? "действие" : card.cat === "noun" ? "предмет" : "образ";
  return (
    <div
      className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center overflow-hidden border border-white/70"
      style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
    >
      <svg viewBox="0 0 240 180" className="w-full h-full" role="img" aria-label={card.ru}>
        <circle cx="54" cy="42" r="28" fill={palette.soft} opacity="0.55" />
        <circle cx="190" cy="136" r="38" fill={palette.soft} opacity="0.45" />
        <rect x="48" y="42" width="144" height="96" rx="28" fill="white" opacity="0.72" />
        <text x="120" y="98" textAnchor="middle" fontSize="56" dominantBaseline="middle">{card.visual || "·"}</text>
        <text x="120" y="136" textAnchor="middle" fontSize="11" fill={palette.ink} fontWeight="800" letterSpacing="1">
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

function CardImage({ card }: { card: typeof FLASHCARDS[0] }) {
  const [fallback, setFallback] = useState<"webp" | "png" | "abstract">("webp");
  const numericId = Number(card.id.split("-").at(-1));
  const generatedPronounImage = card.id.startsWith("pronoun-") && numericId >= 75 && numericId <= 91;
  const src = card.img ? img(card.img) : `/word-images/${card.id}.${fallback}`;
  useEffect(() => setFallback("webp"), [card.id, card.img]);
  if (card.cat === "pronoun" && !generatedPronounImage) return <AbstractCard card={card} />;
  if (!card.img && fallback === "abstract") return <AbstractCard card={card} />;
  return (
    <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100">
      <img
        src={src}
        alt={card.uz}
        className="w-full h-full object-cover"
        onError={() => setFallback(fallback === "webp" ? "png" : "abstract")}
      />
    </div>
  );
}

function FlashcardFace({
  card,
  text,
  showPron,
  muted,
}: {
  card: typeof FLASHCARDS[0];
  text: string;
  showPron: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn(
      "absolute inset-0 bg-white rounded-[28px] border flex flex-col overflow-hidden",
      muted
        ? "border-zinc-100 shadow-[0_16px_48px_rgba(24,24,27,0.08)]"
        : "border-emerald-100 shadow-[0_16px_48px_rgba(5,150,105,0.12)]"
    )}>
      <div className="p-4"><CardImage card={card} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-2">
        <p className={cn(
          "text-3xl font-bold text-center leading-tight",
          muted ? "text-zinc-900" : "text-emerald-700"
        )}>
          {text}
        </p>
        {showPron && <p className="text-base font-mono text-zinc-500 mt-1">[{card.pron}]</p>}
        {!muted && <p className="text-sm text-zinc-400 mt-1 text-center">{card.hint}</p>}
        {muted && <p className="text-sm text-zinc-400">Вспомни перевод и переверни</p>}
      </div>
    </div>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGo }: { onLogin: (payload: AuthPayload) => void; onGo: () => void }) {
  const [login, setLogin] = useState("");
  const [pw, setPw]       = useState("");
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload = await apiAuth("/api/login", login, pw);
      onLogin(payload);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-5 shadow-lg shadow-emerald-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">O'zbek tili</h1>
          <p className="text-sm text-zinc-400 mt-1">Учи узбекский язык</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Логин" placeholder="Введите логин" value={login}
            onChange={e => { setLogin(e.target.value); setErr(null); }}
            error={err ? " " : undefined} autoComplete="username" />
          <Field label="Пароль" type={show ? "text" : "password"} placeholder="Введите пароль"
            value={pw} onChange={e => { setPw(e.target.value); setErr(null); }}
            error={err ?? undefined} autoComplete="current-password"
            right={
              <button type="button" onClick={() => setShow(v => !v)} className="hover:text-zinc-600 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="mt-2" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
            <Btn type="submit" full size="lg" loading={loading}>Войти</Btn>
            <p className="text-center mt-5 text-sm text-zinc-500">
              Нет аккаунта?{" "}
              <button type="button" onClick={onGo} className="text-emerald-600 font-semibold hover:text-emerald-700">
                Регистрация
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Register ──────────────────────────────────────────────────────────────
function RegisterScreen({ onRegister, onGo }: { onRegister: (payload: AuthPayload) => void; onGo: () => void }) {
  const [login, setLogin] = useState("");
  const [pw, setPw]       = useState("");
  const [show, setShow]   = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [pwErr, setPwErr]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoginErr(null); setPwErr(null);
    let bad = false;
    if (login.length < 3) { setLoginErr("Логин не менее 3 символов"); bad = true; }
    if (pw.length < 6)    { setPwErr("Пароль не менее 6 символов");   bad = true; }
    if (bad) return;
    setLoading(true);
    try {
      const payload = await apiAuth("/api/register", login, pw);
      onRegister(payload);
    } catch (error) {
      setLoginErr(error instanceof Error ? error.message : "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-5 shadow-lg shadow-emerald-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Создать аккаунт</h1>
          <p className="text-sm text-zinc-400 mt-1">Начни учиться бесплатно</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Логин" placeholder="Минимум 3 символа" value={login}
            onChange={e => { setLogin(e.target.value); setLoginErr(null); }}
            error={loginErr ?? undefined} autoComplete="username" />
          <Field label="Пароль" type={show ? "text" : "password"} placeholder="Минимум 6 символов"
            value={pw} onChange={e => { setPw(e.target.value); setPwErr(null); }}
            error={pwErr ?? undefined} autoComplete="new-password"
            right={
              <button type="button" onClick={() => setShow(v => !v)} className="hover:text-zinc-600 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="mt-2" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
            <Btn type="submit" full size="lg" loading={loading}>Зарегистрироваться</Btn>
            <p className="text-center mt-5 text-sm text-zinc-500">
              Уже есть аккаунт?{" "}
              <button type="button" onClick={onGo} className="text-emerald-600 font-semibold hover:text-emerald-700">
                Войти
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────
function HomeScreen({
  onStart, username, progress,
}: {
  onStart: (t: LessonType, tenseModes?: TenseMode[], wordTypes?: WordType[], wordGroups?: WordGroupId[]) => void;
  username: string;
  progress: Record<string, unknown>;
}) {
  const [method, setMethod]   = useState<LessonType>("flashcard");
  const [cats, setCats]       = useState(new Set<WordType>(["noun"]));
  const [wordGroups, setWordGroups] = useState(new Set<WordGroupId>(["noun_a1"]));
  const [tenseModes, setTenseModes] = useState(new Set<TenseMode>(["present_yap"]));
  const results = progressResults(progress);
  const known = knownWordIds(progress);
  const excellent = results.filter((result) => result.score >= 90).length;
  const avgScore = results.length
    ? (results.reduce((sum, result) => sum + result.score, 0) / results.length / 20).toFixed(1)
    : "0";
  const categories = categoryRows(progress);

  const selectedWordCount = wordsForTypes(Array.from(cats), Array.from(wordGroups)).length;

  const toggle = (id: WordType) =>
    setCats(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        if (n.size > 1) {
          n.delete(id);
          setWordGroups(groupPrev => {
            const nextGroups = new Set(groupPrev);
            groupsForCategory(id).forEach(group => nextGroups.delete(group.id));
            return nextGroups;
          });
        }
      } else {
        n.add(id);
        const defaultGroup = defaultGroupFor(id);
        if (defaultGroup) {
          setWordGroups(groupPrev => new Set([...groupPrev, defaultGroup]));
        }
      }
      return n;
    });
  const toggleGroup = (groupId: WordGroupId) => {
    const group = WORD_GROUP_DEFS.find(item => item.id === groupId);
    if (!group) return;
    setCats(prev => new Set([...prev, group.category]));
    setWordGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        const siblingSelected = groupsForCategory(group.category).some(item => item.id !== groupId && next.has(item.id));
        if (siblingSelected) next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };
  const toggleTense = (id: TenseMode) =>
    setTenseModes(prev => {
      const n = new Set(prev);
      if (n.has(id)) { if (n.size > 1) n.delete(id); } else n.add(id);
      return n;
    });

  const methods: { id: LessonType; label: string; desc: string; emoji: string }[] = [
    { id: "flashcard", label: "Карточки",   desc: "Узб ↔ Рус",         emoji: "🃏" },
    { id: "pairs",     label: "Пары",        desc: "Соединяй слова",    emoji: "🔗" },
    { id: "tenses",    label: "Времена",     desc: "Аффиксы глагола",   emoji: "⏱" },
    { id: "phrases",   label: "Фразы",       desc: "Собери порядок",    emoji: "💬" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1]">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-zinc-900">O'zbek tili</span>
            <span className="text-xs text-zinc-400 block">Добро пожаловать, {username || "ученик"}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm select-none">
            {(username || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-6 space-y-7" style={{ paddingBottom: "calc(116px + env(safe-area-inset-bottom))" }}>
        {/* Stats */}
        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Прогресс</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: String(known.size), sub: `из ${WORDS.length}`,  label: "Слов выучено",     c: "text-emerald-600" },
              { v: String(results.length), sub: undefined, label: "Уроков пройдено",  c: "text-blue-600" },
              { v: String(excellent),  sub: undefined, label: "Отличных уроков",  c: "text-amber-500" },
              { v: avgScore, sub: "из 5",   label: "Средний балл",     c: "text-violet-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <div className={cn("text-2xl font-bold leading-none", s.c)}>{s.v}</div>
                {s.sub && <div className="text-[11px] text-zinc-400 mt-0.5">{s.sub}</div>}
                <div className="text-xs text-zinc-500 mt-2 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Method */}
        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Методика</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  method === m.id
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-zinc-100 bg-white hover:border-zinc-200"
                )}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className={cn("text-sm font-bold", method === m.id ? "text-emerald-700" : "text-zinc-700")}>{m.label}</span>
                <span className="text-[10px] text-zinc-400 text-center leading-tight">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {method === "tenses" ? (
          <section>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Какие времена учить</h2>
            <div className="flex flex-col gap-2">
              {TENSE_MODE_DEFS.map(item => {
                const sel = tenseModes.has(item.id);
                const total = TENSES_EX.filter(ex => ex.tense === item.id).length;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleTense(item.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all text-left",
                      sel ? "border-emerald-400 bg-emerald-50/60" : "border-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                      sel ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 bg-white"
                    )}>
                      {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm font-semibold", sel ? "text-zinc-800" : "text-zinc-500")}>{item.label}</span>
                        <span className="text-xs text-zinc-400 ml-2 flex-shrink-0 font-mono">{total}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-tight">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : method === "phrases" ? (
          <section>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Что учить</h2>
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-zinc-800">Общие фразы</div>
                  <p className="text-xs text-zinc-400 mt-1 leading-tight">Приветствия, прощания, благодарность и короткие бытовые реплики.</p>
                </div>
                <span className="text-xs text-zinc-400 font-mono flex-shrink-0">{COMMON_PHRASES.length}</span>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Что учить</h2>
            <div className="flex flex-col gap-2">
              {categories.map(cat => {
                const sel = cats.has(cat.id);
                return (
                  <div key={cat.id} className="flex flex-col gap-2">
                    <button
                      onClick={() => toggle(cat.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all text-left",
                        sel ? "border-emerald-400 bg-emerald-50/60" : "border-zinc-100 hover:border-zinc-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        sel ? "bg-emerald-600 border-emerald-600" : "border-zinc-300 bg-white"
                      )}>
                        {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={cn("text-sm font-semibold", sel ? "text-zinc-800" : "text-zinc-500")}>{cat.label}</span>
                          <span className="text-xs text-zinc-400 ml-2 flex-shrink-0 font-mono">{cat.learned}/{cat.total}</span>
                        </div>
                        <Bar value={cat.learned} max={cat.total} green={sel} />
                      </div>
                    </button>
                    {sel && (
                      <div className="grid grid-cols-1 gap-2 pl-9 sm:grid-cols-2">
                        {groupRows(progress, cat.id).map(group => {
                          const groupSel = wordGroups.has(group.id);
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => toggleGroup(group.id)}
                              className={cn(
                                "rounded-2xl border px-3 py-2.5 text-left transition-all",
                                groupSel
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-zinc-100 bg-white hover:border-zinc-200"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("text-xs font-bold", groupSel ? "text-emerald-700" : "text-zinc-600")}>{group.label}</span>
                                <span className="text-[11px] font-mono text-zinc-400">{group.learned}/{group.total}</span>
                              </div>
                              <p className="mt-1 text-[11px] leading-tight text-zinc-400">{group.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div
          className="fixed inset-x-0 bottom-0 z-20 bg-[#F7F6F1]/95 px-5 pt-3 backdrop-blur-sm border-t border-zinc-100"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-2xl mx-auto">
            <Btn
              full
              size="lg"
              disabled={method === "tenses" ? tenseModes.size === 0 : method !== "phrases" && selectedWordCount === 0}
              onClick={() => onStart(method, Array.from(tenseModes), Array.from(cats), Array.from(wordGroups))}
            >
              <Zap className="w-5 h-5" /> Начать урок
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Flashcard Lesson ──────────────────────────────────────────────────────
function FlashcardLesson({
  onComplete, wordTypes, wordGroups, progress,
}: {
  onComplete: (r: ResultData) => void;
  wordTypes: WordType[];
  wordGroups: WordGroupId[];
  progress: Record<string, unknown>;
}) {
  const [deck] = useState(() => lessonWords(wordTypes, progress, 10, wordGroups));
  const [dirs] = useState(() => Array.from({ length: 10 }, () => Math.random() > .5 ? 1 : 0));
  const [idx, setIdx]         = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown]     = useState(0);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [repeat, setRepeat]   = useState(0);
  const [errors, setErrors]   = useState(0);
  const [slideOut, setSlideOut] = useState<"known" | "repeat" | null>(null);
  const t0 = useRef(Date.now());

  const card = deck[idx];
  const dir  = dirs[idx]; // 1 = uz→ru
  const total = deck.length;
  const frontText = dir ? card.uz : card.ru;
  const backText = dir ? card.ru : card.uz;
  const frontIsUz = Boolean(dir);
  const backIsUz = !dir;

  function finish(extraErr: boolean, nextKnownIds = knownIds) {
    const e = errors + (extraErr ? 1 : 0);
    const k = known + (extraErr ? 0 : 1);
    onComplete({
      lessonType: "flashcard",
      timeSeconds: Math.round((Date.now() - t0.current) / 1000),
      errors: e,
      score: score100(e, total),
      wordsReinforced: k,
      wordIds: nextKnownIds,
    });
  }

  function act(isKnown: boolean) {
    if (slideOut) return;
    const nextKnownIds = isKnown ? [...knownIds, card.id] : knownIds;
    if (isKnown) {
      setKnown(k => k + 1);
      setKnownIds(nextKnownIds);
    } else {
      setRepeat(r => r + 1);
      setErrors(e => e + 1);
    }
    setSlideOut(isKnown ? "known" : "repeat");
    setTimeout(() => {
      if (idx + 1 >= total) { finish(!isKnown, nextKnownIds); return; }
      setFlipped(false);
      setIdx(i => i + 1);
      setSlideOut(null);
    }, 260);
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col">
      <LessonTopBar
        onBack={() => onComplete({ lessonType: "flashcard", timeSeconds: 0, errors, score: 1, wordsReinforced: known })}
        center={
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-zinc-500">{idx + 1}/{total}</span>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600"><Check className="w-3.5 h-3.5"/>{known}</span>
            <span className="flex items-center gap-1 text-sm font-bold text-amber-500"><RotateCcw className="w-3.5 h-3.5"/>{repeat}</span>
          </div>
        }
      />
      <ProgressStrip value={idx} max={total} />

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-5 py-6 gap-5">
        {/* Card */}
        <div className="w-full min-h-[430px] max-h-[560px] h-[min(64dvh,560px)]" style={{ perspective: "1200px" }}>
          <div
            className="relative w-full h-full cursor-pointer transition-all duration-300"
            style={{
              transformStyle: "preserve-3d",
              opacity: slideOut ? 0 : 1,
              transform: slideOut
                ? `translateX(${slideOut === "known" ? "115%" : "-115%"}) rotate(${slideOut === "known" ? "5deg" : "-5deg"}) ${flipped ? "rotateY(180deg)" : "rotateY(0deg)"}`
                : flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setFlipped(value => !value)}
          >
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <FlashcardFace card={card} text={frontText} showPron={frontIsUz} muted />
            </div>
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <FlashcardFace card={card} text={backText} showPron={backIsUz} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          <Btn variant="danger" full size="lg" disabled={Boolean(slideOut)} onClick={() => act(false)}>
            <RotateCcw className="w-5 h-5" /> Повторить
          </Btn>
          <Btn variant="success" full size="lg" disabled={Boolean(slideOut)} onClick={() => act(true)}>
            <Check className="w-5 h-5" /> Знаю
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Pairs Lesson ──────────────────────────────────────────────────────────
type PairState = "idle" | "selected" | "correct" | "error" | "disabled";
type PairSide = "l" | "r";
type PairSelection = { side: PairSide; id: number } | null;

function PairsLesson({
  onComplete, wordTypes, wordGroups, progress,
}: {
  onComplete: (r: ResultData) => void;
  wordTypes: WordType[];
  wordGroups: WordGroupId[];
  progress: Record<string, unknown>;
}) {
  const [round, setRound]       = useState(0);
  const [errors, setErrors]     = useState(0);
  const [score, setScore]       = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [selection, setSelection] = useState<PairSelection>(null);
  const [states, setStates]     = useState<Record<string, PairState>>({});
  const [matched, setMatched]   = useState(0);
  const [leftArr, setLeftArr]   = useState<typeof PAIRS_WORDS>([]);
  const [rightArr, setRightArr] = useState<typeof PAIRS_WORDS>([]);
  const t0 = useRef(Date.now());
  const TOTAL = 10;

  useEffect(() => {
    const roundWords = lessonWords(wordTypes, progress, 7, wordGroups);
    setLeftArr(shuffle(roundWords));
    setRightArr(shuffle(roundWords));
    setStates({});
    setSelection(null);
    setMatched(0);
  }, [round, progress, wordGroups, wordTypes]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.round((Date.now() - t0.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  function gs(side: PairSide, id: number): PairState {
    return states[`${side}${id}`] ?? "idle";
  }

  function clearSelected(next: Record<string, PairState>) {
    Object.keys(next).forEach(k => { if (next[k] === "selected") next[k] = "idle"; });
  }

  function selectOnly(side: PairSide, id: number) {
    setSelection({ side, id });
    setStates(prev => {
      const n = { ...prev };
      clearSelected(n);
      n[`${side}${id}`] = "selected";
      return n;
    });
  }

  function clickPair(side: PairSide, id: number) {
    const st = gs(side, id);
    if (st === "disabled" || st === "correct") return;
    if (selection?.side === side && selection.id === id) {
      setSelection(null);
      setStates(prev => {
        const n = { ...prev };
        n[`${side}${id}`] = "idle";
        return n;
      });
      return;
    }
    if (!selection || selection.side === side) {
      selectOnly(side, id);
      return;
    }

    if (selection.id === id) {
      // Correct
      setScore(s => s + 10);
      setStates(prev => ({ ...prev, [`l${id}`]: "correct", [`r${id}`]: "correct" }));
      const newMatched = matched + 1;
      setMatched(newMatched);
      setSelection(null);
      setTimeout(() => {
        setStates(prev => ({ ...prev, [`l${id}`]: "disabled", [`r${id}`]: "disabled" }));
        if (newMatched >= leftArr.length) {
          setTimeout(() => {
            if (round + 1 >= TOTAL) {
              onComplete({
                lessonType: "pairs",
                timeSeconds: Math.round((Date.now() - t0.current) / 1000),
                errors,
                score: score100(errors, TOTAL),
                wordsReinforced: leftArr.length,
                wordIds: leftArr.map((word) => word.id),
              });
            } else {
              setRound(r => r + 1);
            }
          }, 200);
        }
      }, 600);
    } else {
      // Wrong
      setErrors(e => e + 1);
      const first = selection;
      setStates(prev => ({ ...prev, [`${first.side}${first.id}`]: "error", [`${side}${id}`]: "error" }));
      setTimeout(() => {
        setStates(prev => ({ ...prev, [`${first.side}${first.id}`]: "idle", [`${side}${id}`]: "idle" }));
        setSelection(null);
      }, 700);
    }
  }

  function cellStyle(st: PairState, isSel: boolean) {
    if (st === "correct")  return "border-emerald-400 bg-emerald-50 text-emerald-700";
    if (st === "error")    return "border-red-400 bg-red-50 text-red-600";
    if (st === "disabled") return "border-zinc-100 bg-zinc-50 text-zinc-300 opacity-50 pointer-events-none";
    if (isSel || st === "selected") return "border-amber-400 bg-amber-50 text-amber-800 shadow-sm";
    return "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50";
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col">
      <LessonTopBar
        onBack={() => onComplete({ lessonType: "pairs", timeSeconds: elapsed, errors, score, wordsReinforced: matched })}
        center={<span className="text-sm font-semibold text-zinc-600">Раунд {round + 1}/{TOTAL}</span>}
        right={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold text-red-500"><X className="w-3.5 h-3.5"/>{errors}</span>
            <span className="flex items-center gap-1 text-sm text-zinc-500"><Clock className="w-3.5 h-3.5"/>{fmtTime(elapsed)}</span>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600"><Star className="w-3.5 h-3.5"/>{score}</span>
          </div>
        }
      />
      <ProgressStrip value={round} max={TOTAL} />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-5 gap-4">
        <p className="text-center text-sm text-zinc-400">
          Выбери пару · осталось {leftArr.length - matched}
        </p>

        <div className="flex gap-3 flex-1">
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-xs font-bold text-zinc-400 text-center">Узбекский</p>
            {leftArr.map(item => (
              <button
                key={item.id}
                onClick={() => clickPair("l", item.id)}
                className={cn(
                  "w-full py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200",
                  cellStyle(gs("l", item.id), selection?.side === "l" && selection.id === item.id)
                )}
              >
                {item.uz}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-xs font-bold text-zinc-400 text-center">Русский</p>
            {rightArr.map(item => (
              <button
                key={item.id}
                onClick={() => clickPair("r", item.id)}
                className={cn(
                  "w-full py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200",
                  cellStyle(gs("r", item.id), selection?.side === "r" && selection.id === item.id)
                )}
              >
                {item.ru}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tenses Lesson ─────────────────────────────────────────────────────────
function TensesLesson({ onComplete, modes }: { onComplete: (r: ResultData) => void; modes: TenseMode[] }) {
  const [exercises] = useState(() => {
    const selected = TENSES_EX.filter(ex => modes.includes(ex.tense));
    return shuffle(selected.length ? selected : TENSES_EX).slice(0, 10);
  });
  const [idx, setIdx]         = useState(0);
  const [pronoun, setPronoun] = useState<string | null>(null);
  const [affixSlots, setAffixSlots] = useState<(string | null)[]>([]);
  const [dragItem, setDragItem] = useState<{ kind: "pronoun" | "affix"; value: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [errors, setErrors]   = useState(0);
  const t0 = useRef(Date.now());
  const TOTAL = exercises.length;
  const ex = exercises[idx];
  const tenseInfo = TENSE_MODE_DEFS.find(item => item.id === ex.tense);
  const slots = affixSlots.length === ex.correct_chips.length
    ? affixSlots
    : Array.from({ length: ex.correct_chips.length }, () => null);

  function reset(nextIdx = idx) {
    setPronoun(null);
    setAffixSlots(Array.from({ length: exercises[nextIdx].correct_chips.length }, () => null));
    setChecked(false);
    setDragItem(null);
  }

  function check() {
    setChecked(true);
    const ok = pronoun === ex.correct_pronoun && JSON.stringify(slots) === JSON.stringify(ex.correct_chips);
    if (!ok) setErrors(e => e + 1);
  }

  function next() {
    if (idx + 1 >= TOTAL) {
      onComplete({
        lessonType: "tenses",
        timeSeconds: Math.round((Date.now() - t0.current) / 1000),
        errors,
        score: score100(errors, TOTAL),
        wordsReinforced: idx + 1,
      });
    } else {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      reset(nextIdx);
    }
  }

  function placePronoun(value: string) {
    if (checked) return;
    setPronoun(value);
  }

  function placeAffix(index: number, value: string) {
    if (checked) return;
    setAffixSlots(prev => {
      const base = prev.length === ex.correct_chips.length ? prev : Array.from({ length: ex.correct_chips.length }, () => null);
      const nextSlots = base.map(slot => slot === value ? null : slot);
      nextSlots[index] = value;
      return nextSlots;
    });
  }

  function dropPronoun() {
    if (dragItem?.kind === "pronoun") placePronoun(dragItem.value);
    setDragItem(null);
  }

  function dropAffix(index: number) {
    if (dragItem?.kind === "affix") placeAffix(index, dragItem.value);
    setDragItem(null);
  }

  const pOk  = checked && pronoun === ex.correct_pronoun;
  const pBad = checked && pronoun !== ex.correct_pronoun;
  const cOk  = checked && JSON.stringify(slots) === JSON.stringify(ex.correct_chips);
  const allFilled = Boolean(pronoun) && slots.every(Boolean);

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col">
      <LessonTopBar
        onBack={() => onComplete({ lessonType: "tenses", timeSeconds: 0, errors, score: 1, wordsReinforced: idx })}
        center={<span className="text-sm font-semibold text-zinc-500">{idx + 1}/{TOTAL}</span>}
        right={
          <span className="flex items-center gap-1 text-sm font-bold text-red-500">
            <X className="w-3.5 h-3.5"/>{errors}
          </span>
        }
      />
      <ProgressStrip value={idx} max={TOTAL} />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-6 gap-5">
        {/* Russian */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">По-русски</p>
          <p className="text-xl font-bold text-zinc-900">{ex.ru}</p>
          {tenseInfo && <p className="text-xs text-zinc-400 mt-2">{tenseInfo.label}: {tenseInfo.desc}</p>}
          {ex.negative && <span className="inline-block mt-2 text-xs bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-lg">отрицание</span>}
          {ex.question && <span className="inline-block mt-2 ml-1 text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-lg">вопрос</span>}
        </div>

        {/* Uzbek with blanks */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">По-узбекски — заполни пропуски</p>
          <div className="flex flex-wrap items-center gap-2 text-base">
            {/* Pronoun slot */}
            <button
              type="button"
              onClick={() => !checked && setPronoun(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={dropPronoun}
              className={cn(
              "inline-flex items-center justify-center min-w-[72px] px-3 py-1.5 rounded-xl border-2 font-bold text-sm transition-all",
              !pronoun        ? "border-dashed border-zinc-300 text-zinc-400"
              : pOk           ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : pBad          ? "border-red-400 bg-red-50 text-red-600"
              :                 "border-amber-400 bg-amber-50 text-amber-800"
            )}>
              {pronoun ?? "___"}
            </button>

            <span className="text-zinc-700 font-semibold">{ex.uz_stem}</span>

            {slots.map((slot, slotIndex) => {
              const slotOk = checked && slot === ex.correct_chips[slotIndex];
              const slotBad = checked && slot !== ex.correct_chips[slotIndex];
              return (
                <button
                  key={slotIndex}
                  type="button"
                  onClick={() => !checked && setAffixSlots(prev => {
                    const base = prev.length === ex.correct_chips.length ? prev : slots;
                    return base.map((value, index) => index === slotIndex ? null : value);
                  })}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropAffix(slotIndex)}
                  className={cn(
                    "inline-flex items-center justify-center min-w-[54px] px-3 py-1.5 rounded-xl border-2 font-mono font-bold text-sm transition-all",
                    !slot       ? "border-dashed border-zinc-300 text-zinc-400"
                    : slotOk    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : slotBad   ? "border-red-400 bg-red-50 text-red-600"
                    :             "border-amber-400 bg-amber-50 text-amber-700"
                  )}
                >
                  {slot ? `-${slot}-` : "___"}
                </button>
              );
            })}

            {ex.question && <span className="text-zinc-700 font-semibold">?</span>}
          </div>

        </div>

        {/* Pronouns */}
        <div>
          <p className="text-xs font-bold text-zinc-400 mb-2">Местоимение</p>
          <div className="flex flex-wrap gap-2">
            {ex.pronouns.map(p => (
              <button
                key={p}
                draggable={!checked}
                onDragStart={() => setDragItem({ kind: "pronoun", value: p })}
                onDragEnd={() => setDragItem(null)}
                onClick={() => placePronoun(p)}
                className={cn(
                  "px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all cursor-grab active:cursor-grabbing",
                  checked && p === ex.correct_pronoun
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : checked && p === pronoun && p !== ex.correct_pronoun
                    ? "border-red-400 bg-red-50 text-red-600"
                    : p === pronoun
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Affix chips */}
        <div>
          <p className="text-xs font-bold text-zinc-400 mb-2">Аффиксы глагола</p>
          <div className="flex flex-wrap gap-2">
            {ex.chips.map(c => {
              const isSel = slots.includes(c);
              const isCorrect = ex.correct_chips.includes(c);
              const isWrong = checked && isSel && !isCorrect;
              const isRight = checked && isSel && isCorrect;
              return (
                <button
                  key={c}
                  draggable={!checked && !isSel}
                  onDragStart={() => setDragItem({ kind: "affix", value: c })}
                  onDragEnd={() => setDragItem(null)}
                  onClick={() => {
                    if (isSel) return;
                    const emptyIndex = slots.findIndex(slot => !slot);
                    if (emptyIndex >= 0) placeAffix(emptyIndex, c);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 font-mono font-semibold text-sm transition-all cursor-grab active:cursor-grabbing",
                    isWrong  ? "border-red-400 bg-red-50 text-red-600"
                    : isRight ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : isSel   ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-default"
                    :           "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  -{c}-
                </button>
              );
            })}
          </div>
          {slots.some(Boolean) && !checked && (
            <p className="text-[11px] text-zinc-400 mt-2">
              Перетащи аффиксы в квадратики в правильном порядке. Нажатие оставлено как запасной вариант на мобильном.
            </p>
          )}
        </div>

        <div className="mt-auto" style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
          {!checked ? (
            <Btn full size="lg" disabled={!allFilled} onClick={check}>
              Проверить
            </Btn>
          ) : (
            <Btn full size="lg" onClick={next}>
              {idx + 1 >= TOTAL ? "Завершить урок" : "Следующее →"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Common Phrases Lesson ─────────────────────────────────────────────────
function PhrasesLesson({ onComplete }: { onComplete: (r: ResultData) => void }) {
  const [exercises] = useState(() => shuffle(COMMON_PHRASES).slice(0, 10));
  const [idx, setIdx] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>(() => Array.from({ length: exercises[0].words.length }, () => null));
  const [phraseChips, setPhraseChips] = useState(() => phraseChipsFor(exercises[0]));
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const t0 = useRef(Date.now());
  const TOTAL = exercises.length;
  const ex = exercises[idx];
  const currentSlots = slots.length === ex.words.length ? slots : Array.from({ length: ex.words.length }, () => null);
  const filled = currentSlots.every(Boolean);

  function reset(nextIdx: number) {
    setSlots(Array.from({ length: exercises[nextIdx].words.length }, () => null));
    setPhraseChips(phraseChipsFor(exercises[nextIdx]));
    setChecked(false);
    setPassed(false);
    setAttempts(0);
  }

  function placeWord(word: string) {
    if (checked || currentSlots.includes(word)) return;
    const emptyIndex = currentSlots.findIndex(slot => !slot);
    if (emptyIndex < 0) return;
    setSlots(currentSlots.map((slot, index) => index === emptyIndex ? word : slot));
  }

  function clearSlot(index: number) {
    if (passed || attempts >= 3) return;
    if (checked && currentSlots[index] === ex.words[index]) return;
    setSlots(currentSlots.map((slot, slotIndex) => slotIndex === index ? null : slot));
    setChecked(false);
  }

  function check() {
    const ok = JSON.stringify(currentSlots) === JSON.stringify(ex.words);
    setChecked(true);
    if (ok) {
      setPassed(true);
      setPassedCount(prev => prev + 1);
      return;
    }
    setAttempts(prev => prev + 1);
    setErrors(prev => prev + 1);
  }

  function next() {
    if (idx + 1 >= TOTAL) {
      onComplete({
        lessonType: "phrases",
        timeSeconds: Math.round((Date.now() - t0.current) / 1000),
        errors,
        score: score100(errors, TOTAL),
        wordsReinforced: passedCount,
      });
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    reset(nextIdx);
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col">
      <LessonTopBar
        onBack={() => onComplete({ lessonType: "phrases", timeSeconds: 0, errors, score: 1, wordsReinforced: idx })}
        center={<span className="text-sm font-semibold text-zinc-500">{idx + 1}/{TOTAL}</span>}
        right={
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-500">{attempts}/3</span>
            <span className="flex items-center gap-1 text-sm font-bold text-red-500">
              <X className="w-3.5 h-3.5"/>{errors}
            </span>
          </div>
        }
      />
      <ProgressStrip value={idx} max={TOTAL} />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-6 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">По-русски</p>
          <p className="text-xl font-bold text-zinc-900">{ex.ru}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Собери фразу по-узбекски</p>
          <div className="flex flex-wrap gap-2">
            {currentSlots.map((word, slotIndex) => {
              const ok = checked && word === ex.words[slotIndex];
              const bad = checked && word !== ex.words[slotIndex];
              return (
                <button
                  key={slotIndex}
                  type="button"
                  onClick={() => clearSlot(slotIndex)}
                  className={cn(
                    "min-h-[44px] min-w-[92px] px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all",
                    !word ? "border-dashed border-zinc-300 text-zinc-400 bg-white"
                    : ok ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : bad ? "border-red-400 bg-red-50 text-red-600"
                    : "border-amber-400 bg-amber-50 text-amber-800"
                  )}
                >
                  {word ?? "___"}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-zinc-400 mb-2">Слова</p>
          <div className="flex flex-wrap gap-2">
            {phraseChips.map((word, index) => {
              const used = currentSlots.includes(word);
              return (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  disabled={used || checked}
                  onClick={() => placeWord(word)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all",
                    used ? "border-zinc-100 bg-zinc-50 text-zinc-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto" style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
          {!checked ? (
            <Btn full size="lg" disabled={!filled} onClick={check}>Проверить</Btn>
          ) : passed || attempts >= 3 ? (
            <Btn full size="lg" onClick={next}>
              {idx + 1 >= TOTAL ? "Завершить урок" : "Следующее →"}
            </Btn>
          ) : (
            <Btn full size="lg" variant="secondary" disabled>
              Исправьте красные карточки
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Result ────────────────────────────────────────────────────────────────
function ResultScreen({ result, onAgain, onHome }: { result: ResultData; onAgain: () => void; onHome: () => void }) {
  const isBest = result.score >= 90;
  const names: Record<LessonType, string> = { flashcard: "Карточки", pairs: "Пары", tenses: "Времена", phrases: "Фразы" };

  return (
    <div className="min-h-[100dvh] bg-[#F7F6F1] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Score card */}
        <div className="bg-white rounded-3xl p-8 text-center border border-zinc-100 shadow-sm">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5">{names[result.lessonType]} · результат</p>
          <div className="text-5xl font-bold text-zinc-900">
            {result.score}<span className="text-2xl text-zinc-400 font-normal">/100</span>
          </div>
          {isBest && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mt-4 border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              {result.score === 100 ? "Лучший результат сегодня!" : "Один из лучших!"}
            </div>
          )}
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: fmtTime(result.timeSeconds), label: "Время",            c: "text-zinc-900" },
            { v: String(result.errors),       label: "Ошибок",           c: result.errors > 0 ? "text-red-500" : "text-emerald-600" },
            { v: String(result.wordsReinforced), label: "Слов закреплено", c: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-zinc-100">
              <div className={cn("text-2xl font-bold", s.c)}>{s.v}</div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3" style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
          <Btn full size="lg" onClick={onAgain}><Zap className="w-5 h-5" /> Ещё урок</Btn>
          <Btn variant="secondary" full size="lg" onClick={onHome}>На главную</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]         = useState<Screen>(() => localStorage.getItem("uzbek-trainer-token") ? "home" : "login");
  const [lessonType, setLessonType] = useState<LessonType>("flashcard");
  const [selectedTenseModes, setSelectedTenseModes] = useState<TenseMode[]>(["present_yap"]);
  const [selectedWordTypes, setSelectedWordTypes] = useState<WordType[]>(["noun"]);
  const [selectedWordGroups, setSelectedWordGroups] = useState<WordGroupId[]>(["noun_a1"]);
  const [result, setResult]         = useState<ResultData | null>(null);
  const [token, setToken]           = useState(() => localStorage.getItem("uzbek-trainer-token") || "");
  const [username, setUsername]     = useState(() => localStorage.getItem("uzbek-trainer-username") || "");
  const [progress, setProgress]     = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!token) return;
    apiProgress(token)
      .then(setProgress)
      .catch(() => {
        localStorage.removeItem("uzbek-trainer-token");
        localStorage.removeItem("uzbek-trainer-username");
        setToken("");
        setUsername("");
        setScreen("login");
      });
  }, [token]);

  function acceptAuth(payload: AuthPayload) {
    localStorage.setItem("uzbek-trainer-token", payload.token);
    localStorage.setItem("uzbek-trainer-username", payload.username);
    setToken(payload.token);
    setUsername(payload.username);
    setProgress(payload.progress || {});
    setScreen("home");
  }

  function startLesson(t: LessonType, tenseModes?: TenseMode[], wordTypes?: WordType[], wordGroups?: WordGroupId[]) {
    setLessonType(t);
    if (t === "tenses" && tenseModes?.length) setSelectedTenseModes(tenseModes);
    if (t !== "tenses" && wordTypes?.length) {
      setSelectedWordTypes(wordTypes);
      setSelectedWordGroups(wordGroups?.length ? wordGroups : wordTypes.map(defaultGroupFor).filter(Boolean) as WordGroupId[]);
    }
    setScreen(t);
  }
  function finish(r: ResultData) {
    setResult(r);
    setScreen("result");
    if (token) {
      const previous = Array.isArray(progress.results) ? progress.results : [];
      const previousKnown = progress.knownWords && typeof progress.knownWords === "object"
        ? progress.knownWords as Record<string, boolean>
        : {};
      const knownWords = { ...previousKnown };
      (r.wordIds || []).forEach((id) => {
        knownWords[id] = true;
      });
      const nextProgress = {
        ...progress,
        username,
        knownWords,
        results: [...previous, { ...r, finishedAt: new Date().toISOString() }].slice(-100),
      };
      setProgress(nextProgress);
      saveProgress(token, nextProgress).catch(() => undefined);
    }
  }

  if (screen === "login")    return <LoginScreen    onLogin={acceptAuth} onGo={() => setScreen("register")} />;
  if (screen === "register") return <RegisterScreen onRegister={acceptAuth} onGo={() => setScreen("login")} />;
  if (screen === "home")     return <HomeScreen     onStart={startLesson} username={username} progress={progress} />;
  if (screen === "flashcard") return <FlashcardLesson onComplete={finish} wordTypes={selectedWordTypes} wordGroups={selectedWordGroups} progress={progress} />;
  if (screen === "pairs")    return <PairsLesson    onComplete={finish} wordTypes={selectedWordTypes} wordGroups={selectedWordGroups} progress={progress} />;
  if (screen === "tenses")   return <TensesLesson   onComplete={finish} modes={selectedTenseModes} />;
  if (screen === "phrases")  return <PhrasesLesson  onComplete={finish} />;
  if (screen === "result" && result)
    return <ResultScreen result={result} onAgain={() => setScreen(lessonType)} onHome={() => setScreen("home")} />;
  return null;
}
