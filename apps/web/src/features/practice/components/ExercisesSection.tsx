import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { faNum } from "@/lib/format";
import { exerciseProblems, exercises, getExercise } from "../content";
import { useExerciseSettings } from "../exerciseSettings";
import { TabPlayer } from "./TabPlayer";
import styles from "../tabPlayer.module.css";

/** List of exercises + player for the selected one. Supports ?exercise=<id> (link from lessons). */
export function ExercisesSection() {
  const { settings, select, stepBpm, resetBpm, setSound, setLoop, setVisualOffsetMs, stepVisualOffsetMs } = useExerciseSettings();
  const [params, setParams] = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);

  const fromUrl = getExercise(params.get("exercise"));
  const selected = fromUrl ?? getExercise(settings.selectedId) ?? exercises[0];

  // Link from a lesson: save the selection and scroll to this section
  useEffect(() => {
    if (!fromUrl) return;
    if (settings.selectedId !== fromUrl.id) select(fromUrl.id);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl?.id]);

  const choose = (id: string) => {
    select(id);
    setParams({ exercise: id }, { replace: true });
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="exercises-title">
      <h2 id="exercises-title" className={styles.sectionTitle}>
        تمرین‌ها
      </h2>

      {import.meta.env.DEV && exerciseProblems.length > 0 && (
        <Card className={styles.devErrors} role="alert">
          <strong>خطای محتوای تمرین‌ها (فقط در حالت توسعه دیده می‌شود)</strong>
          {exerciseProblems.map((p) => (
            <div key={p.file} dir="ltr">
              <code>
                {p.file} ({p.id})
              </code>
              <ul>
                {p.problems.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      )}

      <div className={styles.list} role="list">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            type="button"
            role="listitem"
            className={styles.listItem}
            aria-current={ex.id === selected?.id ? "true" : undefined}
            onClick={() => choose(ex.id)}
          >
            <span className={styles.listTitle}>{ex.title}</span>
            <span className={styles.listMeta}>
              {faNum(ex.bars)} میزان · {faNum(ex.bpmDefault)} <bdi dir="ltr">BPM</bdi>
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <Card>
          <TabPlayer
            key={selected.id}
            exercise={selected}
            bpm={settings.bpmById[selected.id] ?? selected.bpmDefault}
            sound={settings.sound}
            loop={settings.loop}
            onBpmStep={(delta) => stepBpm(selected.id, delta, selected.bpmDefault)}
            onBpmReset={() => resetBpm(selected.id)}
            onSoundChange={setSound}
            onLoopChange={setLoop}
            visualOffsetMs={settings.visualOffsetMs}
            onVisualOffsetChange={setVisualOffsetMs}
            onVisualOffsetStep={stepVisualOffsetMs}
          />
        </Card>
      ) : (
        <Card>هنوز تمرینی وجود ندارد.</Card>
      )}
    </section>
  );
}
