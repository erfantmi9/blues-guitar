import type { StageMeta } from "@bg/shared";

/**
 * The 9 stages of the path. Lessons are attached automatically by stageId
 * (see content/index.ts), so adding a lesson doesn't require editing this file.
 */
export const stageMetas: StageMeta[] = [
  {
    id: "stage-1",
    number: 1,
    title: "آشنایی با گیتار و آمپ",
    goal: "تیون کردن، گرفتن درست پیک و زدن نت‌های تمیز روی صدای تمیز آمپ.",
    estimatedSessions: 2,
  },
  {
    id: "stage-2",
    number: 2,
    title: "اولین نت‌ها و خوندن `Tab`",
    goal: "خواندن تبلچر و زدن ملودی‌های ساده‌ی تک‌نتی با ریتم یکنواخت.",
    estimatedSessions: 3,
  },
  {
    id: "stage-3",
    number: 3,
    title: "`Minor Pentatonic` پوزیشن ۱",
    goal: "زدن روان پوزیشن ۱ پنتاتونیک مینور بالا و پایین با مترونوم و شناختن تونیک.",
    estimatedSessions: 4,
  },
  {
    id: "stage-4",
    number: 4,
    title: "ریتم و `Backing Track`",
    goal: "حس کردن شافل بلوز، شمردن ضرب‌ها و هماهنگ زدن با بکینگ ترک.",
    estimatedSessions: 3,
  },
  {
    id: "stage-5",
    number: 5,
    title: "`Bending` و `Vibrato`",
    goal: "بند کوک‌شده (نیم‌پرده و یک پرده) و ویبراتوی کنترل‌شده؛ صدای آواز گیتار بلوز.",
    estimatedSessions: 4,
  },
  {
    id: "stage-6",
    number: 6,
    title: "`Blues Scale`",
    goal: "اضافه کردن نت بلو به پنتاتونیک و استفاده‌ی آگاهانه از آن در جمله‌ها.",
    estimatedSessions: 3,
  },
  {
    id: "stage-7",
    number: 7,
    title: "ساختار ۱۲ میزانی بلوز",
    goal: "شناختن فرم `I–IV–V`، دنبال کردن میزان‌ها و زدن ریتم بلوز روی کل فرم.",
    estimatedSessions: 3,
  },
  {
    id: "stage-8",
    number: 8,
    title: "اولین `Lick` ها",
    goal: "یاد گرفتن چند لیک کلاسیک بلوز و استفاده از آن‌ها به شکل سؤال و جواب.",
    estimatedSessions: 4,
  },
  {
    id: "stage-9",
    number: 9,
    title: "اولین سولوی کامل",
    goal: "ساختن یک سولوی ۱۲ میزانی روی بکینگ ترک با فضا، بند و ویبراتو.",
    estimatedSessions: 4,
  },
];
