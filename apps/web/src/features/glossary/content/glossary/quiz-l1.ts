import type { QuizQuestion } from "@bg/shared";

// Level 1 quiz. correctIndex = the correct option as given (options are shuffled on screen).
const quiz: QuizQuestion[] = [
  {
    id: "l1-q1",
    level: 1,
    prompt: "سیم شماره‌ی ۱ کدام است؟",
    options: ["نازک‌ترین", "ضخیم‌ترین", "بالاترین از دید تو", "همیشه `E` بم"],
    correctIndex: 0,
    explanation: "شماره‌گذاری از نازک‌ترین سیم است.",
  },
  {
    id: "l1-q2",
    level: 1,
    prompt: "اسم سیم‌ها از ضخیم به نازک؟",
    options: ["`E A D G B E`", "`E B G D A E`", "`A D G B E A`", "`E A D G C E`"],
    correctIndex: 0,
    explanation: "حفظی `Eddie Ate Dynamite, Good Bye Eddie`.",
  },
  {
    id: "l1-q3",
    level: 1,
    prompt: "انگشت حلقه چه شماره‌ای است؟",
    options: ["۳", "۱", "۲", "۴"],
    correctIndex: 0,
    explanation: "۱ اشاره، ۲ وسط، ۳ حلقه، ۴ کوچک.",
  },
  {
    id: "l1-q4",
    level: 1,
    prompt: "معمولاً وزوز فرت از چیست؟",
    options: ["انگشت از فرت دور است یا کم فشار می‌دهد", "پیک کهنه است", "آمپ خراب است", "سیم زیادی نازک است"],
    correctIndex: 0,
    explanation: "انگشت باید با نوک و درست پشت فرت باشد.",
  },
  {
    id: "l1-q5",
    level: 1,
    prompt: "در پیک رفت‌وبرگشت، روی ضرب و روی «و» (نیم‌ضرب) چه می‌زنی؟",
    options: ["پایین‌رو روی ضرب و بالا‌رو روی «و»", "همیشه پایین‌رو", "بالا‌رو روی ضرب و پایین‌رو روی «و»", "هر دو بالا‌رو"],
    correctIndex: 0,
    explanation: "دست راست همیشه در حرکت است.",
  },
];

export default quiz;
