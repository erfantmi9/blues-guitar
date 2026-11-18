import type { Lesson } from "@bg/shared";
import { faNum, formatDateTime } from "@/lib/format";

type ReportInput = {
  createdAt: string;
  answers: Record<string, string>;
  checkedCriteria: string[];
};

/** Removes backtick markup; in plain text (messengers) it isn't needed */
const plain = (s: string) => s.replace(/`([^`]+)`/g, "$1");

/** Neat Persian report text for sending to a teacher */
export function formatReport(lesson: Lesson, r: ReportInput): string {
  const { criteria, minRequired } = lesson.completion;
  const checked = criteria.filter((c) => r.checkedCriteria.includes(c.id)).length;

  const lines: string[] = [
    `گزارش جلسه‌ی ${faNum(lesson.session)}: ${plain(lesson.title)}`,
    `تاریخ: ${formatDateTime(r.createdAt)}`,
    "",
    `معیارهای تموم‌شدن (${faNum(checked)} از ${faNum(criteria.length)}، حداقل لازم ${faNum(minRequired)}):`,
    ...criteria.map((c) => `${r.checkedCriteria.includes(c.id) ? "✅" : "⬜"} ${plain(c.text)}`),
    "",
    "پاسخ‌ها:",
  ];

  lesson.report.questions.forEach((q, i) => {
    const answer = r.answers[q.id]?.trim();
    lines.push(`${faNum(i + 1)}. ${plain(q.question)}`, `   ${answer || "—"}`);
  });

  return lines.join("\n");
}

export const hasAnyAnswer = (answers: Record<string, string>) =>
  Object.values(answers).some((a) => a.trim().length > 0);
