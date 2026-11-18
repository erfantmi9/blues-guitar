import type { ContentBlock, ListItem } from "@bg/shared";
import { Link } from "react-router";
import { AlertTriangle, ChevronLeft, Info, Lightbulb, PlayCircle } from "lucide-react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { RichText } from "./RichText";
import styles from "../lessons.module.css";

const calloutIcon = { tip: Lightbulb, warning: AlertTriangle, note: Info } as const;

function Item({ item }: { item: ListItem }) {
  if (typeof item === "string") return <RichText text={item} />;
  return (
    <>
      <strong className={styles.itemLabel}>
        <RichText text={item.label} />:
      </strong>{" "}
      <RichText text={item.text} />
    </>
  );
}

/** Renders one content block. To add a new block type: add it to the shared union and a case here. */
export function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className={styles.paragraph}>
          <RichText text={block.text} />
        </p>
      );

    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            {block.caption && (
              <caption>
                <RichText text={block.caption} />
              </caption>
            )}
            <thead>
              <tr>
                {block.columns.map((c) => (
                  <th key={c} scope="col">
                    <RichText text={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "steps": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <div className={styles.steps}>
          {block.title && (
            <h4 className={styles.blockTitle}>
              <RichText text={block.title} />
            </h4>
          )}
          <List className={styles.list}>
            {block.items.map((item, i) => (
              <li key={i}>
                <Item item={item} />
              </li>
            ))}
          </List>
        </div>
      );
    }

    case "callout": {
      const Icon = calloutIcon[block.variant];
      return (
        <aside className={`${styles.callout} ${styles[block.variant]}`}>
          <Icon size={20} className={styles.calloutIcon} aria-hidden />
          <div>
            {block.title && (
              <strong className={styles.calloutTitle}>
                <RichText text={block.title} />
              </strong>
            )}
            <div>
              <RichText text={block.text} />
            </div>
          </div>
        </aside>
      );
    }

    case "fretboard":
      return (
        <figure className={styles.figure}>
          <Fretboard
            readOnly
            highlightedNotes={block.highlightedNotes}
            showNoteNames={block.showNoteNames}
            frets={block.frets}
          />
          {block.caption && (
            <figcaption className={styles.figcaption}>
              <RichText text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "pre":
      return (
        <figure className={styles.figure}>
          <pre className={styles.pre} dir="ltr">
            {block.text}
          </pre>
          {block.caption && (
            <figcaption className={styles.figcaption}>
              <RichText text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "link":
      return (
        <Link to={block.to} className={styles.linkBlock}>
          <PlayCircle size={20} aria-hidden />
          <RichText text={block.text} />
          <ChevronLeft size={18} aria-hidden className={styles.linkArrow} />
        </Link>
      );

    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
