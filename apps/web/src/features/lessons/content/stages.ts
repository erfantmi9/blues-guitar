import type { StageMeta } from "@bg/shared";

/**
 * All stages of the three tracks (see tracks.ts). Within a track, stages are in teaching
 * order as listed here; a stage's displayed number is its place in its track.
 * Lessons are attached automatically by stageId (see content/index.ts).
 * Stage ids are stable: lessons and saved anchors point to them. Never rename one.
 * A stage with no lessons shows as "coming soon".
 */
export const stageMetas: StageMeta[] = [
  {
    id: "stage-1",
    trackId: "foundation",
    title: "آشنایی با گیتار و آمپ",
    goal: "تیون کردن، گرفتن درست پیک و زدن نت‌های تمیز روی صدای تمیز آمپ.",
    estimatedSessions: 2,
  },
  {
    id: "stage-2",
    trackId: "foundation",
    title: "اولین نت‌ها و خوندن `Tab`",
    goal: "خواندن تبلچر و زدن ملودی‌های ساده‌ی تک‌نتی با ریتم یکنواخت.",
    estimatedSessions: 3,
  },
  // ---- Foundation: coming soon ----
  { id: "foundation-notes", trackId: "foundation", title: "نت‌های سیم‌ها تا فرت ۵", goal: "اسم نت‌های هر سیم، از سیم باز تا فرت ۵." },
  { id: "foundation-pick", trackId: "foundation", title: "پیک", goal: "پیک‌زنی بالا و پایین و جابه‌جایی بین سیم‌ها." },
  { id: "foundation-timing", trackId: "foundation", title: "زمان‌بندی نت‌ها", goal: "شمردن کشش نت‌ها و زدنشان سر ضرب با مترونوم." },

  // ---- Solo ----
  {
    id: "stage-3",
    trackId: "solo",
    title: "`Minor Pentatonic` پوزیشن ۱",
    goal: "زدن روان پوزیشن ۱ پنتاتونیک مینور بالا و پایین با مترونوم و شناختن تونیک.",
    estimatedSessions: 4,
  },
  {
    id: "stage-4",
    trackId: "solo",
    title: "ریتم و `Backing Track`",
    goal: "حس کردن شافل بلوز، شمردن ضرب‌ها و هماهنگ زدن با بکینگ ترک.",
    estimatedSessions: 3,
  },
  {
    id: "stage-5",
    trackId: "solo",
    title: "`Bending` و `Vibrato`",
    goal: "بند کوک‌شده (نیم‌پرده و یک پرده) و ویبراتوی کنترل‌شده؛ صدای آواز گیتار بلوز.",
    estimatedSessions: 4,
  },
  {
    id: "stage-6",
    trackId: "solo",
    title: "`Blues Scale`",
    goal: "اضافه کردن نت بلو به پنتاتونیک و استفاده‌ی آگاهانه از آن در جمله‌ها.",
    estimatedSessions: 3,
  },
  {
    id: "stage-7",
    trackId: "solo",
    title: "ساختار ۱۲ میزانی بلوز",
    goal: "شناختن فرم `I–IV–V`، دنبال کردن میزان‌ها و زدن ریتم بلوز روی کل فرم.",
    estimatedSessions: 3,
  },
  {
    id: "stage-8",
    trackId: "solo",
    title: "اولین `Lick` ها",
    goal: "یاد گرفتن چند لیک کلاسیک بلوز و استفاده از آن‌ها به شکل سؤال و جواب.",
    estimatedSessions: 4,
  },
  {
    id: "stage-9",
    trackId: "solo",
    title: "اولین سولوی کامل",
    goal: "ساختن یک سولوی ۱۲ میزانی روی بکینگ ترک با فضا، بند و ویبراتو.",
    estimatedSessions: 4,
  },

  // ---- Chords & rhythm: coming soon ----
  { id: "chords-open", trackId: "chords", title: "آکوردهای باز", goal: "آکوردهای پایه با سیم‌های باز و عوض کردن بین آن‌ها." },
  { id: "chords-strum", trackId: "chords", title: "استرام ساده", goal: "الگوهای ساده‌ی استرام بالا و پایین با مترونوم." },
  { id: "chords-blues-sevenths", trackId: "chords", title: "آکوردهای بلوز (`A7 D7 E7`)", goal: "سه آکورد هفتِ بلوز در کلید `A`." },
  { id: "chords-shuffle-12bar", trackId: "chords", title: "شافل با آکورد و بلوز ۱۲ میزانی", goal: "ریتم شافل با آکورد روی کل فرم ۱۲ میزانی." },
  { id: "chords-power-palm-mute", trackId: "chords", title: "پاور کورد و پالم‌میوت", goal: "پاور کوردها و خفه کردن سیم‌ها با کف دست راست." },
  { id: "chords-barre", trackId: "chords", title: "آکوردهای بارره", goal: "آکوردهای بارره و جابه‌جا کردنشان روی دسته." },
  { id: "chords-blues-rhythms", trackId: "chords", title: "ریتم‌های بلوز (۱۲/۸ و بوگی)", goal: "ریتم آهسته‌ی ۱۲/۸ و الگوی بوگی." },
  { id: "chords-advanced-rhythms", trackId: "chords", title: "ریتم‌های پیشرفته (۱۶ام و سنکوپ)", goal: "ریتم با نت‌های ۱۶ام و ضرب‌های سنکوپ‌دار." },
  { id: "chords-advanced", trackId: "chords", title: "آکوردهای پیشرفته (۹، `sus`، ترن‌اراند)", goal: "آکوردهای ۹ و `sus` و ترن‌اراندِ پایان فرم." },
];
