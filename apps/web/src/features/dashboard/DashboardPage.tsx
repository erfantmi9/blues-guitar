import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import styles from "./Dashboard.module.css";

// Static for now; in step 7 this is generated from settings and lesson progress.
const routine = [
  { title: "گرم‌کردن انگشت‌ها", minutes: 5 },
  { title: "تکنیک (با مترونوم)", minutes: 8 },
  { title: "درس جدید", minutes: 10 },
  { title: "بداهه‌نوازی روی بکینگ ترک", minutes: 7 },
];

export function DashboardPage() {
  const total = routine.reduce((s, r) => s + r.minutes, 0);
  return (
    <>
      <PageHeader title="سلام 🎸" subtitle="امروز هم یک قدم به سولوی بلوز نزدیک‌تر." />

      <Card>
        <h2 className={styles.cardTitle}>روتین امروز · {total.toLocaleString("fa-IR")} دقیقه</h2>
        <ol className={styles.routine}>
          {routine.map((r) => (
            <li key={r.title}>
              <span>{r.title}</span>
              <span className={styles.min}>{r.minutes.toLocaleString("fa-IR")} دقیقه</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className={styles.quick}>
        <Link to="/path" className={styles.quickLink}>ادامه‌ی مسیر</Link>
        <Link to="/practice" className={styles.quickLink}>مترونوم و بکینگ</Link>
        <Link to="/fretboard" className={styles.quickLink}>نمودار دسته</Link>
      </div>
    </>
  );
}
