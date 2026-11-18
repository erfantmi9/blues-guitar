import type { Finger, TabExercise } from "@bg/shared";

// Fingers: fret 5=1, 6=2, 7=3, 8=4
const finger = (fret: number) => (fret - 4) as Finger;

const BAR_1 = [5, 6, 7, 8, 5, 6, 7, 8];
const BAR_2 = [8, 7, 6, 5, 8, 7, 6, 5];

const exercise: TabExercise = {
  id: "s2-alt-picking",
  title: "پیک رفت‌وبرگشت: سیم ۱ فرت ۵ تا ۸",
  description: "پایین‌رو روی ضرب، بالا‌رو روی «و». دست راست همیشه در حرکت است.",
  bpmDefault: 50,
  beatsPerBar: 4,
  bars: 2,
  // Eighth notes (durationBeats 0.5) → subdivisions = 2
  notes: [...BAR_1, ...BAR_2].map((fret, i) => ({
    beat: i * 0.5,
    string: 1,
    fret,
    finger: finger(fret),
    durationBeats: 0.5,
  })),
};

export default exercise;
