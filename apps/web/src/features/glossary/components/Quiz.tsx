import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@bg/shared";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/features/lessons/components/RichText";
import { QUIZ_PASS, shuffledIndices } from "@/lib/content/reference";
import { faNum } from "@/lib/format";
import styles from "../glossary.module.css";

type Props = {
  questions: QuizQuestion[];
  best: number | undefined;
  onFinish: (score: number) => void;
};

/** One question at a time, options shuffled per attempt, instant feedback, best score saved by the parent. */
export function Quiz({ questions, best, onFinish }: Props) {
  const [attempt, setAttempt] = useState(0);
  // Option order per question: shuffled again on every attempt
  const [orders, setOrders] = useState(() => questions.map((q) => shuffledIndices(q.options.length)));
  const [index, setIndex] = useState(0);
  /** Original index of the chosen option */
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Move focus to the new question or the result, but not on first render (the page must not jump to the quiz)
  const step = `${attempt}:${index}:${finished}`;
  const firstStep = useRef(step);
  useEffect(() => {
    if (step !== firstStep.current) headingRef.current?.focus();
  }, [step]);

  const total = questions.length;
  if (total === 0) return null;

  const restart = () => {
    setOrders(questions.map((q) => shuffledIndices(q.options.length)));
    setIndex(0);
    setChosen(null);
    setScore(0);
    setFinished(false);
    setAttempt((a) => a + 1);
  };

  if (finished) {
    return (
      <div className={styles.quizBox}>
        <h3 ref={headingRef} tabIndex={-1} className={styles.quizResult}>
          نمره‌ی تو: {faNum(score)} از {faNum(total)}
        </h3>
        <p className={styles.muted}>
          {score >= QUIZ_PASS ? "عالی! این سطح را خوب بلدی." : `برای نشان «تمام‌شده» دست‌کم ${faNum(QUIZ_PASS)} از ${faNum(total)} لازم است.`}
          {best !== undefined && ` بهترین نمره: ${faNum(best)} از ${faNum(total)}.`}
        </p>
        <Button onClick={restart}>
          <RotateCcw size={18} aria-hidden />
          دوباره
        </Button>
      </div>
    );
  }

  const q = questions[index]!;
  const order = orders[index]!;
  const answered = chosen !== null;
  const correct = chosen === q.correctIndex;

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setChosen(null);
    } else {
      setFinished(true);
      onFinish(score);
    }
  };

  return (
    <div className={styles.quizBox}>
      <p className={styles.quizCount}>
        سؤال {faNum(index + 1)} از {faNum(total)}
      </p>
      <h3 ref={headingRef} tabIndex={-1} className={styles.quizPrompt} id={`quiz-q-${q.id}`}>
        <RichText text={q.prompt} />
      </h3>
      <div className={styles.options} role="group" aria-labelledby={`quiz-q-${q.id}`}>
        {order.map((original) => {
          const state = !answered ? undefined : original === q.correctIndex ? "correct" : original === chosen ? "wrong" : "dim";
          return (
            <button
              key={`${attempt}-${original}`}
              type="button"
              className={styles.option}
              data-state={state}
              disabled={answered}
              aria-pressed={original === chosen}
              onClick={() => {
                setChosen(original);
                if (original === q.correctIndex) setScore((s) => s + 1);
              }}
            >
              {state === "correct" && <Check size={18} aria-hidden />}
              {state === "wrong" && <X size={18} aria-hidden />}
              <RichText text={q.options[original]!} />
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <div className={styles.feedback} data-correct={correct || undefined}>
            <strong>{correct ? "درسته!" : "نه."}</strong>{" "}
            {!correct && (
              <>
                جواب درست: <RichText text={q.options[q.correctIndex]!} />.{" "}
              </>
            )}
            <RichText text={q.explanation} />
          </div>
        )}
      </div>
      {answered && (
        <Button variant="primary" onClick={next}>
          {index + 1 < total ? "سؤال بعد" : "دیدن نتیجه"}
        </Button>
      )}
    </div>
  );
}
