import styles from "../lessons.module.css";

/**
 * Renders text with `...` spans shown left-to-right (bdi),
 * so English words like `Gain` or `E` don't break the RTL layout.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <bdi key={i} dir="ltr" className={styles.latin}>
            {part}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}
