import { Link } from "react-router";
import { GraduationCap, House } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import styles from "./Fallback.module.css";

/** Unknown address, or a lesson / glossary level that doesn't exist */
export function NotFoundPage() {
  return (
    <section className={styles.box} aria-labelledby="not-found-title">
      <Logo variant="mark" size={64} />
      <h1 id="not-found-title" className={styles.title}>
        این صفحه پیدا نشد
      </h1>
      <p className={styles.text}>شاید آدرس اشتباه تایپ شده، یا این صفحه دیگر وجود ندارد.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primary}>
          <House size={18} aria-hidden />
          خانه
        </Link>
        <Link to="/path" className={styles.secondary}>
          <GraduationCap size={18} aria-hidden />
          درس‌ها
        </Link>
      </div>
    </section>
  );
}
