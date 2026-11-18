import { useMemo } from "react";
import type { HighlightedNote, TabExercise, TabNote } from "@bg/shared";
import { AlertTriangle, Play, RotateCcw, Square } from "lucide-react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button } from "@/components/ui/Button";
import { BPM_MAX, BPM_MIN } from "@/lib/audio/metronome";
import { VISUAL_OFFSET_LIMIT } from "../exerciseSettings";
import { faNum } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { noteAt } from "@/lib/music";
import { activeNotesAt, neighborsAt } from "@/lib/practice";
import { useTabPlayer, type PlayerView } from "../useTabPlayer";
import { TabStaff } from "./TabStaff";
import styles from "../tabPlayer.module.css";

type Props = {
  exercise: TabExercise;
  bpm: number;
  sound: boolean;
  loop: boolean;
  /** Relative tempo change (+/-) */
  onBpmStep: (delta: number) => void;
  onBpmReset: () => void;
  onSoundChange: (on: boolean) => void;
  onLoopChange: (on: boolean) => void;
  visualOffsetMs: number;
  onVisualOffsetChange: (ms: number) => void;
  /** Relative change (±10ms) */
  onVisualOffsetStep: (delta: number) => void;
};

const STEPS = [-5, -1, +1, +5];

/** Fretboard dots: current note (bright, with finger number), next note (preview), previous note (faded) */
function fretboardNotes(exercise: TabExercise, view: PlayerView, loop: boolean): HighlightedNote[] {
  const label = (n: TabNote) => (n.finger ? faNum(n.finger) : undefined);
  const out = new Map<string, HighlightedNote>();
  const add = (n: TabNote | null | undefined, variant: HighlightedNote["variant"]) => {
    if (!n) return;
    const k = `${n.string}:${n.fret}`;
    if (!out.has(k)) out.set(k, { string: n.string, fret: n.fret, label: label(n), variant }); // priority: added first
  };

  if (view.phase === "play") {
    const { current, previous, next } = neighborsAt(exercise.notes, view.beatPos, loop);
    current.forEach((n) => add(n, "active"));
    add(next, "preview");
    add(previous, "faded");
  } else if (view.phase !== "finished") {
    add(exercise.notes[0], "preview"); // before start: preview of the first note
  }
  return [...out.values()];
}

