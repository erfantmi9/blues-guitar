import type { Finger, StringNumber, TabExercise, TabNote } from "@bg/shared";

// Per bar: one string and its two frets in A minor pentatonic position 1
const BARS: [StringNumber, number, number][] = [
  [6, 5, 8],
  [5, 5, 7],
  [4, 5, 7],
  [6, 5, 8],
];

// Second fret: 8 → pinky (4), 7 → ring finger (3)
const secondFinger = (fret: number): Finger => (fret === 8 ? 4 : 3);

/**
 * Shuffle "long-short" on every beat: the first note lasts 2/3 of the beat, the second 1/3.
 * Beats are written as exact fractions of thirds (4b + j + 2/3), so they sit on triplet ticks
 * (subdivisions = 3) and validation/subdivision detection see whole numbers of thirds.
 */
function shufflePairs(): TabNote[] {
  const notes: TabNote[] = [];
  BARS.forEach(([string, low, high], b) => {
    for (let j = 0; j < 4; j++) {
      const beat = 4 * b + j;
      notes.push({ beat, string, fret: low, finger: 1, durationBeats: 2 / 3 });
      notes.push({ beat: beat + 2 / 3, string, fret: high, finger: secondFinger(high), durationBeats: 1 / 3 });
    }
  });
  return notes;
}

const exercise: TabExercise = {
  id: "s4-shuffle-pairs",
  title: "شافل: دو نت روی هر ضرب",
  description: "بلند-کوتاه. پایین‌رو روی نت بلند، بالا‌رو روی نت کوتاه. نت‌ها مساوی نباشند.",
  bpmDefault: 60,
  beatsPerBar: 4,
  bars: 4,
  notes: shufflePairs(), // 32 notes
};

export default exercise;
