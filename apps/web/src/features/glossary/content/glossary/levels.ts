import type { GlossaryLevel } from "@bg/shared";

// The glossary path, beginner → advanced. Levels 3 to 6 have no terms yet.
const levels: GlossaryLevel[] = [
  { id: 0, title: "آشنایی با ساز و تجهیزات", summary: "قطعه‌های گیتار الکتریک و آمپ و کار هر کدام", available: true },
  { id: 1, title: "سیم‌ها، کوک و دست‌ها", summary: "اسم و شماره‌ی سیم‌ها، کوک کردن، پیک و حالت دست‌ها", available: true },
  { id: 2, title: "نت‌ها و فاصله‌ها", summary: "نت چیست، نیم‌پرده و پرده، دیز و بمل، اکتاو", available: true },
  { id: 3, title: "خوندن `Tab`", summary: "به‌زودی", available: false },
  { id: 4, title: "ریتم", summary: "به‌زودی", available: false },
  { id: 5, title: "اسکیل و ریشه", summary: "به‌زودی", available: false },
  { id: 6, title: "تکنیک‌های بلوز", summary: "به‌زودی", available: false },
];

export default levels;
