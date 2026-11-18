import { AlertTriangle, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BEATS_MAX, BEATS_MIN, BPM_MAX, BPM_MIN } from "@/lib/audio/metronome";
import { faNum } from "@/lib/format";
import { useMetronome } from "../useMetronome";
import { BeatIndicator } from "./BeatIndicator";
import styles from "../practice.module.css";

const STEPS = [-5, -1, +1, +5];
const BEAT_OPTIONS = Array.from({ length: BEATS_MAX - BEATS_MIN + 1 }, (_, i) => BEATS_MIN + i);

export function Metronome() {
  const { settings, playing, current, stopReason, toggle, setBpm, setBeatsPerBar, setAccent } = useMetronome();
  const { bpm, beatsPerBar, accent } = settings;

  return (
    <Card className={styles.metronome}>
      <BeatIndicator beatsPerBar={beatsPerBar} current={current} accent={accent} />

      <div className={styles.bpmDisplay}>
        <output className={styles.bpm} aria-live="off">
          {faNum(bpm)}
        </output>
        <span className={styles.bpmUnit}>
          <bdi dir="ltr">BPM</bdi> · ضرب در دقیقه
        </span>
      </div>

      {/* Number line is left-to-right: decrease on the left, increase on the right */}
      <div className={styles.steps} dir="ltr">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            className={styles.stepBtn}
            onClick={() => setBpm((b) => b + s)}
            disabled={(s < 0 && bpm <= BPM_MIN) || (s > 0 && bpm >= BPM_MAX)}
            aria-label={`${s > 0 ? "افزایش" : "کاهش"} ${faNum(Math.abs(s))}`}
          >
            {s > 0 ? "+" : "−"}
            {faNum(Math.abs(s))}
          </button>
        ))}
      </div>

      <input
        type="range"
        dir="ltr"
        min={BPM_MIN}
        max={BPM_MAX}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className={styles.slider}
        aria-label="تمپو"
      />

      {stopReason && (
        <p className={styles.notice} role="status">
          <AlertTriangle size={18} aria-hidden />
          {stopReason === "hidden"
            ? "پخش متوقف شد چون صفحه از دید خارج شد (تب عوض شد یا صفحه قفل شد)."
            : "صدا در این مرورگر در دسترس نیست. دوباره روی شروع بزن یا صفحه را دوباره باز کن."}
        </p>
      )}

      {/* Right after the tempo controls, so it's visible without scrolling on short phones */}
      <Button variant={playing ? "secondary" : "primary"} block className={styles.startBtn} onClick={toggle}>
        {playing ? <Square size={20} aria-hidden /> : <Play size={20} aria-hidden />}
        {playing ? "توقف" : "شروع"}
      </Button>

      <fieldset className={styles.field}>
        <legend className={styles.label}>تعداد ضرب در میزان</legend>
        <div className={styles.segmented} dir="ltr">
          {BEAT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={styles.segment}
              aria-pressed={n === beatsPerBar}
              onClick={() => setBeatsPerBar(n)}
            >
              {faNum(n)}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.toggle}>
        <input type="checkbox" checked={accent} onChange={(e) => setAccent(e.target.checked)} />
        تأکید روی ضرب اول (بلندتر و زیرتر)
      </label>
    </Card>
  );
}