export function TabPlayer({
  exercise,
  bpm,
  sound,
  loop,
  onBpmStep,
  onBpmReset,
  onSoundChange,
  onLoopChange,
  visualOffsetMs,
  onVisualOffsetChange,
  onVisualOffsetStep,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { playing, view, config, toggle, stoppedByHidden } = useTabPlayer(exercise, { bpm, sound, loop, visualOffsetMs });
  const highlighted = useMemo(() => fretboardNotes(exercise, view, loop), [exercise, view, loop]);
  // Note name only (e.g. G), no octave
  const currentNames =
    view.phase === "play"
      ? activeNotesAt(exercise.notes, view.beatPos)
          .map((n) => noteAt(n.string, n.fret))
          .join(" ")
      : "";

  return (
    <div className={styles.player}>
      <div>
        <h3 className={styles.title}>{exercise.title}</h3>
        {exercise.description && <p className={styles.description}>{exercise.description}</p>}
      </div>

      {/* Above the tab and sticky under the header: stays reachable while scrolling to the fretboard on a phone */}
      <div className={styles.startBar}>
        <Button variant={playing ? "secondary" : "primary"} block className={styles.startBtn} onClick={toggle}>
          {playing ? <Square size={22} aria-hidden /> : <Play size={22} aria-hidden />}
          {playing ? "توقف" : "شروع (با یک میزان شمارش)"}
        </Button>
      </div>

      <div className={styles.stage}>
        <TabStaff exercise={exercise} view={view} subdivisions={config.subdivisions} reducedMotion={reducedMotion} />
        {view.phase === "count-in" && (
          <div className={styles.countIn} aria-live="assertive">
            <span key={view.count}>{faNum(view.count)}</span>
          </div>
        )}
      </div>

      <Fretboard readOnly highlightedNotes={highlighted} ariaLabel="نت فعلی روی دسته" />

      <div className={styles.status} aria-live="polite">
        {view.phase === "count-in" && "شمارش ورودی…"}
        {view.phase === "play" &&
          `میزان ${faNum(Math.floor(view.beatPos / exercise.beatsPerBar) + 1)} از ${faNum(exercise.bars)}` +
            (loop && view.loopIndex > 0 ? ` · دور ${faNum(view.loopIndex + 1)}` : "")}
        {view.phase === "play" && currentNames && (
          <>
            {" · نت "}
            <bdi dir="ltr" className={styles.noteName}>
              {currentNames}
            </bdi>
          </>
        )}
        {view.phase === "finished" && "تمرین تمام شد. دوباره؟"}
        {view.phase === "idle" && `${faNum(exercise.bars)} میزان · ${faNum(exercise.beatsPerBar)} ضرب در میزان`}
      </div>

      {stoppedByHidden && (
        <p className={styles.notice} role="status">
          <AlertTriangle size={18} aria-hidden />
          پخش متوقف شد چون صفحه از دید خارج شد.
        </p>
      )}

      <div className={styles.bpmRow}>
        <div className={styles.bpmSteps} dir="ltr">
          {STEPS.slice(0, 2).map((s) => (
            <button key={s} type="button" className={styles.stepBtn} onClick={() => onBpmStep(s)} disabled={bpm <= BPM_MIN}>
              −{faNum(Math.abs(s))}
            </button>
          ))}
          <output className={styles.bpmValue}>
            {faNum(bpm)}
            <small>
              <bdi dir="ltr">BPM</bdi>
            </small>
          </output>
          {STEPS.slice(2).map((s) => (
            <button key={s} type="button" className={styles.stepBtn} onClick={() => onBpmStep(s)} disabled={bpm >= BPM_MAX}>
              +{faNum(s)}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={onBpmReset} disabled={bpm === exercise.bpmDefault} title="بازنشانی تمپو">
          <RotateCcw size={16} aria-hidden />
          پیش‌فرض ({faNum(exercise.bpmDefault)})
        </Button>
      </div>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={sound} onChange={(e) => onSoundChange(e.target.checked)} />
          پخش صدای نت‌ها
          <span className={styles.toggleHint}>{sound ? "" : "(بی‌صدا: خودت با گیتار بزن)"}</span>
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={loop} onChange={(e) => onLoopChange(e.target.checked)} />
          تکرار (حلقه)
        </label>
      </div>

      <LatencySetting value={visualOffsetMs} onChange={onVisualOffsetChange} onStep={onVisualOffsetStep} />
    </div>
  );
}

/** Manual delay compensation: for when the browser misreports the audio output latency (e.g. Bluetooth) */
function LatencySetting({
  value,
  onChange,
  onStep,
}: {
  value: number;
  onChange: (ms: number) => void;
  onStep: (delta: number) => void;
}) {
  const signed = value === 0 ? faNum(0) : `${value > 0 ? "+" : "−"}${faNum(Math.abs(value))}`;
  return (
    <details className={styles.advanced} open={value !== 0 || undefined}>
      <summary>
        جبران تأخیر نمایش: <bdi dir="ltr">{signed}</bdi> میلی‌ثانیه
      </summary>
      <p className={styles.advancedHint}>
        اگر نت روی صفحه <strong>زودتر</strong> از صدا عوض می‌شود، عدد را مثبت کن؛ اگر <strong>دیرتر</strong>، منفی. فقط
        نمایش جابه‌جا می‌شود، صدا نه.
      </p>
      <div className={styles.offsetRow} dir="ltr">
        <button type="button" className={styles.stepBtn} onClick={() => onStep(-10)} disabled={value <= -VISUAL_OFFSET_LIMIT} aria-label="۱۰ میلی‌ثانیه زودتر">
          −{faNum(10)}
        </button>
        <input
          type="range"
          min={-VISUAL_OFFSET_LIMIT}
          max={VISUAL_OFFSET_LIMIT}
          step={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.offsetSlider}
          aria-label="جبران تأخیر نمایش (میلی‌ثانیه)"
        />
        <button type="button" className={styles.stepBtn} onClick={() => onStep(10)} disabled={value >= VISUAL_OFFSET_LIMIT} aria-label="۱۰ میلی‌ثانیه دیرتر">
          +{faNum(10)}
        </button>
      </div>
      <Button variant="ghost" onClick={() => onChange(0)} disabled={value === 0}>
        <RotateCcw size={16} aria-hidden />
        صفر
      </Button>
    </details>
  );
}
