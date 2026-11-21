import type { Lesson } from "@bg/shared";

const lesson: Lesson = {
  id: "s4-l1",
  stageId: "stage-4",
  session: 4,
  title: "ریتم و `Backing Track`",
  goal: "بتوانی ضرب را با پا بگیری، حس شافل را بشناسی، و روی `Backing Track` با `Minor Pentatonic` بزنی، از ریشه شروع کنی و روی ریشه تمام کنی.",
  duration: { min: 35, max: 40 },

  sections: [
    {
      id: "review-warmup",
      title: "مرور و گرم کردن",
      duration: 4,
      blocks: [
        {
          type: "paragraph",
          text: "تیون کن. یک دور بالا و پایین `Minor Pentatonic` را در ۵۰ `BPM` بزن (تمرین «`s3-am-pent-up-down`»).",
        },
      ],
    },

    {
      id: "beat-and-shuffle",
      title: "ضرب و شافل",
      duration: 6,
      blocks: [
        {
          type: "paragraph",
          text: "ضرب (`Beat`) تیک‌تاک ثابت موسیقی است؛ همان چیزی که با پایت می‌گیری. در بلوز هر ضرب را به سه قسمت تقسیم می‌کنیم و فقط قسمت اول و سوم را می‌زنیم: «بلند-کوتاه». به این حس شافل (`Shuffle`) می‌گویند. شمارش: `1-trip-let 2-trip-let 3-trip-let 4-trip-let`. روی «`1`» و «`let`» می‌زنی، روی «`trip`» نمی‌زنی. با صدای بلند بشمار و همزمان با پا ضرب بگیر.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "پا روی ضرب‌ها (1، 2، 3، 4) می‌خورد، نه روی نت‌ها. پایت هیچ‌وقت نایستد.",
        },
      ],
    },

    {
      id: "just-listen",
      title: "فقط گوش بده",
      duration: 4,
      blocks: [
        {
          type: "paragraph",
          text: "`Backing Track` را در ۶۰ `BPM` پخش کن و گیتار را نزن. فقط پا بزن و ضرب‌ها را بشمار. ضرب ۱ هر میزان را پیدا کن: صدای بم‌تر طبل (`Kick`) و شروع نت باس. ۴ میزان را بشمار و دوباره از ۱ شروع کن. صدای `Snare` روی ضرب ۲ و ۴ است.",
        },
        { type: "link", to: "/backing", text: "`Backing Track` را باز کن" },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "آکورد این `Backing Track` `A7` است. گاهی نت‌های اسکیل با آکورد کمی «تلخ» به گوش می‌رسند. این طبیعی است و همان طعم بلوز است.",
        },
      ],
    },

    {
      id: "one-note-per-bar",
      title: "یک نت در هر میزان",
      duration: 6,
      blocks: [
        {
          type: "paragraph",
          text: "تمرین «`s4-root-per-bar`» را در `Tab` متحرک ببین و بزن: ریشه (`A`) را فقط روی ضرب ۱ هر میزان بزن و بگذار تا آخر میزان بخواند. بعد همین را روی `Backing Track` بزن (۶۰ `BPM`). در این تمرین هدف زدن نت زیاد نیست؛ هدف «جا انداختن نت روی ضرب ۱» است.",
        },
        { type: "link", to: "/backing", text: "`Backing Track` را باز کن" },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "ریشه روی ضرب ۱ یعنی صدا «خانه» را پیدا کرده است.",
        },
        {
          type: "link",
          to: "/practice?exercise=s4-root-per-bar",
          text: "این تمرین را متحرک ببین",
        },
      ],
    },

    {
      id: "shuffle-on-scale",
      title: "شافل روی اسکیل",
      duration: 8,
      blocks: [
        {
          type: "paragraph",
          text: "تمرین «`s4-shuffle-pairs`» را بزن: روی هر ضرب دو نت، بلند-کوتاه. پیک: پایین‌رو روی نت بلند، بالا‌رو روی نت کوتاه. اول در ۶۰ `BPM` و بدون خطا. دو نت پشت‌سرهم باید «بلند-کوتاه» باشند، نه دو نت مساوی.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "اگر نت‌ها مساوی شدند، دوباره بلند بشمار: `1-trip-let`.",
        },
        {
          type: "link",
          to: "/practice?exercise=s4-shuffle-pairs",
          text: "این تمرین را متحرک ببین",
        },
      ],
    },

    {
      id: "free-play",
      title: "آزاد روی `Backing Track`",
      duration: 10,
      blocks: [
        {
          type: "paragraph",
          text: "`Backing Track` را روی ۷۰ `BPM` (یا هر چه راحت‌تری) بگذار و با `Minor Pentatonic` پوزیشن ۱ بزن.",
        },
        {
          type: "steps",
          title: "قوانین",
          ordered: true,
          items: [
            "از ریشه شروع کن.",
            "در میزان‌های ۱ و ۲ بزن و در ۳ و ۴ ساکت بمان و فقط گوش بده.",
            "روی ریشه (سیم ۶ فرت ۵، یا سیم ۴ فرت ۷، یا سیم ۱ فرت ۵) تمام کن.",
            "کمتر بزن؛ سکوت هم بخشی از موسیقی است.",
          ],
        },
        { type: "link", to: "/backing", text: "`Backing Track` را باز کن" },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "بلوز یعنی گفتگو. وقتی ساکتی، `Backing Track` «جواب» می‌دهد.",
        },
      ],
    },
  ],

  completion: {
    criteria: [
      { id: "feel-the-beat", text: "با پا ضرب را می‌گیرم و ضرب ۱ هر میزان `Backing Track` را تشخیص می‌دهم." },
      { id: "shuffle-clean", text: "تمرین شافل را ۴ میزان در ۶۰ `BPM` بدون توقف می‌زنم." },
      {
        id: "free-play-roots",
        text: "روی `Backing Track` ۴ میزان آزاد می‌زنم: از ریشه شروع می‌کنم، روی ریشه تمام می‌کنم و حداقل یک میزان ساکت می‌مانم.",
      },
    ],
    minRequired: 2,
    note: "۲ از ۳ کافی است.",
  },

  report: {
    questions: [
      { id: "foot-beat", question: "توانستی با پا ضرب را نگه داری یا گم شدی؟" },
      { id: "shuffle-feel", question: "حس بلند-کوتاه شافل را گرفتی یا نت‌ها مساوی شدند؟" },
      { id: "ended-on-root", question: "در بخش آزاد روی ریشه تمام کردی؟" },
      {
        id: "bpm-and-sound",
        question: "بالاترین `BPM` راحت و صدای `Backing Track` (باس شنیده می‌شد؟ بیش از حد بلند یا خشن بود؟) چطور بود؟",
      },
    ],
  },
};

export default lesson;
