import type { Article } from "@bg/shared";

const article: Article = {
  id: "beat-and-bar",
  title: "ضرب و میزان",
  summary: "ضرب، `BPM`، میزان و حس شافل، با شمارش یک میزان.",
  sections: [
    {
      id: "beat-and-bpm",
      title: "ضرب و `BPM`",
      blocks: [
        {
          type: "paragraph",
          text: "ضرب مثل ضربان قلب است. `BPM` می‌گوید در یک دقیقه چند ضرب داریم. ۶۰ `BPM` یعنی یک ضرب در هر ثانیه.",
        },
      ],
    },
    {
      id: "bar",
      title: "میزان",
      blocks: [
        {
          type: "paragraph",
          text: "میزان یعنی چند ضرب پشت سر هم که از ۱ شروع می‌شوند. ضرب ۱ سنگین‌ترین است. `4/4` یعنی چهار ضرب در هر میزان؛ رایج‌ترین حالت.",
        },
      ],
    },
    {
      id: "shuffle",
      title: "شافل",
      blocks: [
        {
          type: "paragraph",
          text: "هر ضرب را سه قسمت کن و فقط قسمت اول و سوم را بزن. شمارش: `1-trip-let`.",
        },
        {
          type: "pre",
          text: [
            "Count: 1 trip let | 2 trip let | 3 trip let | 4 trip let",
            "Play:  X  .    X  | X  .    X  | X  .    X  | X  .    X",
            "Foot:  v          | v          | v          | v",
          ].join("\n"),
          caption: "یک میزان شافل: `X` یعنی بزن، `.` یعنی نزن، `v` یعنی پا.",
        },
      ],
    },
    {
      id: "foot",
      title: "پا زدن",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "پا همیشه روی ضرب‌هاست و هرگز نمی‌ایستد.",
        },
      ],
    },
  ],
};

export default article;
