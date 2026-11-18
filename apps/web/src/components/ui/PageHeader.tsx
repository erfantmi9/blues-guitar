import type { ReactNode } from "react";
import styles from "./ui.module.css";

type Props = { title: string; subtitle?: string; actions?: ReactNode };

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
