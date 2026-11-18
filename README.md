# تمرین بلوز 🎸

سایت شخصی برای یادگیری گیتار الکتریک بلوز، از صفر تا اولین سولو. فارسی و راست‌به‌چپ، مناسب موبایل.

- **مسیر یادگیری:** ۹ مرحله با درس‌های کوتاه، تایمر جلسه، چک‌لیست تموم‌شدن و گزارش بعد از جلسه
- **نمودار دسته:** تعاملی، با صدای نت‌ها
- **مترونوم دقیق:** زمان‌بندی روی ساعت Web Audio با روش lookahead
- **تب متحرک:** هم‌زمان با مترونوم، با نمایش نت روی دسته، شمارش ورودی و حلقه

پیشرفت فعلاً فقط در `localStorage` مرورگر ذخیره می‌شود. بک‌اند (`apps/api`) هنوز به سایت وصل نیست.

## اجرا

نیاز: Node.js نسخه‌ی ۲۲.۱۲ یا بالاتر.

```bash
npm install
npm run dev:web      # فقط سایت، روی http://localhost:5173
npm run dev          # سایت و API با هم
npm run typecheck
npm run build        # خروجی در apps/web/dist
```

برای باز کردن روی گوشی، آدرس `Network` را که Vite نشان می‌دهد باز کن. گوشی و کامپیوتر باید روی یک شبکه باشند.

## ساختار

```
apps/web/          سایت (Vite + React + TypeScript)
  src/features/    هر بخش یک پوشه: lessons، practice، fretboard، …
  src/lib/         منطق بدون React: music، audio، practice، storage
apps/api/          بک‌اند Hono (فعلاً استفاده نمی‌شود و دیپلوی هم نمی‌شود)
packages/shared/   تایپ‌های مشترک
```

## افزودن محتوا

- **درس جدید:** یک فایل در `apps/web/src/features/lessons/content/lessons/` با `export default`. ثبت خودکار است.
- **تمرین تب جدید:** یک فایل در `apps/web/src/features/practice/content/exercises/`. اعتبارسنجی هنگام بارگذاری انجام می‌شود و در حالت توسعه خطاها روی صفحه نمایش داده می‌شوند.

## دیپلوی

Vercel، با تنظیمات [`vercel.json`](vercel.json):
- **Root Directory:** ریشه‌ی repo
- **Framework:** Other
- بقیه‌ی تنظیمات از `vercel.json` خوانده می‌شود.

فایل‌های `.env` در گیت نمی‌روند. فقط `apps/api/.env.example` در repo است.
