import type { BackingBar, BackingTrack } from "@bg/shared";

// A7 = A C# E G; bass walks A C# E F# G F# E C# (shuffle, 8 notes per bar)
const A7_BAR: BackingBar = {
  chord: { name: "A7", midi: [57, 61, 64, 67] },
  bass: [45, 49, 52, 54, 55, 54, 52, 49],
};

const track: BackingTrack = {
  id: "a7-shuffle-vamp",
  title: "A7 شافل (۴ میزان)",
  description: "یک آکورد `A7` با شافل آرام. با `A Minor Pentatonic` پوزیشن ۱ رویش بزن.",
  bpmDefault: 70,
  bpmMin: 50,
  bpmMax: 120,
  beatsPerBar: 4,
  bars: [A7_BAR, A7_BAR, A7_BAR, A7_BAR],
};

export default track;
