import type { HighlightedNote, Lesson } from "@bg/shared";

// A minor pentatonic, position 1: two notes per string; the finger number is the label
const POSITION_1: HighlightedNote[] = [
  { string: 6, fret: 5, label: "۱", variant: "root" },
  { string: 6, fret: 8, label: "۴" },
  { string: 5, fret: 5, label: "۱" },
  { string: 5, fret: 7, label: "۳" },
  { string: 4, fret: 5, label: "۱" },
  { string: 4, fret: 7, label: "۳", variant: "root" },
  { string: 3, fret: 5, label: "۱" },
  { string: 3, fret: 7, label: "۳" },
  { string: 2, fret: 5, label: "۱" },
  { string: 2, fret: 8, label: "۴" },
  { string: 1, fret: 5, label: "۱", variant: "root" },
  { string: 1, fret: 8, label: "۴" },
];

const lesson: Lesson = {
  id: "s3-l1",
  stageId: "stage-3",
  session: 3,
  title: "`Minor Pentatonic` پوزیشن ۱ (`A`)",
  goal: "شکل اسکیل `Minor Pentatonic` را روی دسته حفظ کنی، بالا و پایین بزنی و نت اصلی (`A`) را پیدا کنی.",
  duration: { min: 35, max: 40 },

  sections: [
    {
      id: "review-warmup",
      title: "مرور و گرم کردن",
      duration: 5,
      blocks: [
        {
          type: "paragraph",
          text: "تیون کن و یک دور عنکبوت ۵ تا ۸ در ۵۰ `BPM` بزن (تمرین «`s2-spider-5-8`»).",
        },
        {
          type: "link",
          to: "/practice?exercise=s2-spider-5-8",
          text: "این تمرین را متحرک ببین",
        },
      ],
    },

    {
      id: "what-is-a-scale",
      title: "اسکیل چیه؟",
      duration: 5,
      blocks: [
        {
          type: "paragraph",
          text: "اسکیل یک «مجموعه‌ی نت‌های هم‌خانواده» است. `Minor Pentatonic` فقط ۵ نت دارد (`penta` = پنج) و در `A` این نت‌هاست: `A C D E G`. همین ۵ نت پایه‌ی بخش بزرگی از سولوهای بلوز و بلوز-راک است، از جمله سبک‌هایی که دوست داری (`BB King`، `Beth Hart`، `Gary Moore`).",
        },
        {
          type: "paragraph",
          text: "نت `A` «خانه» است و به آن `Root` (ریشه) می‌گوییم. هر جا ریشه را پیدا کنی، یعنی به خانه رسیده‌ای و صدا «جا می‌افتد». همین‌طور هر لیک یا سولو معمولاً روی ریشه تمام می‌شود.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "حفظ اسم نت‌ها لازم نیست. فعلاً فقط شکل و جای ریشه را حفظ کن.",
        },
      ],
    },

    {
      id: "position-1-shape",
      title: "شکل پوزیشن ۱",
      duration: 8,
      blocks: [
        {
          type: "fretboard",
          highlightedNotes: POSITION_1,
          caption: "نقطه‌های قرمز ریشه (`A`) هستند: سیم ۶ فرت ۵، سیم ۴ فرت ۷، سیم ۱ فرت ۵. عدد هر نقطه شماره‌ی انگشت است.",
        },
        {
          type: "table",
          columns: ["سیم", "نت‌ها"],
          rows: [
            ["سیم ۶", "فرت 5 (انگشت 1، ریشه) و 8 (انگشت 4)"],
            ["سیم ۵", "فرت 5 (انگشت 1) و 7 (انگشت 3)"],
            ["سیم ۴", "فرت 5 (انگشت 1) و 7 (انگشت 3، ریشه)"],
            ["سیم ۳", "فرت 5 (انگشت 1) و 7 (انگشت 3)"],
            ["سیم ۲", "فرت 5 (انگشت 1) و 8 (انگشت 4)"],
            ["سیم ۱", "فرت 5 (انگشت 1، ریشه) و 8 (انگشت 4)"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "نکته‌ی حفظی",
          text: "روی هر سیم فقط دو نت داری. نت اول همیشه فرت ۵ با انگشت اشاره است. نت دوم فرت ۷ (انگشت حلقه) روی سیم‌های ۵، ۴ و ۳ و فرت ۸ (انگشت کوچک) روی سیم‌های ۶، ۲ و ۱ است.",
        },
        {
          type: "callout",
          variant: "note",
          title: "قاعده‌ی دست",
          text: "انگشت اشاره روی فرت ۵ را همان‌جا نگه دار و دست را تکان نده.",
        },
      ],
    },

    {
      id: "up-and-down",
      title: "بالا و پایین رفتن",
      duration: { min: 12, max: 15 },
      blocks: [
        {
          type: "paragraph",
          text: "با ۵۰ `BPM` و پیک رفت‌وبرگشت یا پایین‌رو (هر کدام راحت‌تری، ولی سعی کن رفت‌وبرگشت بزنی). از سیم ۶ به ۱ بالا برو و برگرد.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "قانون سرعت",
          text: "فقط سرعتی که صفر خطا دارد؛ بعد از ۳ دور تمیز پشت‌سرهم، ۵ `BPM` بالا ببر.",
        },
        { type: "paragraph", text: "تمرین (در `Tab` متحرک): «`s3-am-pent-up-down`»." },
        {
          type: "link",
          to: "/practice?exercise=s3-am-pent-up-down",
          text: "این تمرین را متحرک ببین",
        },
      ],
    },

    {
      id: "finding-roots",
      title: "پیدا کردن ریشه‌ها",
      duration: 5,
      blocks: [
        {
          type: "paragraph",
          text: "سه ریشه را پیدا کن: سیم ۶ فرت ۵، سیم ۴ فرت ۷، سیم ۱ فرت ۵. هر سه همان نت `A` هستند و فقط صدایشان تیزتر/بم‌تر است. بزن و گوش بده.",
        },
        { type: "paragraph", text: "تمرین (در `Tab` متحرک): «`s3-am-pent-roots`»." },
        {
          type: "link",
          to: "/practice?exercise=s3-am-pent-roots",
          text: "این تمرین را متحرک ببین",
        },
      ],
    },
  ],

  completion: {
    criteria: [
      { id: "shape-by-heart", text: "شکل اسکیل را (فرت‌های هر سیم) بدون نگاه کردن به صفحه می‌گویم یا می‌زنم." },
      { id: "up-down-clean", text: "بالا و پایین رفتن را در ۵۰ `BPM` یک دور کامل بدون خطا می‌زنم." },
      { id: "find-roots", text: "سه ریشه را بدون نگاه کردن پیدا می‌کنم." },
    ],
    minRequired: 2,
    note: "۲ از ۳ کافی است. این اسکیل چند هفته طول می‌کشد تا خودکار شود، عجله نکن.",
  },

  report: {
    questions: [
      { id: "hard-strings", question: "کدام سیم‌ها/جابه‌جایی‌ها سخت‌تر بودند؟" },
      { id: "max-bpm", question: "بالاترین `BPM` بدون خطا چند بود؟" },
      { id: "pinky", question: "انگشت کوچک چطور بود؟" },
      { id: "roots", question: "ریشه‌ها را راحت پیدا کردی؟" },
    ],
  },
};

export default lesson;
