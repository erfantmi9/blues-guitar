import type { TabExercise } from "@bg/shared";

const exercise: TabExercise = {
  id: "s1-string1-frets-1-4",
  title: "سیم ۱: فرت ۱ تا ۴ (انگشت‌های ۱ تا ۴)",
  description: "با پیک پایین‌رو، هر نت یک ضرب. سعی کن هر نت صاف و بدون وزوز دربیاید.",
  bpmDefault: 60,
  beatsPerBar: 4,
  bars: 2,
  notes: [
    // Bar 1
    { beat: 0, string: 1, fret: 1, finger: 1, durationBeats: 1 },
    { beat: 1, string: 1, fret: 2, finger: 2, durationBeats: 1 },
    { beat: 2, string: 1, fret: 3, finger: 3, durationBeats: 1 },
    { beat: 3, string: 1, fret: 4, finger: 4, durationBeats: 1 },
    // Bar 2 (back down)
    { beat: 4, string: 1, fret: 4, finger: 4, durationBeats: 1 },
    { beat: 5, string: 1, fret: 3, finger: 3, durationBeats: 1 },
    { beat: 6, string: 1, fret: 2, finger: 2, durationBeats: 1 },
    { beat: 7, string: 1, fret: 1, finger: 1, durationBeats: 1 },
  ],
};

export default exercise;
