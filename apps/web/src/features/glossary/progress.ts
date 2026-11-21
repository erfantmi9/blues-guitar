import { useMemo } from "react";
import { defineKey, useStoredValue } from "@/lib/storage";
import type { GlossaryProgress } from "@/lib/content/reference";

const EMPTY: GlossaryProgress = { learned: [], quizBest: {} };

export const glossaryProgressKey = defineKey<GlossaryProgress>("glossary:progress", { version: 1, fallback: EMPTY });

export function useGlossaryProgress() {
  const [progress, set] = useStoredValue(glossaryProgressKey);
  const actions = useMemo(
    () => ({
      /** "یاد گرفتم" and back */
      toggleLearned(termId: string) {
        set((p) => ({
          ...p,
          learned: p.learned.includes(termId) ? p.learned.filter((id) => id !== termId) : [...p.learned, termId],
        }));
      },
      /** Keeps only the best score */
      recordQuiz(levelId: number, score: number) {
        set((p) => {
          const key = String(levelId);
          if ((p.quizBest[key] ?? -1) >= score) return p;
          return { ...p, quizBest: { ...p.quizBest, [key]: score } };
        });
      },
    }),
    [set],
  );
  return { progress, ...actions };
}
