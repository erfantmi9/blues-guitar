import type { QuizQuestion } from "@bg/shared";

// Level 2 quiz. correctIndex = the correct option as given (options are shuffled on screen).
const quiz: QuizQuestion[] = [
  {
    id: "l2-q1",
    level: 2,
    prompt: "روی گیتار یک فرت چند نیم‌پرده است؟",
    options: ["۱", "۲", "۱۲", "نصف"],
    correctIndex: 0,
    explanation: "هر فرت یک نیم‌پرده است.",
  },
  {
    id: "l2-q2",
    level: 2,
    prompt: "یک پرده (`Whole tone`) چند فرت است؟",
    options: ["۲", "۱", "۳", "۴"],
    correctIndex: 0,
    explanation: "پرده دو نیم‌پرده است و هر نیم‌پرده یک فرت، پس یک پرده دو فرت است.",
  },
  {
    id: "l2-q3",
    level: 2,
    prompt: "بین کدام دو نت نت میانی (دیز) وجود ندارد؟",
    options: ["`E` و `F`", "`C` و `D`", "`F` و `G`", "`A` و `B`"],
    correctIndex: 0,
    explanation: "بین `E` و `F` و بین `B` و `C` نت میانی نیست.",
  },
  {
    id: "l2-q4",
    level: 2,
    prompt: "سیم ۱ باز نت `E` است. فرت ۱۲ همین سیم چیست؟",
    options: ["همان `E`، یک اکتاو بالاتر", "`F`", "`B`", "`A`"],
    correctIndex: 0,
    explanation: "فرت ۱۲ دقیقاً وسط طول سیم است و همان نت سیم باز را یک اکتاو بالاتر می‌دهد.",
  },
  {
    id: "l2-q5",
    level: 2,
    prompt: "رابطه‌ی `C♯` و `D♭` چیست؟",
    options: ["یک صدا با دو اسم", "دو نت متفاوت", "یک پرده فاصله دارند", "`C♯` بم‌تر است"],
    correctIndex: 0,
    explanation: "یک فرت بالاتر از `C` همان یک فرت پایین‌تر از `D` است.",
  },
];

export default quiz;
