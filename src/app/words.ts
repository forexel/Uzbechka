export type WordType = "verb" | "noun" | "pronoun" | "question" | "number" | "other";

export interface Word {
  id: string;
  type: WordType;
  uz: string;
  pron: string;
  ru: string;
  visual: string;
  hint: string;
}

export const WORDS: Word[] = [
  {
    "id": "verb-0",
    "type": "verb",
    "uz": "kirmoq",
    "pron": "кирмок",
    "ru": "входить",
    "visual": "🚪",
    "hint": "Войти внутрь"
  },
  {
    "id": "verb-1",
    "type": "verb",
    "uz": "chiqmoq",
    "pron": "чикмок",
    "ru": "выходить",
    "visual": "🚶",
    "hint": "Выйти наружу"
  },
  {
    "id": "verb-2",
    "type": "verb",
    "uz": "kutmoq",
    "pron": "кутмок",
    "ru": "ждать",
    "visual": "⏳",
    "hint": "Ждать"
  },
  {
    "id": "verb-3",
    "type": "verb",
    "uz": "oʻtirmoq",
    "pron": "утирмок",
    "ru": "сидеть",
    "visual": "🪑",
    "hint": "Сидеть"
  },
  {
    "id": "verb-4",
    "type": "verb",
    "uz": "ishlamoq",
    "pron": "ишламок",
    "ru": "работать",
    "visual": "💼",
    "hint": "Иш = работа"
  },
  {
    "id": "verb-5",
    "type": "verb",
    "uz": "yashamoq",
    "pron": "яшамок",
    "ru": "жить",
    "visual": "🏠",
    "hint": "Жить"
  },
  {
    "id": "verb-6",
    "type": "verb",
    "uz": "ichmoq",
    "pron": "ичмок",
    "ru": "пить",
    "visual": "🥤",
    "hint": "Пить"
  },
  {
    "id": "verb-7",
    "type": "verb",
    "uz": "yemoq",
    "pron": "емок",
    "ru": "есть, кушать",
    "visual": "🍽️",
    "hint": "Особая основа: ye-"
  },
  {
    "id": "verb-8",
    "type": "verb",
    "uz": "bermoq",
    "pron": "бермок",
    "ru": "давать",
    "visual": "🤲",
    "hint": "Давать"
  },
  {
    "id": "verb-9",
    "type": "verb",
    "uz": "boʻlmoq",
    "pron": "булмок",
    "ru": "быть, состояться",
    "visual": "✅",
    "hint": "Быть"
  },
  {
    "id": "verb-10",
    "type": "verb",
    "uz": "qaytmoq",
    "pron": "кайтмок",
    "ru": "возвращаться",
    "visual": "↩️",
    "hint": "Вернуться"
  },
  {
    "id": "verb-11",
    "type": "verb",
    "uz": "koʻrmoq",
    "pron": "курмок",
    "ru": "видеть",
    "visual": "👁️",
    "hint": "Видеть"
  },
  {
    "id": "verb-12",
    "type": "verb",
    "uz": "koʻrsatmoq",
    "pron": "курсатмок",
    "ru": "показывать",
    "visual": "👉",
    "hint": "Дать увидеть"
  },
  {
    "id": "verb-13",
    "type": "verb",
    "uz": "koʻtarmoq",
    "pron": "кутармок",
    "ru": "поднимать",
    "visual": "🏋️",
    "hint": "Поднимать"
  },
  {
    "id": "verb-14",
    "type": "verb",
    "uz": "qaramoq",
    "pron": "карамок",
    "ru": "смотреть",
    "visual": "👀",
    "hint": "Смотреть"
  },
  {
    "id": "verb-15",
    "type": "verb",
    "uz": "boʻyamoq",
    "pron": "буямок",
    "ru": "красить",
    "visual": "🎨",
    "hint": "Красить"
  },
  {
    "id": "verb-16",
    "type": "verb",
    "uz": "bekitmoq",
    "pron": "бекитмок",
    "ru": "прятать, закрывать",
    "visual": "🧰",
    "hint": "Закрыть"
  },
  {
    "id": "verb-17",
    "type": "verb",
    "uz": "yashirmoq",
    "pron": "яширмок",
    "ru": "прятать, скрывать",
    "visual": "🙈",
    "hint": "Скрыть"
  },
  {
    "id": "verb-18",
    "type": "verb",
    "uz": "sanamoq",
    "pron": "санамок",
    "ru": "считать числа",
    "visual": "🔢",
    "hint": "Считать"
  },
  {
    "id": "verb-19",
    "type": "verb",
    "uz": "saqlamoq",
    "pron": "сакламок",
    "ru": "хранить, сохранять",
    "visual": "🔒",
    "hint": "Сохранить"
  },
  {
    "id": "verb-20",
    "type": "verb",
    "uz": "surmoq",
    "pron": "сурмок",
    "ru": "двигать, отодвигать",
    "visual": "📦",
    "hint": "Двигать"
  },
  {
    "id": "verb-21",
    "type": "verb",
    "uz": "soʻramoq",
    "pron": "сурамок",
    "ru": "спрашивать, просить",
    "visual": "❓",
    "hint": "Спросить"
  },
  {
    "id": "verb-22",
    "type": "verb",
    "uz": "tanlamoq",
    "pron": "танламок",
    "ru": "выбирать",
    "visual": "☑️",
    "hint": "Выбрать"
  },
  {
    "id": "verb-23",
    "type": "verb",
    "uz": "termoq",
    "pron": "термок",
    "ru": "собирать руками",
    "visual": "🫐",
    "hint": "Собирать руками"
  },
  {
    "id": "verb-24",
    "type": "verb",
    "uz": "yigʻmoq",
    "pron": "йигмок",
    "ru": "собирать вместе",
    "visual": "🧩",
    "hint": "Собрать"
  },
  {
    "id": "verb-25",
    "type": "verb",
    "uz": "tugatmoq",
    "pron": "тугатмок",
    "ru": "закончить",
    "visual": "🏁",
    "hint": "Закончить"
  },
  {
    "id": "verb-26",
    "type": "verb",
    "uz": "bajarmoq",
    "pron": "бажармок",
    "ru": "выполнить",
    "visual": "💪",
    "hint": "Выполнить"
  },
  {
    "id": "verb-27",
    "type": "verb",
    "uz": "javob bermoq",
    "pron": "жавоб бермок",
    "ru": "отвечать",
    "visual": "💬",
    "hint": "Дать ответ"
  },
  {
    "id": "verb-28",
    "type": "verb",
    "uz": "oʻtmoq",
    "pron": "утмок",
    "ru": "проходить",
    "visual": "➡️",
    "hint": "Проходить"
  },
  {
    "id": "verb-29",
    "type": "verb",
    "uz": "rejalashtirmoq",
    "pron": "режалаштирмок",
    "ru": "планировать",
    "visual": "🗓️",
    "hint": "Reja = план"
  },
  {
    "id": "verb-30",
    "type": "verb",
    "uz": "ruxsat bermoq",
    "pron": "рухсат бермок",
    "ru": "разрешить",
    "visual": "🟢",
    "hint": "Дать разрешение"
  },
  {
    "id": "verb-31",
    "type": "verb",
    "uz": "qilmoq",
    "pron": "килмок",
    "ru": "делать",
    "visual": "🛠️",
    "hint": "Делать"
  },
  {
    "id": "verb-32",
    "type": "verb",
    "uz": "uchrashmoq",
    "pron": "учрашмок",
    "ru": "встречаться",
    "visual": "🤝",
    "hint": "Встречаться"
  },
  {
    "id": "verb-33",
    "type": "verb",
    "uz": "tasdiqlamoq",
    "pron": "тасдикламок",
    "ru": "утверждать",
    "visual": "✅",
    "hint": "Подтвердить"
  },
  {
    "id": "verb-34",
    "type": "verb",
    "uz": "yechmoq",
    "pron": "ечмок",
    "ru": "решать задачу",
    "visual": "🧩",
    "hint": "Решить"
  },
  {
    "id": "verb-35",
    "type": "verb",
    "uz": "jonga tegmoq",
    "pron": "жонга тегмок",
    "ru": "надоесть",
    "visual": "😤",
    "hint": "Достать до души"
  },
  {
    "id": "verb-36",
    "type": "verb",
    "uz": "koʻzdan kechirmoq",
    "pron": "куздан кечирмок",
    "ru": "просматривать",
    "visual": "🔍",
    "hint": "Koʻz = глаз"
  },
  {
    "id": "noun-37",
    "type": "noun",
    "uz": "rahbar",
    "pron": "рахбар",
    "ru": "руководитель",
    "visual": "👔",
    "hint": "Руководитель"
  },
  {
    "id": "noun-38",
    "type": "noun",
    "uz": "boshliq",
    "pron": "бошлик",
    "ru": "начальник",
    "visual": "🧑‍💼",
    "hint": "Bosh = голова"
  },
  {
    "id": "noun-39",
    "type": "noun",
    "uz": "ishchi",
    "pron": "ишчи",
    "ru": "рабочий",
    "visual": "👷",
    "hint": "Ish + chi"
  },
  {
    "id": "noun-40",
    "type": "noun",
    "uz": "mehmon",
    "pron": "мехмон",
    "ru": "гость",
    "visual": "🧳",
    "hint": "Гость"
  },
  {
    "id": "noun-41",
    "type": "noun",
    "uz": "hujjat",
    "pron": "хужжат",
    "ru": "документ",
    "visual": "📄",
    "hint": "Документ"
  },
  {
    "id": "noun-42",
    "type": "noun",
    "uz": "foyda",
    "pron": "фойда",
    "ru": "прибыль, польза",
    "visual": "📈",
    "hint": "Выгода"
  },
  {
    "id": "noun-43",
    "type": "noun",
    "uz": "pul",
    "pron": "пул",
    "ru": "деньги",
    "visual": "💵",
    "hint": "Деньги"
  },
  {
    "id": "noun-44",
    "type": "noun",
    "uz": "ish",
    "pron": "иш",
    "ru": "работа, дело",
    "visual": "💼",
    "hint": "Работа"
  },
  {
    "id": "noun-45",
    "type": "noun",
    "uz": "ofis",
    "pron": "офис",
    "ru": "офис",
    "visual": "🏢",
    "hint": "Офис"
  },
  {
    "id": "noun-46",
    "type": "noun",
    "uz": "uy",
    "pron": "уй",
    "ru": "дом",
    "visual": "🏠",
    "hint": "Дом"
  },
  {
    "id": "noun-47",
    "type": "noun",
    "uz": "koʻcha",
    "pron": "куча",
    "ru": "улица",
    "visual": "🛣️",
    "hint": "Улица"
  },
  {
    "id": "noun-48",
    "type": "noun",
    "uz": "bogʻ",
    "pron": "бог",
    "ru": "сад, парк",
    "visual": "🌳",
    "hint": "Сад"
  },
  {
    "id": "noun-49",
    "type": "noun",
    "uz": "devor",
    "pron": "девор",
    "ru": "стена",
    "visual": "🧱",
    "hint": "Стена"
  },
  {
    "id": "noun-50",
    "type": "noun",
    "uz": "yoʻl",
    "pron": "юл",
    "ru": "дорога, путь",
    "visual": "🛤️",
    "hint": "Путь"
  },
  {
    "id": "noun-51",
    "type": "noun",
    "uz": "sayohat",
    "pron": "сайёхат",
    "ru": "путешествие",
    "visual": "✈️",
    "hint": "Путешествие"
  },
  {
    "id": "noun-52",
    "type": "noun",
    "uz": "ovqat",
    "pron": "овкат",
    "ru": "еда, пища",
    "visual": "🍲",
    "hint": "Еда"
  },
  {
    "id": "noun-53",
    "type": "noun",
    "uz": "kitob",
    "pron": "китоб",
    "ru": "книга",
    "visual": "📖",
    "hint": "Книга"
  },
  {
    "id": "noun-54",
    "type": "noun",
    "uz": "stol",
    "pron": "стол",
    "ru": "стол",
    "visual": "🪑",
    "hint": "Стол"
  },
  {
    "id": "noun-55",
    "type": "noun",
    "uz": "stul",
    "pron": "стул",
    "ru": "стул",
    "visual": "🪑",
    "hint": "Стул"
  },
  {
    "id": "noun-56",
    "type": "noun",
    "uz": "kafe",
    "pron": "кафе",
    "ru": "кафе",
    "visual": "☕",
    "hint": "Кафе"
  },
  {
    "id": "noun-57",
    "type": "noun",
    "uz": "qahva",
    "pron": "кахва",
    "ru": "кофе",
    "visual": "☕",
    "hint": "Кофе"
  },
  {
    "id": "noun-58",
    "type": "noun",
    "uz": "choy",
    "pron": "чой",
    "ru": "чай",
    "visual": "🍵",
    "hint": "Чай"
  },
  {
    "id": "noun-59",
    "type": "noun",
    "uz": "non",
    "pron": "нон",
    "ru": "хлеб",
    "visual": "🍞",
    "hint": "Хлеб"
  },
  {
    "id": "noun-60",
    "type": "noun",
    "uz": "kompyuter",
    "pron": "компьютер",
    "ru": "компьютер",
    "visual": "💻",
    "hint": "Компьютер"
  },
  {
    "id": "noun-61",
    "type": "noun",
    "uz": "narsa",
    "pron": "нарса",
    "ru": "вещь",
    "visual": "📦",
    "hint": "Вещь"
  },
  {
    "id": "noun-62",
    "type": "noun",
    "uz": "masala",
    "pron": "масала",
    "ru": "задача",
    "visual": "🧩",
    "hint": "Задача"
  },
  {
    "id": "noun-63",
    "type": "noun",
    "uz": "reja",
    "pron": "режа",
    "ru": "план",
    "visual": "🗒️",
    "hint": "План"
  },
  {
    "id": "noun-64",
    "type": "noun",
    "uz": "maktab",
    "pron": "мактаб",
    "ru": "школа",
    "visual": "🏫",
    "hint": "Школа"
  },
  {
    "id": "noun-65",
    "type": "noun",
    "uz": "mashina",
    "pron": "машина",
    "ru": "машина",
    "visual": "🚗",
    "hint": "Машина"
  },
  {
    "id": "noun-66",
    "type": "noun",
    "uz": "daraxt",
    "pron": "дарахт",
    "ru": "дерево",
    "visual": "🌳",
    "hint": "Дерево"
  },
  {
    "id": "noun-67",
    "type": "noun",
    "uz": "komanda",
    "pron": "команда",
    "ru": "команда",
    "visual": "👥",
    "hint": "Команда"
  },
  {
    "id": "noun-68",
    "type": "noun",
    "uz": "odam",
    "pron": "одам",
    "ru": "человек",
    "visual": "🧍",
    "hint": "Человек"
  },
  {
    "id": "noun-69",
    "type": "noun",
    "uz": "kishi",
    "pron": "киши",
    "ru": "человек",
    "visual": "👤",
    "hint": "Человек"
  },
  {
    "id": "noun-70",
    "type": "noun",
    "uz": "maosh",
    "pron": "маош",
    "ru": "зарплата",
    "visual": "💰",
    "hint": "Зарплата"
  },
  {
    "id": "noun-71",
    "type": "noun",
    "uz": "oylik",
    "pron": "ойлик",
    "ru": "зарплата",
    "visual": "💸",
    "hint": "Oy = месяц"
  },
  {
    "id": "noun-72",
    "type": "noun",
    "uz": "sotuv",
    "pron": "сотув",
    "ru": "продажа",
    "visual": "🛍️",
    "hint": "Продажа"
  },
  {
    "id": "noun-73",
    "type": "noun",
    "uz": "qoʻngʻiroq",
    "pron": "кунгирок",
    "ru": "звонок, созвон",
    "visual": "☎️",
    "hint": "Звонок"
  },
  {
    "id": "noun-74",
    "type": "noun",
    "uz": "yil",
    "pron": "йил",
    "ru": "год",
    "visual": "📅",
    "hint": "Год"
  },
  {
    "id": "pronoun-75",
    "type": "pronoun",
    "uz": "men",
    "pron": "мен",
    "ru": "я",
    "visual": "🧍",
    "hint": "Кто делает"
  },
  {
    "id": "pronoun-76",
    "type": "pronoun",
    "uz": "sen",
    "pron": "сен",
    "ru": "ты",
    "visual": "👉",
    "hint": "Кто делает"
  },
  {
    "id": "pronoun-77",
    "type": "pronoun",
    "uz": "u",
    "pron": "у",
    "ru": "он, она, оно",
    "visual": "👤",
    "hint": "Рода нет"
  },
  {
    "id": "pronoun-78",
    "type": "pronoun",
    "uz": "biz",
    "pron": "биз",
    "ru": "мы",
    "visual": "👥",
    "hint": "Кто делает"
  },
  {
    "id": "pronoun-79",
    "type": "pronoun",
    "uz": "siz",
    "pron": "сиз",
    "ru": "вы",
    "visual": "🤵",
    "hint": "Кто делает"
  },
  {
    "id": "pronoun-80",
    "type": "pronoun",
    "uz": "ular",
    "pron": "улар",
    "ru": "они",
    "visual": "👥",
    "hint": "Кто делает"
  },
  {
    "id": "pronoun-81",
    "type": "pronoun",
    "uz": "menga",
    "pron": "менга",
    "ru": "мне",
    "visual": "🤲",
    "hint": "men + ga"
  },
  {
    "id": "pronoun-82",
    "type": "pronoun",
    "uz": "senga",
    "pron": "сенга",
    "ru": "тебе",
    "visual": "👉",
    "hint": "sen + ga"
  },
  {
    "id": "pronoun-83",
    "type": "pronoun",
    "uz": "unga",
    "pron": "унга",
    "ru": "ему, ей",
    "visual": "👤",
    "hint": "u + ga"
  },
  {
    "id": "pronoun-84",
    "type": "pronoun",
    "uz": "bizga",
    "pron": "бизга",
    "ru": "нам",
    "visual": "👥",
    "hint": "biz + ga"
  },
  {
    "id": "pronoun-85",
    "type": "pronoun",
    "uz": "sizga",
    "pron": "сизга",
    "ru": "вам",
    "visual": "🤵",
    "hint": "siz + ga"
  },
  {
    "id": "pronoun-86",
    "type": "pronoun",
    "uz": "ularga",
    "pron": "уларга",
    "ru": "им",
    "visual": "👥",
    "hint": "ular + ga"
  },
  {
    "id": "pronoun-87",
    "type": "pronoun",
    "uz": "meni",
    "pron": "мени",
    "ru": "меня",
    "visual": "🧍",
    "hint": "men + ni"
  },
  {
    "id": "pronoun-88",
    "type": "pronoun",
    "uz": "seni",
    "pron": "сени",
    "ru": "тебя",
    "visual": "👉",
    "hint": "sen + ni"
  },
  {
    "id": "pronoun-89",
    "type": "pronoun",
    "uz": "uni",
    "pron": "уни",
    "ru": "его, ее",
    "visual": "👤",
    "hint": "u + ni"
  },
  {
    "id": "pronoun-90",
    "type": "pronoun",
    "uz": "menda",
    "pron": "менда",
    "ru": "у меня, во мне",
    "visual": "🎒",
    "hint": "men + da; иметь: menda ... bor"
  },
  {
    "id": "pronoun-91",
    "type": "pronoun",
    "uz": "sizda",
    "pron": "сизда",
    "ru": "у вас, в вас",
    "visual": "💼",
    "hint": "siz + da; иметь: sizda ... bor"
  },
  {
    "id": "pronoun-259",
    "type": "pronoun",
    "uz": "sening",
    "pron": "сенинг",
    "ru": "твой, твоя, твое; у тебя",
    "visual": "👉",
    "hint": "sen + ning"
  },
  {
    "id": "pronoun-260",
    "type": "pronoun",
    "uz": "uning",
    "pron": "унинг",
    "ru": "его, ее; у него, у нее",
    "visual": "👤",
    "hint": "u + ning"
  },
  {
    "id": "pronoun-261",
    "type": "pronoun",
    "uz": "bizning",
    "pron": "бизнинг",
    "ru": "наш, наша, наше; у нас",
    "visual": "👥",
    "hint": "biz + ning"
  },
  {
    "id": "pronoun-262",
    "type": "pronoun",
    "uz": "sizning",
    "pron": "сизнинг",
    "ru": "ваш, ваша, ваше; у вас",
    "visual": "🤵",
    "hint": "siz + ning"
  },
  {
    "id": "pronoun-263",
    "type": "pronoun",
    "uz": "ularning",
    "pron": "уларнинг",
    "ru": "их; у них",
    "visual": "👥",
    "hint": "ular + ning"
  },
  {
    "id": "pronoun-264",
    "type": "pronoun",
    "uz": "bizni",
    "pron": "бизни",
    "ru": "нас",
    "visual": "👥",
    "hint": "biz + ni"
  },
  {
    "id": "pronoun-265",
    "type": "pronoun",
    "uz": "sizni",
    "pron": "сизни",
    "ru": "вас",
    "visual": "🤵",
    "hint": "siz + ni"
  },
  {
    "id": "pronoun-266",
    "type": "pronoun",
    "uz": "ularni",
    "pron": "уларни",
    "ru": "их",
    "visual": "👥",
    "hint": "ular + ni"
  },
  {
    "id": "pronoun-267",
    "type": "pronoun",
    "uz": "senda",
    "pron": "сенда",
    "ru": "у тебя, в тебе",
    "visual": "👉",
    "hint": "sen + da"
  },
  {
    "id": "pronoun-268",
    "type": "pronoun",
    "uz": "unda",
    "pron": "унда",
    "ru": "у него, у нее; в нем, в ней",
    "visual": "👤",
    "hint": "u + da"
  },
  {
    "id": "pronoun-269",
    "type": "pronoun",
    "uz": "bizda",
    "pron": "бизда",
    "ru": "у нас, в нас",
    "visual": "👥",
    "hint": "biz + da"
  },
  {
    "id": "pronoun-270",
    "type": "pronoun",
    "uz": "ularda",
    "pron": "уларда",
    "ru": "у них, в них",
    "visual": "👥",
    "hint": "ular + da"
  },
  {
    "id": "pronoun-271",
    "type": "pronoun",
    "uz": "mendan",
    "pron": "мендан",
    "ru": "от меня, из меня",
    "visual": "🧍",
    "hint": "men + dan"
  },
  {
    "id": "pronoun-272",
    "type": "pronoun",
    "uz": "sendan",
    "pron": "сендан",
    "ru": "от тебя, из тебя",
    "visual": "👉",
    "hint": "sen + dan"
  },
  {
    "id": "pronoun-273",
    "type": "pronoun",
    "uz": "undan",
    "pron": "ундан",
    "ru": "от него, от нее; из него, из нее",
    "visual": "👤",
    "hint": "u + dan"
  },
  {
    "id": "pronoun-274",
    "type": "pronoun",
    "uz": "bizdan",
    "pron": "биздан",
    "ru": "от нас, из нас",
    "visual": "👥",
    "hint": "biz + dan"
  },
  {
    "id": "pronoun-275",
    "type": "pronoun",
    "uz": "sizdan",
    "pron": "сиздан",
    "ru": "от вас, из вас",
    "visual": "🤵",
    "hint": "siz + dan"
  },
  {
    "id": "pronoun-276",
    "type": "pronoun",
    "uz": "ulardan",
    "pron": "улардан",
    "ru": "от них, из них",
    "visual": "👥",
    "hint": "ular + dan"
  },
  {
    "id": "question-92",
    "type": "question",
    "uz": "nima",
    "pron": "нима",
    "ru": "что",
    "visual": "❓",
    "hint": "Что"
  },
  {
    "id": "question-93",
    "type": "question",
    "uz": "nimani",
    "pron": "нимани",
    "ru": "что, объект",
    "visual": "❓",
    "hint": "nima + ni"
  },
  {
    "id": "question-94",
    "type": "question",
    "uz": "kim",
    "pron": "ким",
    "ru": "кто",
    "visual": "👤",
    "hint": "Кто"
  },
  {
    "id": "question-95",
    "type": "question",
    "uz": "kimni",
    "pron": "кимни",
    "ru": "кого",
    "visual": "👤",
    "hint": "kim + ni"
  },
  {
    "id": "question-96",
    "type": "question",
    "uz": "nega",
    "pron": "нега",
    "ru": "почему",
    "visual": "🤔",
    "hint": "Почему"
  },
  {
    "id": "question-97",
    "type": "question",
    "uz": "nimaga",
    "pron": "нимага",
    "ru": "почему, зачем",
    "visual": "🤔",
    "hint": "nima + ga"
  },
  {
    "id": "question-98",
    "type": "question",
    "uz": "qachon",
    "pron": "качон",
    "ru": "когда",
    "visual": "🕒",
    "hint": "Когда"
  },
  {
    "id": "question-99",
    "type": "question",
    "uz": "qayerda",
    "pron": "каерда",
    "ru": "где",
    "visual": "📍",
    "hint": "Где"
  },
  {
    "id": "question-100",
    "type": "question",
    "uz": "qayerga",
    "pron": "каерга",
    "ru": "куда",
    "visual": "➡️",
    "hint": "Куда"
  },
  {
    "id": "question-101",
    "type": "question",
    "uz": "qayerdan",
    "pron": "каердан",
    "ru": "откуда",
    "visual": "⬅️",
    "hint": "Откуда"
  },
  {
    "id": "question-102",
    "type": "question",
    "uz": "qanday",
    "pron": "кандай",
    "ru": "как, какой",
    "visual": "🧭",
    "hint": "Какой"
  },
  {
    "id": "question-103",
    "type": "question",
    "uz": "qancha",
    "pron": "канча",
    "ru": "сколько",
    "visual": "🔢",
    "hint": "Количество"
  },
  {
    "id": "question-104",
    "type": "question",
    "uz": "nechta",
    "pron": "нечта",
    "ru": "сколько штук",
    "visual": "🔢",
    "hint": "Перед ед. числом"
  },
  {
    "id": "number-105",
    "type": "number",
    "uz": "nol",
    "pron": "нол",
    "ru": "ноль",
    "visual": "0️⃣",
    "hint": "0"
  },
  {
    "id": "number-106",
    "type": "number",
    "uz": "bir",
    "pron": "бир",
    "ru": "один",
    "visual": "1️⃣",
    "hint": "1"
  },
  {
    "id": "number-107",
    "type": "number",
    "uz": "ikki",
    "pron": "икки",
    "ru": "два",
    "visual": "2️⃣",
    "hint": "2"
  },
  {
    "id": "number-108",
    "type": "number",
    "uz": "uch",
    "pron": "уч",
    "ru": "три",
    "visual": "3️⃣",
    "hint": "3"
  },
  {
    "id": "number-109",
    "type": "number",
    "uz": "toʻrt",
    "pron": "турт",
    "ru": "четыре",
    "visual": "4️⃣",
    "hint": "4"
  },
  {
    "id": "number-110",
    "type": "number",
    "uz": "besh",
    "pron": "беш",
    "ru": "пять",
    "visual": "5️⃣",
    "hint": "5"
  },
  {
    "id": "number-111",
    "type": "number",
    "uz": "olti",
    "pron": "олти",
    "ru": "шесть",
    "visual": "6️⃣",
    "hint": "6"
  },
  {
    "id": "number-112",
    "type": "number",
    "uz": "yetti",
    "pron": "етти",
    "ru": "семь",
    "visual": "7️⃣",
    "hint": "7"
  },
  {
    "id": "number-113",
    "type": "number",
    "uz": "sakkiz",
    "pron": "саккиз",
    "ru": "восемь",
    "visual": "8️⃣",
    "hint": "8"
  },
  {
    "id": "number-114",
    "type": "number",
    "uz": "toʻqqiz",
    "pron": "туккиз",
    "ru": "девять",
    "visual": "9️⃣",
    "hint": "9"
  },
  {
    "id": "number-115",
    "type": "number",
    "uz": "oʻn",
    "pron": "ун",
    "ru": "десять",
    "visual": "🔟",
    "hint": "10"
  },
  {
    "id": "number-116",
    "type": "number",
    "uz": "yigirma",
    "pron": "йигирма",
    "ru": "двадцать",
    "visual": "20",
    "hint": "20"
  },
  {
    "id": "number-117",
    "type": "number",
    "uz": "oʻttiz",
    "pron": "уттиз",
    "ru": "тридцать",
    "visual": "30",
    "hint": "30"
  },
  {
    "id": "number-118",
    "type": "number",
    "uz": "qirq",
    "pron": "кирк",
    "ru": "сорок",
    "visual": "40",
    "hint": "40"
  },
  {
    "id": "number-119",
    "type": "number",
    "uz": "ellik",
    "pron": "эллик",
    "ru": "пятьдесят",
    "visual": "50",
    "hint": "50"
  },
  {
    "id": "number-120",
    "type": "number",
    "uz": "oltmish",
    "pron": "олтмиш",
    "ru": "шестьдесят",
    "visual": "60",
    "hint": "60"
  },
  {
    "id": "number-121",
    "type": "number",
    "uz": "yetmish",
    "pron": "етмиш",
    "ru": "семьдесят",
    "visual": "70",
    "hint": "70"
  },
  {
    "id": "number-122",
    "type": "number",
    "uz": "sakson",
    "pron": "саксон",
    "ru": "восемьдесят",
    "visual": "80",
    "hint": "80"
  },
  {
    "id": "number-123",
    "type": "number",
    "uz": "toʻqson",
    "pron": "туксон",
    "ru": "девяносто",
    "visual": "90",
    "hint": "90"
  },
  {
    "id": "number-124",
    "type": "number",
    "uz": "yuz",
    "pron": "юз",
    "ru": "сто",
    "visual": "💯",
    "hint": "100"
  },
  {
    "id": "number-125",
    "type": "number",
    "uz": "ming",
    "pron": "минг",
    "ru": "тысяча",
    "visual": "1000",
    "hint": "1000"
  },
  {
    "id": "other-126",
    "type": "other",
    "uz": "hamma",
    "pron": "хамма",
    "ru": "все",
    "visual": "👥",
    "hint": "Все"
  },
  {
    "id": "other-127",
    "type": "other",
    "uz": "hamma narsa",
    "pron": "хамма нарса",
    "ru": "все, всё",
    "visual": "📦",
    "hint": "Все вещи"
  },
  {
    "id": "other-128",
    "type": "other",
    "uz": "katta",
    "pron": "катта",
    "ru": "большой",
    "visual": "🐘",
    "hint": "Большой"
  },
  {
    "id": "other-129",
    "type": "other",
    "uz": "kichkina",
    "pron": "кичкина",
    "ru": "маленький",
    "visual": "🔹",
    "hint": "Маленький"
  },
  {
    "id": "other-130",
    "type": "other",
    "uz": "yaxshi",
    "pron": "яхши",
    "ru": "хороший, хорошо",
    "visual": "👍",
    "hint": "Хорошо"
  },
  {
    "id": "other-131",
    "type": "other",
    "uz": "yomon",
    "pron": "ёмон",
    "ru": "плохой, плохо",
    "visual": "👎",
    "hint": "Плохо"
  },
  {
    "id": "other-132",
    "type": "other",
    "uz": "qiziq",
    "pron": "кизик",
    "ru": "интересный",
    "visual": "🤔",
    "hint": "Интересно"
  },
  {
    "id": "other-133",
    "type": "other",
    "uz": "qiziqarli",
    "pron": "кизикарли",
    "ru": "увлекательный",
    "visual": "📚",
    "hint": "Увлекательно"
  },
  {
    "id": "other-134",
    "type": "other",
    "uz": "uzoq",
    "pron": "узок",
    "ru": "далеко, долго",
    "visual": "🛤️",
    "hint": "Далеко"
  },
  {
    "id": "other-135",
    "type": "other",
    "uz": "yillik",
    "pron": "йиллик",
    "ru": "годовой",
    "visual": "📆",
    "hint": "yil + lik"
  },
  {
    "id": "other-136",
    "type": "other",
    "uz": "bugun",
    "pron": "бугун",
    "ru": "сегодня",
    "visual": "📍",
    "hint": "Сегодня"
  },
  {
    "id": "other-137",
    "type": "other",
    "uz": "bugungi",
    "pron": "бугунги",
    "ru": "сегодняшний",
    "visual": "📍",
    "hint": "Сегодняшний"
  },
  {
    "id": "other-138",
    "type": "other",
    "uz": "kecha",
    "pron": "кеча",
    "ru": "вчера",
    "visual": "🌙",
    "hint": "Вчера"
  },
  {
    "id": "other-139",
    "type": "other",
    "uz": "ertalab",
    "pron": "эрталаб",
    "ru": "утром",
    "visual": "🌅",
    "hint": "Утром"
  },
  {
    "id": "other-140",
    "type": "other",
    "uz": "hozir",
    "pron": "хозир",
    "ru": "сейчас",
    "visual": "⏱️",
    "hint": "Сейчас"
  },
  {
    "id": "other-141",
    "type": "other",
    "uz": "hozirgina",
    "pron": "хозиргина",
    "ru": "только что",
    "visual": "⚡",
    "hint": "Только что"
  },
  {
    "id": "other-142",
    "type": "other",
    "uz": "oxirgi",
    "pron": "охирги",
    "ru": "последний",
    "visual": "🏁",
    "hint": "Последний"
  },
  {
    "id": "other-143",
    "type": "other",
    "uz": "marta",
    "pron": "марта",
    "ru": "раз",
    "visual": "🔁",
    "hint": "Раз"
  },
  {
    "id": "other-144",
    "type": "other",
    "uz": "haqida",
    "pron": "хакида",
    "ru": "о, об",
    "visual": "💭",
    "hint": "Послелог после слова"
  },
  {
    "id": "other-145",
    "type": "other",
    "uz": "uchun",
    "pron": "учун",
    "ru": "для, за",
    "visual": "🎯",
    "hint": "Послелог"
  },
  {
    "id": "other-146",
    "type": "other",
    "uz": "emas",
    "pron": "эмас",
    "ru": "не для имен",
    "visual": "❌",
    "hint": "yaxshi emas"
  },
  {
    "id": "other-147",
    "type": "other",
    "uz": "bor",
    "pron": "бор",
    "ru": "есть, имеется",
    "visual": "✅",
    "hint": "Иметь"
  },
  {
    "id": "other-148",
    "type": "other",
    "uz": "yoʻq",
    "pron": "юк",
    "ru": "нет, отсутствует",
    "visual": "🚫",
    "hint": "Нет"
  },
  {
    "id": "other-149",
    "type": "other",
    "uz": "Salom!",
    "pron": "салом",
    "ru": "здравствуйте",
    "visual": "👋",
    "hint": "Приветствие"
  },
  {
    "id": "other-150",
    "type": "other",
    "uz": "Rahmat",
    "pron": "рахмат",
    "ru": "спасибо",
    "visual": "🙏",
    "hint": "Спасибо"
  },
  {
    "id": "other-151",
    "type": "other",
    "uz": "Yaxshimisiz?",
    "pron": "яхшимисиз",
    "ru": "как вы?",
    "visual": "😊",
    "hint": "yaxshi + mi + siz"
  },
  {
    "id": "other-152",
    "type": "other",
    "uz": "Ishlar qanday?",
    "pron": "ишлар кандай",
    "ru": "как дела?",
    "visual": "💬",
    "hint": "Дела как?"
  },
  {
    "id": "other-153",
    "type": "other",
    "uz": "Boʻladi!",
    "pron": "булади",
    "ru": "ладно, договорились",
    "visual": "👌",
    "hint": "Договорились"
  },
  {
    "id": "other-154",
    "type": "other",
    "uz": "Qarang!",
    "pron": "каранг",
    "ru": "смотрите",
    "visual": "👀",
    "hint": "От qaramoq"
  },
  {
    "id": "other-155",
    "type": "other",
    "uz": "oz",
    "pron": "оз",
    "ru": "мало",
    "visual": "🔻",
    "hint": "Мало по количеству"
  },
  {
    "id": "other-156",
    "type": "other",
    "uz": "kam",
    "pron": "кам",
    "ru": "мало, недостаточно",
    "visual": "⚠️",
    "hint": "Недостаточно, нехватка"
  },
  {
    "id": "other-157",
    "type": "other",
    "uz": "koʻp",
    "pron": "куп",
    "ru": "много",
    "visual": "🔺",
    "hint": "Много"
  },
  {
    "id": "other-158",
    "type": "other",
    "uz": "mazali",
    "pron": "мазали",
    "ru": "вкусный, вкусно",
    "visual": "😋",
    "hint": "mazali emas = невкусно"
  },
  {
    "id": "other-159",
    "type": "other",
    "uz": "mazali emas",
    "pron": "мазали эмас",
    "ru": "невкусно, не вкусный",
    "visual": "😕",
    "hint": "Отрицание прилагательного через emas"
  },
  {
    "id": "other-160",
    "type": "other",
    "uz": "qimmat",
    "pron": "киммат",
    "ru": "дорогой, дорого",
    "visual": "💎",
    "hint": "Дорого"
  },
  {
    "id": "other-161",
    "type": "other",
    "uz": "arzon",
    "pron": "арзон",
    "ru": "дешевый, дешево",
    "visual": "🏷️",
    "hint": "Дешево"
  },
  {
    "id": "noun-162",
    "type": "noun",
    "uz": "mol goʻshti",
    "pron": "мол гушти",
    "ru": "говядина",
    "visual": "🥩",
    "hint": "mol + goʻsht + i"
  },
  {
    "id": "noun-163",
    "type": "noun",
    "uz": "goʻsht",
    "pron": "гушт",
    "ru": "мясо",
    "visual": "🥩",
    "hint": "Мясо"
  },
  {
    "id": "noun-164",
    "type": "noun",
    "uz": "dars",
    "pron": "дарс",
    "ru": "урок",
    "visual": "📘",
    "hint": "Урок"
  },
  {
    "id": "other-165",
    "type": "other",
    "uz": "va",
    "pron": "ва",
    "ru": "и",
    "visual": "➕",
    "hint": "Союз и"
  },
  {
    "id": "other-166",
    "type": "other",
    "uz": "darsdan keyin",
    "pron": "дарсдан кейин",
    "ru": "после урока",
    "visual": "📘",
    "hint": "dars + dan + keyin"
  },
  {
    "id": "other-167",
    "type": "other",
    "uz": "darsdan oldin",
    "pron": "дарсдан олдин",
    "ru": "до урока",
    "visual": "📘",
    "hint": "dars + dan + oldin"
  },
  {
    "id": "other-168",
    "type": "other",
    "uz": "oʻtgan hafta",
    "pron": "утган хафта",
    "ru": "прошлая неделя",
    "visual": "📅",
    "hint": "oʻtgan + hafta"
  },
  {
    "id": "other-169",
    "type": "other",
    "uz": "har kuni",
    "pron": "хар куни",
    "ru": "каждый день",
    "visual": "📆",
    "hint": "har + kun + i"
  },
  {
    "id": "noun-170",
    "type": "noun",
    "uz": "kechki ovqat",
    "pron": "кечки овкат",
    "ru": "ужин",
    "visual": "🍽️",
    "hint": "Вечерняя еда"
  },
  {
    "id": "noun-171",
    "type": "noun",
    "uz": "kun",
    "pron": "кун",
    "ru": "день",
    "visual": "☀️",
    "hint": "День"
  },
  {
    "id": "other-172",
    "type": "other",
    "uz": "bugungi kuningiz",
    "pron": "бугунги кунингиз",
    "ru": "ваш сегодняшний день",
    "visual": "📅",
    "hint": "bugungi + kun + ingiz"
  },
  {
    "id": "other-173",
    "type": "other",
    "uz": "ajoyib",
    "pron": "ажойиб",
    "ru": "великолепный, замечательный",
    "visual": "✨",
    "hint": "Великолепно"
  },
  {
    "id": "other-174",
    "type": "other",
    "uz": "ajoyib kun",
    "pron": "ажойиб кун",
    "ru": "великолепный день",
    "visual": "✨",
    "hint": "ajoyib + kun"
  },
  {
    "id": "other-175",
    "type": "pronoun",
    "uz": "mening",
    "pron": "менинг",
    "ru": "мой, моя, мое; у меня",
    "visual": "🧍",
    "hint": "men + ning"
  },
  {
    "id": "other-176",
    "type": "other",
    "uz": "Mening bugungi kunim ajoyib oʻtdi",
    "pron": "менинг бугунги куним ажойиб утди",
    "ru": "мой сегодняшний день прошел великолепно",
    "visual": "✨",
    "hint": "mening + kunim + oʻtdi"
  },
  {
    "id": "other-177",
    "type": "other",
    "uz": "qiyin",
    "pron": "кийин",
    "ru": "сложный, сложно, трудно",
    "visual": "🧗",
    "hint": "Антоним: oson"
  },
  {
    "id": "other-178",
    "type": "other",
    "uz": "oson",
    "pron": "осон",
    "ru": "легкий, легко",
    "visual": "🪶",
    "hint": "Антоним: qiyin"
  },
  {
    "id": "other-179",
    "type": "other",
    "uz": "zerikarli",
    "pron": "зерикарли",
    "ru": "скучный, скучно",
    "visual": "😐",
    "hint": "Противоположно qiziqarli"
  },
  {
    "id": "noun-180",
    "type": "noun",
    "uz": "ishxona",
    "pron": "ишхона",
    "ru": "место работы, рабочее помещение",
    "visual": "🏢",
    "hint": "ish + xona"
  },
  {
    "id": "noun-181",
    "type": "noun",
    "uz": "oshxona",
    "pron": "ошхона",
    "ru": "кухня, столовая",
    "visual": "🍽️",
    "hint": "osh + xona"
  },
  {
    "id": "noun-182",
    "type": "noun",
    "uz": "dorixona",
    "pron": "дорихона",
    "ru": "аптека",
    "visual": "💊",
    "hint": "dori + xona"
  },
  {
    "id": "other-183",
    "type": "other",
    "uz": "tinch",
    "pron": "тинч",
    "ru": "спокойный, спокойно, мирно",
    "visual": "🕊️",
    "hint": "Спокойно"
  },
  {
    "id": "noun-184",
    "type": "noun",
    "uz": "joy",
    "pron": "жой",
    "ru": "место",
    "visual": "📍",
    "hint": "Место"
  },
  {
    "id": "noun-185",
    "type": "noun",
    "uz": "tinchlik",
    "pron": "тинчлик",
    "ru": "мир, спокойствие",
    "visual": "🕊️",
    "hint": "tinch + lik"
  },
  {
    "id": "other-186",
    "type": "other",
    "uz": "hamma joyda",
    "pron": "хамма жойда",
    "ru": "везде, во всех местах",
    "visual": "📍",
    "hint": "hamma + joy + da"
  },
  {
    "id": "other-187",
    "type": "other",
    "uz": "Hamma joyda tinchlik",
    "pron": "хамма жойда тинчлик",
    "ru": "везде спокойно, повсюду мир",
    "visual": "🕊️",
    "hint": "Фраза урока 5"
  },
  {
    "id": "a1-188",
    "type": "other",
    "uz": "ha",
    "pron": "ха",
    "ru": "да",
    "visual": "✅",
    "hint": "A1: согласие"
  },
  {
    "id": "a1-189",
    "type": "other",
    "uz": "iltimos",
    "pron": "илтимос",
    "ru": "пожалуйста",
    "visual": "🙏",
    "hint": "A1: вежливость"
  },
  {
    "id": "a1-190",
    "type": "other",
    "uz": "uzr",
    "pron": "узр",
    "ru": "извините",
    "visual": "🙇",
    "hint": "A1: извинение"
  },
  {
    "id": "a1-191",
    "type": "other",
    "uz": "xayr",
    "pron": "хайр",
    "ru": "до свидания",
    "visual": "👋",
    "hint": "A1: прощание"
  },
  {
    "id": "a1-192",
    "type": "noun",
    "uz": "oila",
    "pron": "оила",
    "ru": "семья",
    "visual": "👨‍👩‍👧",
    "hint": "A1: семья"
  },
  {
    "id": "a1-193",
    "type": "noun",
    "uz": "ota",
    "pron": "ота",
    "ru": "отец",
    "visual": "👨",
    "hint": "A1: семья"
  },
  {
    "id": "a1-194",
    "type": "noun",
    "uz": "ona",
    "pron": "она",
    "ru": "мать",
    "visual": "👩",
    "hint": "A1: семья"
  },
  {
    "id": "a1-195",
    "type": "noun",
    "uz": "aka",
    "pron": "ака",
    "ru": "старший брат",
    "visual": "👨",
    "hint": "A1: семья"
  },
  {
    "id": "a1-196",
    "type": "noun",
    "uz": "uka",
    "pron": "ука",
    "ru": "младший брат",
    "visual": "👦",
    "hint": "A1: семья"
  },
  {
    "id": "a1-197",
    "type": "noun",
    "uz": "opa",
    "pron": "опа",
    "ru": "старшая сестра",
    "visual": "👩",
    "hint": "A1: семья"
  },
  {
    "id": "a1-198",
    "type": "noun",
    "uz": "singil",
    "pron": "сингил",
    "ru": "младшая сестра",
    "visual": "👧",
    "hint": "A1: семья"
  },
  {
    "id": "a1-199",
    "type": "noun",
    "uz": "bola",
    "pron": "бола",
    "ru": "ребенок",
    "visual": "🧒",
    "hint": "A1: люди"
  },
  {
    "id": "a1-200",
    "type": "noun",
    "uz": "erkak",
    "pron": "эркак",
    "ru": "мужчина",
    "visual": "👨",
    "hint": "A1: люди"
  },
  {
    "id": "a1-201",
    "type": "noun",
    "uz": "ayol",
    "pron": "аёл",
    "ru": "женщина",
    "visual": "👩",
    "hint": "A1: люди"
  },
  {
    "id": "a1-202",
    "type": "noun",
    "uz": "doʻst",
    "pron": "дуст",
    "ru": "друг",
    "visual": "🤝",
    "hint": "A1: люди"
  },
  {
    "id": "a1-203",
    "type": "noun",
    "uz": "ism",
    "pron": "исм",
    "ru": "имя",
    "visual": "🏷️",
    "hint": "A1: знакомство"
  },
  {
    "id": "a1-204",
    "type": "noun",
    "uz": "til",
    "pron": "тил",
    "ru": "язык",
    "visual": "🗣️",
    "hint": "A1: язык"
  },
  {
    "id": "a1-205",
    "type": "noun",
    "uz": "shahar",
    "pron": "шахар",
    "ru": "город",
    "visual": "🏙️",
    "hint": "A1: место"
  },
  {
    "id": "a1-206",
    "type": "noun",
    "uz": "mamlakat",
    "pron": "мамлакат",
    "ru": "страна",
    "visual": "🗺️",
    "hint": "A1: место"
  },
  {
    "id": "a1-207",
    "type": "noun",
    "uz": "doʻkon",
    "pron": "дукон",
    "ru": "магазин",
    "visual": "🏪",
    "hint": "A1: место"
  },
  {
    "id": "a1-208",
    "type": "noun",
    "uz": "bozor",
    "pron": "бозор",
    "ru": "рынок",
    "visual": "🛒",
    "hint": "A1: место"
  },
  {
    "id": "a1-209",
    "type": "noun",
    "uz": "mehmonxona",
    "pron": "мехмонхона",
    "ru": "гостиница",
    "visual": "🏨",
    "hint": "A1: место"
  },
  {
    "id": "a1-210",
    "type": "noun",
    "uz": "bekat",
    "pron": "бекат",
    "ru": "остановка",
    "visual": "🚏",
    "hint": "A1: транспорт"
  },
  {
    "id": "a1-211",
    "type": "noun",
    "uz": "aeroport",
    "pron": "аэропорт",
    "ru": "аэропорт",
    "visual": "✈️",
    "hint": "A1: транспорт"
  },
  {
    "id": "a1-212",
    "type": "noun",
    "uz": "suv",
    "pron": "сув",
    "ru": "вода",
    "visual": "💧",
    "hint": "A1: еда и напитки"
  },
  {
    "id": "a1-213",
    "type": "noun",
    "uz": "sut",
    "pron": "сут",
    "ru": "молоко",
    "visual": "🥛",
    "hint": "A1: еда и напитки"
  },
  {
    "id": "a1-214",
    "type": "noun",
    "uz": "olma",
    "pron": "олма",
    "ru": "яблоко",
    "visual": "🍎",
    "hint": "A1: еда"
  },
  {
    "id": "a1-215",
    "type": "noun",
    "uz": "meva",
    "pron": "мева",
    "ru": "фрукт",
    "visual": "🍇",
    "hint": "A1: еда"
  },
  {
    "id": "a1-216",
    "type": "noun",
    "uz": "sabzavot",
    "pron": "сабзавот",
    "ru": "овощ",
    "visual": "🥕",
    "hint": "A1: еда"
  },
  {
    "id": "a1-217",
    "type": "noun",
    "uz": "tuxum",
    "pron": "тухум",
    "ru": "яйцо",
    "visual": "🥚",
    "hint": "A1: еда"
  },
  {
    "id": "a1-218",
    "type": "noun",
    "uz": "guruch",
    "pron": "гуруч",
    "ru": "рис",
    "visual": "🍚",
    "hint": "A1: еда"
  },
  {
    "id": "a1-219",
    "type": "noun",
    "uz": "shoʻrva",
    "pron": "шурва",
    "ru": "суп",
    "visual": "🍲",
    "hint": "A1: еда"
  },
  {
    "id": "a1-220",
    "type": "noun",
    "uz": "tuz",
    "pron": "туз",
    "ru": "соль",
    "visual": "🧂",
    "hint": "A1: еда"
  },
  {
    "id": "a1-221",
    "type": "noun",
    "uz": "shakar",
    "pron": "шакар",
    "ru": "сахар",
    "visual": "🍬",
    "hint": "A1: еда"
  },
  {
    "id": "a1-222",
    "type": "noun",
    "uz": "bosh",
    "pron": "бош",
    "ru": "голова",
    "visual": "🙂",
    "hint": "A1: тело"
  },
  {
    "id": "a1-223",
    "type": "noun",
    "uz": "qoʻl",
    "pron": "кул",
    "ru": "рука",
    "visual": "✋",
    "hint": "A1: тело"
  },
  {
    "id": "a1-224",
    "type": "noun",
    "uz": "oyoq",
    "pron": "оёк",
    "ru": "нога",
    "visual": "🦶",
    "hint": "A1: тело"
  },
  {
    "id": "a1-225",
    "type": "noun",
    "uz": "koʻz",
    "pron": "куз",
    "ru": "глаз",
    "visual": "👁️",
    "hint": "A1: тело"
  },
  {
    "id": "a1-226",
    "type": "noun",
    "uz": "quloq",
    "pron": "кулок",
    "ru": "ухо",
    "visual": "👂",
    "hint": "A1: тело"
  },
  {
    "id": "a1-227",
    "type": "noun",
    "uz": "ogʻiz",
    "pron": "огиз",
    "ru": "рот",
    "visual": "👄",
    "hint": "A1: тело"
  },
  {
    "id": "a1-228",
    "type": "other",
    "uz": "oq",
    "pron": "ок",
    "ru": "белый",
    "visual": "⚪",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-229",
    "type": "other",
    "uz": "qora",
    "pron": "кора",
    "ru": "черный",
    "visual": "⚫",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-230",
    "type": "other",
    "uz": "qizil",
    "pron": "кизил",
    "ru": "красный",
    "visual": "🔴",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-231",
    "type": "other",
    "uz": "koʻk",
    "pron": "кук",
    "ru": "синий, голубой",
    "visual": "🔵",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-232",
    "type": "other",
    "uz": "yashil",
    "pron": "яшил",
    "ru": "зеленый",
    "visual": "🟢",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-233",
    "type": "other",
    "uz": "sariq",
    "pron": "сарик",
    "ru": "желтый",
    "visual": "🟡",
    "hint": "A1: цвет"
  },
  {
    "id": "a1-234",
    "type": "other",
    "uz": "yangi",
    "pron": "янги",
    "ru": "новый",
    "visual": "✨",
    "hint": "A1: качество"
  },
  {
    "id": "a1-235",
    "type": "other",
    "uz": "eski",
    "pron": "эски",
    "ru": "старый",
    "visual": "📦",
    "hint": "A1: качество"
  },
  {
    "id": "a1-236",
    "type": "other",
    "uz": "chiroyli",
    "pron": "чиройли",
    "ru": "красивый",
    "visual": "🌸",
    "hint": "A1: качество"
  },
  {
    "id": "a1-237",
    "type": "other",
    "uz": "issiq",
    "pron": "иссик",
    "ru": "горячий, жарко",
    "visual": "🔥",
    "hint": "A1: качество"
  },
  {
    "id": "a1-238",
    "type": "other",
    "uz": "sovuq",
    "pron": "совук",
    "ru": "холодный, холодно",
    "visual": "❄️",
    "hint": "A1: качество"
  },
  {
    "id": "a1-239",
    "type": "other",
    "uz": "tez",
    "pron": "тез",
    "ru": "быстро, быстрый",
    "visual": "⚡",
    "hint": "A1: наречие"
  },
  {
    "id": "a1-240",
    "type": "other",
    "uz": "sekin",
    "pron": "секин",
    "ru": "медленно, медленный",
    "visual": "⏳",
    "hint": "A1: наречие"
  },
  {
    "id": "a1-241",
    "type": "other",
    "uz": "ertaga",
    "pron": "эртага",
    "ru": "завтра",
    "visual": "📅",
    "hint": "A1: время"
  },
  {
    "id": "a1-242",
    "type": "other",
    "uz": "kechqurun",
    "pron": "кечкурун",
    "ru": "вечером",
    "visual": "🌆",
    "hint": "A1: время"
  },
  {
    "id": "a1-243",
    "type": "noun",
    "uz": "tun",
    "pron": "тун",
    "ru": "ночь",
    "visual": "🌙",
    "hint": "A1: время"
  },
  {
    "id": "a1-244",
    "type": "noun",
    "uz": "hafta",
    "pron": "хафта",
    "ru": "неделя",
    "visual": "📆",
    "hint": "A1: время"
  },
  {
    "id": "a1-245",
    "type": "noun",
    "uz": "oy",
    "pron": "ой",
    "ru": "месяц",
    "visual": "🗓️",
    "hint": "A1: время"
  },
  {
    "id": "a1-246",
    "type": "verb",
    "uz": "bormoq",
    "pron": "бормок",
    "ru": "идти, ехать",
    "visual": "🚶",
    "hint": "A1: движение"
  },
  {
    "id": "a1-247",
    "type": "verb",
    "uz": "kelmoq",
    "pron": "келмок",
    "ru": "приходить",
    "visual": "➡️",
    "hint": "A1: движение"
  },
  {
    "id": "a1-248",
    "type": "verb",
    "uz": "olmoq",
    "pron": "олмок",
    "ru": "брать, получать",
    "visual": "🤲",
    "hint": "A1: действие"
  },
  {
    "id": "a1-249",
    "type": "verb",
    "uz": "aytmoq",
    "pron": "айтмок",
    "ru": "говорить, сказать",
    "visual": "💬",
    "hint": "A1: речь"
  },
  {
    "id": "a1-250",
    "type": "verb",
    "uz": "bilmoq",
    "pron": "билмок",
    "ru": "знать",
    "visual": "🧠",
    "hint": "A1: знание"
  },
  {
    "id": "a1-251",
    "type": "verb",
    "uz": "tushunmoq",
    "pron": "тушунмок",
    "ru": "понимать",
    "visual": "💡",
    "hint": "A1: понимание"
  },
  {
    "id": "a1-252",
    "type": "verb",
    "uz": "gapirmoq",
    "pron": "гапирмок",
    "ru": "разговаривать",
    "visual": "🗨️",
    "hint": "A1: речь"
  },
  {
    "id": "a1-253",
    "type": "verb",
    "uz": "yozmoq",
    "pron": "ёзмок",
    "ru": "писать",
    "visual": "✍️",
    "hint": "A1: учеба"
  },
  {
    "id": "a1-254",
    "type": "verb",
    "uz": "oʻqimoq",
    "pron": "укимок",
    "ru": "читать, учиться",
    "visual": "📖",
    "hint": "A1: учеба"
  },
  {
    "id": "a1-255",
    "type": "verb",
    "uz": "tinglamoq",
    "pron": "тингламок",
    "ru": "слушать",
    "visual": "🎧",
    "hint": "A1: восприятие"
  },
  {
    "id": "a1-256",
    "type": "verb",
    "uz": "ochmoq",
    "pron": "очмок",
    "ru": "открывать",
    "visual": "🔓",
    "hint": "A1: действие"
  },
  {
    "id": "a1-257",
    "type": "verb",
    "uz": "yopmoq",
    "pron": "ёпмок",
    "ru": "закрывать",
    "visual": "🔒",
    "hint": "A1: действие"
  }
];
