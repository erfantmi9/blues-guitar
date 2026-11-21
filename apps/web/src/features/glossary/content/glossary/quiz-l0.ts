import type { QuizQuestion } from "@bg/shared";

// Level 0 quiz. correctIndex = the correct option as given (options are shuffled on screen).
const quiz: QuizQuestion[] = [
  {
    id: "l0-q1",
    level: 0,
    prompt: "کدام قطعه ارتعاش سیم فلزی را به سیگنال برق تبدیل می‌کند؟",
    options: ["پیکاپ", "شیطانک", "پل", "پیک‌گارد"],
    correctIndex: 0,
    explanation: "پیکاپ آهنربایی زیر سیم‌هاست که ارتعاش را به برق تبدیل می‌کند.",
  },
  {
    id: "l0-q2",
    level: 0,
    prompt: "سیم را با گوشی سفت می‌کنی. صدا چه می‌شود؟",
    options: ["زیرتر", "بم‌تر", "بلندتر", "تغییری نمی‌کند"],
    correctIndex: 0,
    explanation: "سیم سفت‌تر زیرتر می‌شود.",
  },
  {
    id: "l0-q3",
    level: 0,
    prompt: "دکمه‌ی `Gain` روی آمپ چه می‌کند؟",
    options: ["میزان اعوجاج صدا را تنظیم می‌کند", "فقط بلندی را زیاد می‌کند", "بم صدا را زیاد می‌کند", "کوک سیم‌ها را عوض می‌کند"],
    correctIndex: 0,
    explanation: "گین بین صدای تمیز و کثیف است و بلندی با ولوم تنظیم می‌شود.",
  },
  {
    id: "l0-q4",
    level: 0,
    prompt: "در `Strat`، اگر اهرم سوییچ پیکاپ را کاملاً به سمت دسته ببری، کدام پیکاپ فعال است؟",
    options: ["گردن", "بریج", "وسط", "هر سه"],
    correctIndex: 0,
    explanation: "نزدیک دسته، پیکاپ گردن با صدای گرم.",
  },
  {
    id: "l0-q5",
    level: 0,
    prompt: "نقطه‌های روی دسته (`Fret marker`) در کدام فرت‌هاست؟",
    options: ["۳، ۵، ۷، ۹ و ۱۲", "۱، ۲، ۳، ۴", "۲، ۴، ۶، ۸", "۵، ۱۰، ۱۵"],
    correctIndex: 0,
    explanation: "۳، ۵، ۷، ۹ و دو نقطه روی ۱۲.",
  },
];

export default quiz;
