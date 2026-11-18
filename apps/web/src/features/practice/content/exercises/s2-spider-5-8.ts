import type { Finger, StringNumber, TabExercise } from "@bg/shared";

// From string 6 to 1 (k = 0..5); on each string, fingers 1 to 4 on frets 5 to 8 (i = 0..3)
const STRINGS: StringNumber[] = [6, 5, 4, 3, 2, 1];

const exercise: TabExercise = {
  id: "s2-spider-5-8",
  title: "عنکبوت: فرت ۵ تا ۸ روی همه‌ی سیم‌ها",
  description: "هر سیم: انگشت ۱ تا ۴ روی فرت ۵ تا ۸. از سیم ۶ به سیم ۱.",
  bpmDefault: 50,
  beatsPerBar: 4,
  bars: 6,
  notes: STRINGS.flatMap((string, k) =>
    [0, 1, 2, 3].map((i) => ({
      beat: k * 4 + i,
      string,
      fret: 5 + i,
      finger: (i + 1) as Finger,
      durationBeats: 1,
    })),
  ),
};

export default exercise;
