import type { TabExercise } from "@bg/shared";

// Open strings have no finger, so `finger` is not set
const exercise: TabExercise = {
  id: "s1-open-strings",
  title: "سیم‌های باز: ۶ تا ۱",
  description: "روی هر سیم باز یک بار پیک پایین‌رو. هدف: صدای واضح و بدون درگیر شدن سیم‌های دیگر.",
  bpmDefault: 50,
  beatsPerBar: 6,
  bars: 1,
  notes: [
    { beat: 0, string: 6, fret: 0, durationBeats: 1 },
    { beat: 1, string: 5, fret: 0, durationBeats: 1 },
    { beat: 2, string: 4, fret: 0, durationBeats: 1 },
    { beat: 3, string: 3, fret: 0, durationBeats: 1 },
    { beat: 4, string: 2, fret: 0, durationBeats: 1 },
    { beat: 5, string: 1, fret: 0, durationBeats: 1 },
  ],
};

export default exercise;
