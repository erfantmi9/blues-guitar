import { Link } from "react-router";
import { site } from "@/config/site";
import styles from "./Layout.module.css";

/** Small site footer. Feedback and repository links appear only when set in config/site.ts. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerName} dir="ltr">
        {site.name}
      </span>
      <nav aria-label="پیوندهای پایین صفحه" className={styles.footerLinks}>
        <Link to="/about">درباره</Link>
        <Link to="/about#privacy">حریم خصوصی</Link>
        {site.feedbackEmail && <a href={`mailto:${site.feedbackEmail}`}>بازخورد</a>}
        {site.repoUrl && (
          <a href={site.repoUrl} target="_blank" rel="noopener noreferrer">
            کد منبع
          </a>
        )}
      </nav>
    </footer>
  );
}
