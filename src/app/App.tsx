import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowLeft, Eye, EyeOff, Check, RotateCcw, Clock,
  Star, AlertCircle, BookOpen, Zap, X,
} from "lucide-react";
import { WORDS, type Word, type WordType } from "./words";

// ─── Types ─────────────────────────────────────────────────────────────────
type Screen = "login" | "register" | "home" | "flashcard" | "pairs" | "tenses" | "result";
type LessonType = "flashcard" | "pairs" | "tenses";
type TenseMode = "present_yap" | "past_di" | "present_future";

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

const PRONOUNS = [
  { uz: "men", ru: "Я", present: "man", past: "m", future: "man" },
  { uz: "sen", ru: "Ты", present: "san", past: "ng", future: "san" },
  { uz: "u", ru: "Он/она", present: "ti", past: "", future: "di" },
  { uz: "biz", ru: "Мы", present: "miz", past: "k", future: "miz" },
  { uz: "siz", ru: "Вы", present: "siz", past: "ngiz", future: "siz" },
];

const RU_VERBS: Record<string, { present: string; past: string; future: string }> = {
  "oʻqi": { present: "читает", past: "читал", future: "прочитает" },
  "yoz": { present: "пишет", past: "писал", future: "напишет" },
  "ich": { present: "пьет", past: "пил", future: "выпьет" },
  "ye": { present: "ест", past: "ел", future: "съест" },
  "ishla": { present: "работает", past: "работал", future: "будет работать" },
  "saqla": { present: "сохраняет", past: "сохранил", future: "сохранит" },
  "sana": { present: "считает", past: "считал", future: "посчитает" },
  "koʻr": { present: "видит", past: "видел", future: "увидит" },
  "soʻra": { present: "спрашивает", past: "спросил", future: "спросит" },
  "tanla": { present: "выбирает", past: "выбрал", future: "выберет" },
  "yech": { present: "решает", past: "решил", future: "решит" },
  "bor": { present: "идет", past: "ходил", future: "пойдет" },
  "qayt": { present: "возвращается", past: "вернулся", future: "вернется" },
  "kel": { present: "приходит", past: "пришел", future: "придет" },
  "kut": { present: "ждет", past: "ждал", future: "подождет" },
  "yasha": { present: "живет", past: "жил", future: "будет жить" },
  "uchrash": { present: "встречается", past: "встретился", future: "встретится" },
};

function firstRu(text: string) {
  return text.split(",")[0].trim().toLowerCase();
}

