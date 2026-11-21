import type { Article } from "@bg/shared";

const article: Article = {
  id: "how-to-practice",
  title: "چطور تمرین کنیم",
  summary: "کم و منظم، قانون سرعت، درد خوب و بد، و گزارش بعد از هر جلسه.",
  sections: [
    {
      id: "little-and-often",
      title: "کم و منظم",
      blocks: [
        {
          type: "paragraph",
          text: "کم و منظم بهتر از زیاد و نامنظم است. با تمرین یک روز در میان، جلسه‌ی کوتاه و تکرار مهم‌تر از حجم است.",
        },
        {
          type: "paragraph",
          text: "همیشه با مرور ۵ دقیقه‌ای شروع کن.",
        },
      ],
    },
    {
      id: "speed-rule",
      title: "قانون سرعت",
      blocks: [
        {
          type: "callout",
          variant: "warning",
          title: "فقط سرعتی که صفر خطا دارد",
          text: "بعد از ۳ دور تمیز، ۵ `BPM` بالا ببر. آهسته و تمیز زدن، دست را درست آموزش می‌دهد.",
        },
      ],
    },
    {
      id: "pain",
      title: "درد",
      blocks: [
        {
          type: "paragraph",
          text: "ته انگشت‌ها اولش درد می‌گیرد و پینه می‌بندد. این طبیعی است.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "درد مچ یا آرنج",
          text: "نشانه‌ی خطاست: استراحت کن و فشار را کم کن.",
        },
      ],
    },
    {
      id: "report",
      title: "گزارش بعد از جلسه",
      blocks: [
        {
          type: "steps",
          title: "بعد از هر جلسه چند خط بنویس:",
          items: ["چه چیزی سخت بود؟", "وزوز کجا بود؟", "بیشترین `BPM` تمیز چند بود؟"],
        },
      ],
    },
  ],
};

export default article;
