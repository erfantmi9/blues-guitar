import type { Finger, StringNumber, TabExercise } from "@bg/shared";

// Fingers: fret 5=1, 7=3, 8=4
const FINGER: Record<number, Finger> = { 5: 1, 7: 3, 8: 4 };

// [string, fret] in playing order
const UP: [StringNumber, number][] = [
  [6, 5], [6, 8], [5, 5], [5, 7], [4, 5], [4, 7], [3, 5], [3, 7], [2, 5], [2, 8], [1, 5], [1, 8],
];
// Back down; the top note 1/8 appears only once
const DOWN: [StringNumber, number][] = [
  [1, 5], [2, 8], [2, 5], [3, 7], [3, 5], [4, 7], [4, 5], [5, 7], [5, 5], [6, 8], [6, 5],
];

const exercise: TabExercise = {
  id: "s3-am-pent-up-down",
  title: "A Minor Pentatonic پوزیشن ۱: بالا و پایین",
  description: "از سیم ۶ تا ۱ بالا برو و برگرد. هر نت یک ضرب. سرعتی که صفر خطا دارد.",
  bpmDefault: 50,
  beatsPerBar: 4,
  bars: 6,
  // Up: beat 0..11, down: beat 12..22, beat 23 rest
  notes: [...UP, ...DOWN].map(([string, fret], beat) => ({
    beat,
    string,
    fret,
    finger: FINGER[fret]!,
    durationBeats: 1,
  })),
};

export default exercise;
