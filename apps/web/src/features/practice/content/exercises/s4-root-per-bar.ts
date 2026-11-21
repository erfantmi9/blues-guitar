import type { TabExercise } from "@bg/shared";

// One root (A) per bar, held for the whole bar
const exercise: TabExercise = {
  id: "s4-root-per-bar",
  title: "یک نت در هر میزان: ریشه‌ها",
  description: "هر نت چهار ضرب نگه داشته می‌شود. فقط روی ضرب ۱ بزن و گوش بده.",
  bpmDefault: 60,
  beatsPerBar: 4,
  bars: 4,
  notes: [
    { beat: 0, string: 6, fret: 5, finger: 1, durationBeats: 4 },
    { beat: 4, string: 4, fret: 7, finger: 3, durationBeats: 4 },
    { beat: 8, string: 1, fret: 5, finger: 1, durationBeats: 4 },
    { beat: 12, string: 6, fret: 5, finger: 1, durationBeats: 4 },
  ],
};

export default exercise;
