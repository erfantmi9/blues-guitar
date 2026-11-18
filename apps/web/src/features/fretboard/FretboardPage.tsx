import { useState } from "react";
import type { NoteClickEvent } from "@/components/fretboard/Fretboard";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Card } from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";
import { faNum } from "@/lib/format";
import { noteAt } from "@/lib/music";

export function FretboardPage() {
  const [last, setLast] = useState<NoteClickEvent | null>(null);
  // Note name only (e.g. G), no octave
  const name = last ? noteAt(last.string, last.fret) : null;

  return (
    <>
      <PageHeader title="نمودار دسته" subtitle="روی هر خانه بزن تا اسم نت را ببینی و صدایش را بشنوی" />
      <Card>
        <Fretboard onNoteClick={setLast} />
        <p style={{ margin: "10px 0 0", color: "var(--muted)" }} aria-live="polite">
          {last && name ? (
            <>
              سیم {faNum(last.string)}، {last.fret === 0 ? "سیم باز" : `فرت ${faNum(last.fret)}`}: نت{" "}
              <bdi dir="ltr" style={{ color: "var(--text)", fontWeight: 700 }}>
                {name}
              </bdi>
            </>
          ) : (
            "هنوز نتی انتخاب نشده."
          )}
        </p>
      </Card>
      <div style={{ marginTop: 12 }}>
        <ComingSoon step={3}>نمایش اسکیل‌ها (پنتاتونیک مینور، اسکیل بلوز) بعداً اضافه می‌شود.</ComingSoon>
      </div>
    </>
  );
}
