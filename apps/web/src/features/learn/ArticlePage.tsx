import { Link, useParams } from "react-router";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentBlockView } from "@/features/lessons/components/ContentBlockView";
import { RichText } from "@/features/lessons/components/RichText";
import { faNum } from "@/lib/format";
import { getArticle } from "./content";
import lessonStyles from "@/features/lessons/lessons.module.css";
import styles from "./learn.module.css";

/** One article, rendered with the same blocks as lessons (no timer, no durations) */
export function ArticlePage() {
  const { articleId } = useParams();
  const article = getArticle(articleId);

  if (!article) {
    return (
      <>
        <PageHeader title="مقاله پیدا نشد" />
        <Link to="/learn">بازگشت به مفاهیم</Link>
      </>
    );
  }

  return (
    <div className={lessonStyles.lessonPage}>
      <Link to="/learn" className={lessonStyles.backLink}>
        <ChevronRight size={18} aria-hidden />
        مفاهیم
      </Link>

      <PageHeader title={article.title.replace(/`/g, "")} />
      <p className={styles.lead}>
        <RichText text={article.summary} />
      </p>

      <div className={lessonStyles.sections}>
        {article.sections.map((section, i) => (
          <section key={section.id} className={lessonStyles.section} aria-labelledby={`${article.id}-${section.id}`}>
            <header className={lessonStyles.sectionHeader}>
              <span className={lessonStyles.sectionNum}>{faNum(i + 1)}</span>
              <h2 id={`${article.id}-${section.id}`} className={lessonStyles.sectionTitle}>
                <RichText text={section.title} />
              </h2>
            </header>
            <div className={lessonStyles.sectionBody}>
              {section.blocks.map((b, j) => (
                <ContentBlockView key={j} block={b} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