function verbStem(verb: string) {
  if (verb === "yemoq") return "ye";
  return verb.replace(/moq$/i, "");
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ruVerb(stem: string, tense: TenseMode) {
  const forms = RU_VERBS[stem];
  if (!forms) return tense === "past_di" ? "сделал действие" : tense === "present_future" ? "сделает действие" : "делает действие";
  if (tense === "past_di") return forms.past;
  if (tense === "present_future") return forms.future;
  return forms.present;
}

function makeTenseChips(correct: string[], mode: TenseMode) {
  const extras = mode === "past_di"
    ? ["di", "m", "ng", "ngiz", "k", "mi", "ma"]
    : mode === "present_future"
      ? ["a", "y", "man", "san", "di", "miz", "siz", "mi", "ma"]
      : ["ma", "yap", "man", "san", "ti", "miz", "siz", "mi", "di"];
  return Array.from(new Set([...correct, ...shuffle(extras).slice(0, 5)]));
}

function buildTenseBank(size = 10000): TensesEx[] {
  const verbs = WORDS.filter(word => word.type === "verb").map(word => ({ ...word, stem: verbStem(word.uz) }));
  const nouns = WORDS.filter(word => word.type === "noun");
  const fallbackNouns = nouns.length ? nouns : WORDS.filter(word => word.type !== "verb");
  const modes: TenseMode[] = ["present_yap", "past_di", "present_future"];

  return Array.from({ length: size }, (_, i) => {
    const mode = modes[i % modes.length];
    const pronoun = PRONOUNS[i % PRONOUNS.length];
    const verb = verbs[(i * 17 + 3) % verbs.length];
    const object = fallbackNouns[(i * 29 + 7) % fallbackNouns.length];
    const negative = i % 5 === 2;
    const question = i % 4 === 1;
    const objectRu = firstRu(object.ru);
    const objectUz = object.uz;
    const actionRu = ruVerb(verb.stem, mode);
    const ruCore = `${pronoun.ru} ${negative ? "не " : ""}${actionRu} ${objectRu}`;
    const ru = `${sentenceCase(ruCore)}${question ? "?" : "."}`;

    const personChip = mode === "past_di" ? pronoun.past : mode === "present_future" ? pronoun.future : pronoun.present;
    const correct = mode === "past_di"
      ? [...(negative ? ["ma"] : []), "di", ...(personChip ? [personChip] : []), ...(question ? ["mi"] : [])]
      : mode === "present_future"
        ? [...(negative ? ["ma", "y"] : [verb.stem.endsWith("a") ? "y" : "a"]), personChip, ...(question ? ["mi"] : [])]
        : [...(negative ? ["ma"] : []), "yap", personChip, ...(question ? ["mi"] : [])];

    const wrongPronouns = shuffle(PRONOUNS.filter(p => p.uz !== pronoun.uz).map(p => p.uz)).slice(0, 3);

    return {
      tense: mode,
      ru,
      uz_stem: `${objectUz} ${verb.stem}`,
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

const TENSE_MODE_DEFS: { id: TenseMode; label: string; desc: string }[] = [
  { id: "present_yap", label: "Настоящее -yap", desc: "qilyapman, boryapsiz" },
  { id: "past_di", label: "Прошедшее -di", desc: "qildim, yedingizmi" },
  { id: "present_future", label: "Настоящее-будущее", desc: "boraman, yechasiz" },
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
  return null;
}

function CardImage({ card }: { card: typeof FLASHCARDS[0] }) {
  if (!card.img) return <AbstractCard card={card} />;
  return (
    <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100">
      <img src={img(card.img)} alt={card.uz} className="w-full h-full object-cover" />
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
function HomeScreen({ onStart, username, progress }: { onStart: (t: LessonType, tenseModes?: TenseMode[]) => void; username: string; progress: Record<string, unknown> }) {
  const [method, setMethod]   = useState<LessonType>("flashcard");
  const [cats, setCats]       = useState(new Set<WordType>(["noun", "verb"]));
  const [tenseModes, setTenseModes] = useState(new Set<TenseMode>(["present_yap", "past_di"]));
  const results = progressResults(progress);
  const known = knownWordIds(progress);
  const excellent = results.filter((result) => result.score >= 90).length;
  const avgScore = results.length
    ? (results.reduce((sum, result) => sum + result.score, 0) / results.length / 20).toFixed(1)
    : "0";
  const categories = categoryRows(progress);

  const toggle = (id: WordType) =>
    setCats(prev => {
      const n = new Set(prev);
      if (n.has(id)) { if (n.size > 1) n.delete(id); } else n.add(id);
      return n;
    });
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
          <div className="grid grid-cols-3 gap-3">
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
        ) : (
          <section>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Что учить</h2>
            <div className="flex flex-col gap-2">
              {categories.map(cat => {
                const sel = cats.has(cat.id);
                return (
                  <button
                    key={cat.id}
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
            <Btn full size="lg" onClick={() => onStart(method, Array.from(tenseModes))}>
              <Zap className="w-5 h-5" /> Начать урок
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Flashcard Lesson ──────────────────────────────────────────────────────
function FlashcardLesson({ onComplete }: { onComplete: (r: ResultData) => void }) {
  const [deck] = useState(() => shuffle(FLASHCARDS).slice(0, 10));
  const [dirs] = useState(() => Array.from({ length: 10 }, () => Math.random() > .5 ? 1 : 0));
  const [idx, setIdx]         = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown]     = useState(0);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [repeat, setRepeat]   = useState(0);
  const [errors, setErrors]   = useState(0);
  const t0 = useRef(Date.now());

  const card = deck[idx];
  const dir  = dirs[idx]; // 1 = uz→ru
  const total = deck.length;

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
    if (!flipped) { setFlipped(true); return; }
    const nextKnownIds = isKnown ? [...knownIds, card.id] : knownIds;
    if (isKnown) {
      setKnown(k => k + 1);
      setKnownIds(nextKnownIds);
    } else {
      setRepeat(r => r + 1);
      setErrors(e => e + 1);
    }
    if (idx + 1 >= total) { finish(!isKnown, nextKnownIds); return; }
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 60);
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

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-5 gap-5">
        {/* Card */}
        <div className="flex-1 min-h-[380px]" style={{ perspective: "1200px" }}>
          <div
            className="relative w-full h-full cursor-pointer transition-[transform] duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setFlipped(value => !value)}
          >
            {/* Front */}
            <div className="absolute inset-0 bg-white rounded-3xl border border-zinc-100 shadow-sm flex flex-col overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}>
              <div className="p-4"><CardImage card={card} /></div>
              <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-2">
                <p className="text-3xl font-bold text-zinc-900 text-center">{dir ? card.uz : card.ru}</p>
                <p className="text-sm text-zinc-400">Нажми, чтобы перевернуть</p>
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col overflow-hidden"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="p-4"><CardImage card={card} /></div>
              <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-1">
                <p className="text-base text-zinc-400 line-through">{dir ? card.uz : card.ru}</p>
                <p className="text-3xl font-bold text-emerald-700 text-center mt-1">{dir ? card.ru : card.uz}</p>
                <p className="text-sm font-mono text-zinc-500 mt-1">[{card.pron}]</p>
                <p className="text-sm text-zinc-400 mt-1 text-center">{card.hint}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          {!flipped ? (
            <Btn full size="lg" onClick={() => setFlipped(true)}>Показать перевод</Btn>
          ) : (
            <>
              <Btn variant="danger" full size="lg" onClick={() => act(false)}>
                <RotateCcw className="w-5 h-5" /> Повторить
              </Btn>
              <Btn variant="success" full size="lg" onClick={() => act(true)}>
                <Check className="w-5 h-5" /> Знаю
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pairs Lesson ──────────────────────────────────────────────────────────
type PairState = "idle" | "selected" | "correct" | "error" | "disabled";

function PairsLesson({ onComplete }: { onComplete: (r: ResultData) => void }) {
  const [round, setRound]       = useState(0);
  const [errors, setErrors]     = useState(0);
  const [score, setScore]       = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [selLeft, setSelLeft]   = useState<number | null>(null);
  const [states, setStates]     = useState<Record<string, PairState>>({});
  const [matched, setMatched]   = useState(0);
  const [leftArr, setLeftArr]   = useState<typeof PAIRS_WORDS>([]);
  const [rightArr, setRightArr] = useState<typeof PAIRS_WORDS>([]);
  const t0 = useRef(Date.now());
  const TOTAL = 10;

  useEffect(() => {
    const roundWords = shuffle(PAIRS_WORDS).slice(0, 7);
    setLeftArr(shuffle(roundWords));
    setRightArr(shuffle(roundWords));
    setStates({});
    setSelLeft(null);
    setMatched(0);
  }, [round]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.round((Date.now() - t0.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  function gs(side: "l" | "r", id: number): PairState {
    return states[`${side}${id}`] ?? "idle";
  }

  function clickLeft(id: number) {
    const st = gs("l", id);
    if (st === "disabled" || st === "correct") return;
    setSelLeft(id);
    setStates(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (k.startsWith("l") && n[k] === "selected") n[k] = "idle"; });
      n[`l${id}`] = "selected";
      return n;
    });
  }

  function clickRight(id: number) {
    const st = gs("r", id);
    if (st === "disabled" || st === "correct" || selLeft === null) return;

    if (selLeft === id) {
      // Correct
      setScore(s => s + 10);
      setStates(prev => ({ ...prev, [`l${id}`]: "correct", [`r${id}`]: "correct" }));
      const newMatched = matched + 1;
      setMatched(newMatched);
      setSelLeft(null);
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
      const lId = selLeft;
      setStates(prev => ({ ...prev, [`l${lId}`]: "error", [`r${id}`]: "error" }));
      setTimeout(() => {
        setStates(prev => ({ ...prev, [`l${lId}`]: "idle", [`r${id}`]: "idle" }));
        setSelLeft(null);
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
                onClick={() => clickLeft(item.id)}
                className={cn(
                  "w-full py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200",
                  cellStyle(gs("l", item.id), selLeft === item.id)
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
                onClick={() => clickRight(item.id)}
                className={cn(
                  "w-full py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200",
                  cellStyle(gs("r", item.id), false)
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

          {checked && (!cOk || pBad) && (
            <p className="text-xs text-emerald-600 mt-3 font-semibold">
              Правильно: {ex.correct_pronoun} {ex.uz_stem}{ex.correct_chips.join("")}{ex.question ? "?" : "."}
            </p>
          )}
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

// ─── Result ────────────────────────────────────────────────────────────────
function ResultScreen({ result, onAgain, onHome }: { result: ResultData; onAgain: () => void; onHome: () => void }) {
  const isBest = result.score >= 90;
  const names: Record<LessonType, string> = { flashcard: "Карточки", pairs: "Пары", tenses: "Времена" };

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
  const [selectedTenseModes, setSelectedTenseModes] = useState<TenseMode[]>(["present_yap", "past_di"]);
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

  function startLesson(t: LessonType, tenseModes?: TenseMode[]) {
    setLessonType(t);
    if (t === "tenses" && tenseModes?.length) setSelectedTenseModes(tenseModes);
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
  if (screen === "flashcard") return <FlashcardLesson onComplete={finish} />;
  if (screen === "pairs")    return <PairsLesson    onComplete={finish} />;
  if (screen === "tenses")   return <TensesLesson   onComplete={finish} modes={selectedTenseModes} />;
  if (screen === "result" && result)
    return <ResultScreen result={result} onAgain={() => setScreen(lessonType)} onHome={() => setScreen("home")} />;
  return null;
}
