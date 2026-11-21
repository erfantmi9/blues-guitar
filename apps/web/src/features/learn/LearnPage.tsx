import { Link } from "react-router";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { RichText } from "@/features/lessons/components/RichText";
import { faNum } from "@/lib/format";
import { articleProblems, articles } from "./content";
import styles from "./learn.module.css";

export function LearnPage() {
  return (
    <>
      <PageHeader title="مفاهیم" subtitle="مقاله‌های کوتاه درباره‌ی پایه‌های موسیقی و تمرین" />

      {import.meta.env.DEV && articleProblems.length > 0 && (
        <Card className={styles.devErrors} role="alert">
          <strong>خطای محتوای مقاله‌ها (فقط در حالت توسعه دیده می‌شود)</strong>
          <ul dir="ltr">
            {articleProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      <ul className={styles.list}>
        {articles.map((a) => (
          <li key={a.id}>
            <Link to={`/learn/${a.id}`} className={styles.item}>
              <span className={styles.itemText}>
                <strong className={styles.itemTitle}>
                  <RichText text={a.title} />
                </strong>
                <span className={styles.summary}>
                  <RichText text={a.summary} />
                </span>
                <span className={styles.muted}>{faNum(a.sections.length)} بخش</span>
              </span>
              <ChevronLeft size={20} aria-hidden className={styles.chevron} />
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/glossary" className={styles.glossaryLink}>
        <BookOpen size={18} aria-hidden />
        اصطلاحات
      </Link>
    </>
  );
}
