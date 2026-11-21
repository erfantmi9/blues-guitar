import type { Article, HighlightedNote } from "@bg/shared";

// String 1 (high E), open to fret 12; names are shown by the fretboard itself, roots (A) in red
const STRING_1: HighlightedNote[] = Array.from({ length: 13 }, (_, fret) => ({
  string: 1,
  fret,
  ...(fret === 5 ? { variant: "root" as const } : {}),
}));

const article: Article = {
  id: "notes-and-frets",
  title: "نت‌ها و فرت‌ها",
  summary: "۱۲ نت، هر فرت یک نیم‌پرده، و اینکه چرا لازم نیست همه‌ی نت‌های دسته را حفظ کنی.",
  sections: [
    {
      id: "twelve-notes",
      title: "۱۲ نت",
      blocks: [
        {
          type: "paragraph",
          text: "موسیقی غربی ۱۲ نت دارد: `C`، `C#`، `D`، `D#`، `E`، `F`، `F#`، `G`، `G#`، `A`، `A#`، `B` و بعد دوباره `C`.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "استثنای مهم",
          text: "بین `E` و `F` و بین `B` و `C` دیاز (`#`) ندارد.",
        },
      ],
    },
    {
      id: "fret-is-semitone",
      title: "هر فرت یک نیم‌پرده",
      blocks: [
        {
          type: "paragraph",
          text: "هر فرت یک نیم‌پرده است. پس از هر نت، یک فرت بالاتر نت بعدی در همین فهرست است. روی سیم ۱ باز (`E`): فرت ۱ = `F`، فرت ۲ = `F#`، فرت ۳ = `G`، فرت ۴ = `G#`.",
        },
        {
          type: "fretboard",
          highlightedNotes: STRING_1,
          showNoteNames: true,
          caption: "نت‌های سیم ۱ از سیم باز تا فرت ۱۲. نقطه‌ی قرمز `A` است.",
        },
        {
          type: "table",
          caption: "سیم ۱",
          columns: ["فرت", "نت"],
          rows: [
            ["0 (باز)", "`E`"],
            ["1", "`F`"],
            ["2", "`F#`"],
            ["3", "`G`"],
            ["4", "`G#`"],
            ["5", "`A`"],
            ["6", "`A#`"],
            ["7", "`B`"],
            ["8", "`C`"],
            ["9", "`C#`"],
            ["10", "`D`"],
            ["11", "`D#`"],
            ["12", "`E`"],
          ],
        },
      ],
    },
    {
      id: "open-strings",
      title: "سیم‌های باز، فرت ۵ و فرت ۱۲",
      blocks: [
        {
          type: "paragraph",
          text: "سیم‌های باز از ضخیم به نازک `E A D G B E` هستند. فرت ۵ هر سیم همان نت سیم باز بعدی است. استثنا: روی سیم `G`، فرت ۴ برابر سیم `B` باز است.",
        },
        {
          type: "paragraph",
          text: "فرت ۱۲ همان نت سیم باز است، یک اکتاو بالاتر.",
        },
      ],
    },
    {
      id: "takeaway",
      title: "نتیجه",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "لازم نیست همه را حفظ کنی",
          text: "فقط جای `A` را بلد باش: سیم ۶ فرت ۵، سیم ۱ فرت ۵ و سیم ۴ فرت ۷.",
        },
      ],
    },
  ],
};

export default article;
