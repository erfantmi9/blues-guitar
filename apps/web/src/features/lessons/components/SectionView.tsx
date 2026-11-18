import type { Ref } from "react";
import type { Section } from "@bg/shared";
import { Clock } from "lucide-react";
import { faNum, formatDuration } from "@/lib/format";
import { ContentBlockView } from "./ContentBlockView";
import { RichText } from "./RichText";
import styles from "../lessons.module.css";

type Props = { section: Section; index: number; active: boolean; ref?: Ref<HTMLElement> };

export function SectionView({ section, index, active, ref }: Props) {
  return (
    <section ref={ref} className={styles.section} data-active={active || undefined} aria-current={active ? "step" : undefined}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionNum}>{faNum(index + 1)}</span>
        <h3 className={styles.sectionTitle}>
          <RichText text={section.title} />
        </h3>
        <span className={styles.duration}>
          <Clock size={14} aria-hidden />
          {formatDuration(section.duration)}
        </span>
      </header>
      <div className={styles.sectionBody}>
        {section.blocks.map((b, i) => (
          <ContentBlockView key={i} block={b} />
        ))}
      </div>
    </section>
  );
}
