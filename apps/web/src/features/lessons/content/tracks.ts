import type { Track } from "@bg/shared";

/** The three tracks, in display order. They advance side by side; recommendedOrder (order.ts) interleaves them. */
export const tracks: Track[] = [
  { id: "foundation", title: "پایه", summary: "ساز، دست‌ها، نت‌ها و زمان‌بندی؛ زیربنای هر دو مسیر دیگر." },
  { id: "solo", title: "سولو", summary: "از پنتاتونیک تا اولین سولوی کامل بلوز." },
  { id: "chords", title: "آکورد و ریتم", summary: "از آکوردهای باز تا ریتم‌ها و آکوردهای بلوز." },
];
