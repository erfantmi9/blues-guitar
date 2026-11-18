import type { TabExercise } from "@bg/shared";

// All three are A (root); no open strings
const exercise: TabExercise = {
  id: "s3-am-pent-roots",
  title: "پیدا کردن ریشه‌ها: A روی سه سیم",
  description: "هر سه نت همان A هستند. گوش بده چطور فرق می‌کنند.",
  bpmDefault: 50,
  beatsPerBar: 4,
  bars: 2,
  notes: [
    // Bar 1
    { beat: 0, string: 6, fret: 5, finger: 1, durationBeats: 1 },
    { beat: 1, string: 4, fret: 7, finger: 3, durationBeats: 1 },
    { beat: 2, string: 1, fret: 5, finger: 1, durationBeats: 1 },
    { beat: 3, string: 4, fret: 7, finger: 3, durationBeats: 1 },
    // Bar 2 (beat 7 rest)
    { beat: 4, string: 1, fret: 5, finger: 1, durationBeats: 1 },
    { beat: 5, string: 4, fret: 7, finger: 3, durationBeats: 1 },
    { beat: 6, string: 6, fret: 5, finger: 1, durationBeats: 1 },
  ],
};

export default exercise;
