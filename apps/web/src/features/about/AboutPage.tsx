import { useEffect } from "react";
import { useLocation } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/config/site";
import { RichText } from "@/features/lessons/components/RichText";
import styles from "./about.module.css";

/** /about. Text is entered exactly as given; the feedback section appears only when site.feedbackEmail is set. */
export function AboutPage() {
  const { hash } = useLocation();
  // /about#privacy from the footer
  useEffect(() => {
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }));
  }, [hash]);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <Logo variant="mark" size={56} />
        <h1 className={styles.title}>
          درباره‌ی <bdi dir="ltr">Slow Bend</bdi>
        </h1>
      </header>

      <p className={styles.lead}>
        <RichText text="`Slow Bend` یک مسیر آموزشی رایگان برای شروع گیتار الکتریک و سبک بلوز است، برای کسی که از صفر شروع می‌کند." />
      </p>

      <Section id="ready" title="چه چیزی آماده است">
        فعلاً مرحله‌های ۱ تا ۴ آماده‌اند: آشنایی با ساز، خوندن `Tab`، `Minor Pentatonic` و ریتم با `Backing Track`. مرحله‌های ۵ تا ۹ (`Bending`، `Blues Scale`، بلوز ۱۲ میزانی، `Lick`ها و اولین سولو) به‌زودی می‌آیند.
      </Section>

      <Section id="honest" title="یک نکته‌ی صادقانه">
        محتوای درس‌ها با کمک هوش مصنوعی نوشته شده و هنوز یک مربی حرفه‌ی گیتار آن را بازبینی نکرده است. اگر جایی اشتباه دیدی، خبر بده. این سایت جایگزین معلم واقعی نیست، مخصوصاً برای حالت دست و مچ.
      </Section>

      <Section id="health" title="سلامت">
        ته انگشت‌ها اولش درد می‌گیرد و این طبیعی است. درد مچ، آرنج یا شانه نشانه‌ی خطاست: استراحت کن و فشار را کم کن. صدای آمپ را در حدی نگه دار که به گوشت فشار نیاید.
      </Section>

      <Section id="privacy" title="حریم خصوصی">
        پیشرفت تو فقط در مرورگر خودت ذخیره می‌شود. این سایت حساب کاربری ندارد، آمار بازدید جمع نمی‌کند و چیزی به سرور نمی‌فرستد. با پاک کردن داده‌های مرورگر، پیشرفت از بین می‌رود؛ از بخش پشتیبان‌گیری در تنظیمات می‌توانی نسخه‌ی پشتیبان بگیری.
      </Section>

      <Section id="sounds" title="صداها">
        همه‌ی صداها (`Metronome`، سازهای `Backing Track` و صدای نت‌ها) در خود مرورگر ساخته می‌شوند، نه از روی ضبط یا آهنگ دیگران.
      </Section>

      {site.feedbackEmail && (
        <section id="feedback" className={styles.section} aria-labelledby="about-feedback">
          <h2 id="about-feedback" className={styles.sectionTitle}>
            بازخورد
          </h2>
          <p>
            <a href={`mailto:${site.feedbackEmail}`} dir="ltr">
              {site.feedbackEmail}
            </a>
          </p>
        </section>
      )}

      <p className={styles.closing}>
        <RichText text="اسم هنرمندان (مثل `BB King` و `Beth Hart`) فقط برای الهام آمده است و این سایت با هیچ‌کدام ارتباطی ندارد." />
      </p>
    </article>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: string }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`about-${id}`}>
      <h2 id={`about-${id}`} className={styles.sectionTitle}>
        {title}
      </h2>
      <p>
        <RichText text={children} />
      </p>
    </section>
  );
}
