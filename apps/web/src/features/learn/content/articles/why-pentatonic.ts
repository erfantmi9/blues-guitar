import type { Article } from "@bg/shared";
import { A_MINOR_PENTATONIC_POS1 } from "@/lib/music/shapes";

const article: Article = {
  id: "why-pentatonic",
  title: "چرا پنتاتونیک؟",
  summary: "چرا اولین اسکیل بلوز پنتاتونیک است و چرا همین پنج نت برای سال‌ها کافی است.",
  sections: [
    {
      id: "five-not-seven",
      title: "۵ نت به‌جای ۷",
      blocks: [
        {
          type: "paragraph",
          text: "اسکیل عادی ۷ نت دارد و بعضی نت‌هایش روی آکورد «تلخ» می‌شوند. پنتاتونیک ۲ نت مشکل‌دار را حذف می‌کند، پس تقریباً هر نتش روی آکورد بلوز جواب می‌دهد.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "نکته",
          text: "روی `A7` بعضی نت‌ها کمی «تلخ» می‌شنوی. این همان طعم بلوز است.",
        },
      ],
    },
    {
      id: "simple-shape",
      title: "شکل ساده",
      blocks: [
        {
          type: "paragraph",
          text: "روی هر سیم فقط دو نت داری، پس شکلش ساده است و در دست می‌نشیند.",
        },
        {
          type: "fretboard",
          highlightedNotes: [...A_MINOR_PENTATONIC_POS1],
          caption: "`A Minor Pentatonic` پوزیشن ۱. نقطه‌های قرمز ریشه (`A`) هستند؛ عدد هر نقطه شماره‌ی انگشت است.",
        },
      ],
    },
    {
      id: "one-shape-every-key",
      title: "یک شکل، همه‌ی کلیدها",
      blocks: [
        {
          type: "paragraph",
          text: "مینور پنتاتونیک `A` نت‌های `A C D E G` است. اگر همین شکل را روی دسته به فرت‌های دیگر ببری، در کلید دیگری می‌شود؛ مثلاً اگر از فرت ۷ شروع کنی، کلید `B` است.",
        },
      ],
    },
    {
      id: "the-masters",
      title: "استادها هم از همین شروع کردند",
      blocks: [
        {
          type: "paragraph",
          text: "همه‌ی استادان بلوز (`BB King` و `Gary Moore`) از همین شروع کرده‌اند. چیزی که صدایشان را متفاوت می‌کند، نحوه‌ی زدن است (بند، ویبراتو، ریتم)، نه نت‌های عجیب.",
        },
      ],
    },
  ],
};

export default article;
