import type { GlossaryTerm } from "@bg/shared";

// Level 2: notes and intervals. Order = teaching order.

/** String 1, frets 0 to 12 */
const STRING1_CHROMATIC = Array.from({ length: 13 }, (_, fret) => ({ string: 1 as const, fret }));

const terms: GlossaryTerm[] = [
  {
    id: "pitch",
    level: 2,
    term: "Pitch",
    fa: "زیری و بمی",
    definition: "اینکه صدا زیر است یا بم. سیم نازک زیر و سیم ضخیم بم است.",
    meetAt: { note: "پایه‌ی همه‌ی درس‌ها" },
    prerequisites: ["string"],
    related: ["tuning-peg"],
    audio: [
      { string: 6, fret: 0 },
      { string: 1, fret: 0 },
    ],
  },
  {
    id: "note",
    level: 2,
    term: "Note",
    fa: "نت",
    definition: "یک صدای مشخص با اسم، مثل `A` یا `C`.",
    meetAt: { lessonId: "s3-l1" },
    prerequisites: ["pitch"],
    related: ["string-names"],
  },
  {
    id: "musical-alphabet",
    level: 2,
    term: "Musical alphabet",
    fa: "الفبای موسیقی",
    definition:
      "نت‌ها با هفت حرف `A B C D E F G` اسم‌گذاری می‌شوند و بعد از `G` دوباره `A` می‌آید. بین بعضی از آن‌ها نت‌های میانی هم هست.",
    meetAt: { lessonId: "s3-l1" },
    prerequisites: ["note"],
  },
  {
    id: "sharp",
    level: 2,
    term: "Sharp (♯)",
    fa: "دیز",
    definition: "یک نیم‌پرده بالاتر. مثلاً `F♯` یعنی یک فرت بالاتر از `F`.",
    meetAt: { note: "در `Backing Track` نت‌های `C♯` و `F♯` هست" },
    prerequisites: ["musical-alphabet"],
    fretboard: {
      notes: [
        { string: 1, fret: 1 },
        { string: 1, fret: 2 },
      ],
    },
    audio: [
      { string: 1, fret: 1 },
      { string: 1, fret: 2 },
    ],
  },
  {
    id: "flat",
    level: 2,
    term: "Flat (♭)",
    fa: "بمل",
    definition: "یک نیم‌پرده پایین‌تر. مثلاً `D♭` یعنی یک فرت پایین‌تر از `D`. `C♯` و `D♭` یک صدا با دو اسم‌اند.",
    meetAt: { note: "به‌زودی در مراحل بعد" },
    prerequisites: ["sharp"],
  },
  {
    id: "chromatic-scale",
    level: 2,
    term: "Chromatic scale",
    fa: "گام کروماتیک",
    definition: "۱۲ نت پشت‌سرهم: `C C♯ D D♯ E F F♯ G G♯ A A♯ B`. روی گیتار هر فرت یک نت است.",
    meetAt: { stage: 5 },
    prerequisites: ["sharp", "fret"],
    related: ["no-sharp-pairs"],
    fretboard: { notes: STRING1_CHROMATIC },
    audio: STRING1_CHROMATIC,
  },
  {
    id: "semitone",
    level: 2,
    term: "Semitone",
    fa: "نیم‌پرده",
    definition: "کوچک‌ترین فاصله‌ی بین دو نت. روی گیتار برابر یک فرت.",
    meetAt: { stage: 5 },
    prerequisites: ["fret", "note"],
    fretboard: {
      notes: [
        { string: 1, fret: 0 },
        { string: 1, fret: 1 },
      ],
    },
    audio: [
      { string: 1, fret: 0 },
      { string: 1, fret: 1 },
    ],
  },
  {
    id: "whole-tone",
    level: 2,
    term: "Whole tone",
    fa: "پرده",
    definition: "دو نیم‌پرده، یعنی دو فرت.",
    meetAt: { stage: 5 },
    prerequisites: ["semitone"],
    fretboard: {
      notes: [
        { string: 1, fret: 0 },
        { string: 1, fret: 2 },
      ],
    },
    audio: [
      { string: 1, fret: 0 },
      { string: 1, fret: 2 },
    ],
  },
  {
    id: "no-sharp-pairs",
    level: 2,
    term: "E–F and B–C",
    fa: "استثنای `E–F` و `B–C`",
    definition: "بین `E` و `F` و بین `B` و `C` نت میانی نیست. این دو جفت فقط یک نیم‌پرده فاصله دارند.",
    meetAt: { note: "پایه‌ی خواندن نت روی دسته" },
    prerequisites: ["semitone", "musical-alphabet"],
    related: ["chromatic-scale"],
    fretboard: {
      notes: [
        { string: 1, fret: 0 },
        { string: 1, fret: 1 },
        { string: 2, fret: 0 },
        { string: 2, fret: 1 },
      ],
    },
    audio: [
      { string: 1, fret: 0 },
      { string: 1, fret: 1 },
      { string: 2, fret: 0 },
      { string: 2, fret: 1 },
    ],
  },
  {
    id: "interval",
    level: 2,
    term: "Interval",
    fa: "فاصله",
    definition: "اندازه‌ی فاصله‌ی دو نت، مثلاً یک نیم‌پرده یا یک پرده.",
    meetAt: { stage: 5 },
    prerequisites: ["semitone", "whole-tone"],
    related: ["octave"],
  },
  {
    id: "octave",
    level: 2,
    term: "Octave",
    fa: "اکتاو",
    definition: "همان نت با صدای زیرتر یا بم‌تر. ۱۲ فرت بالاتر از هر سیم باز، همان نت سیم باز است.",
    meetAt: { lessonId: "s3-l1" },
    prerequisites: ["chromatic-scale"],
    related: ["interval", "fret-marker"],
    fretboard: {
      notes: [
        { string: 5, fret: 0 },
        { string: 5, fret: 12 },
      ],
    },
    audio: [
      { string: 5, fret: 0 },
      { string: 5, fret: 12 },
    ],
  },
];

export default terms;
