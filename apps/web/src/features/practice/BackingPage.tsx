import { AlertTriangle, Play, RotateCcw, Square } from "lucide-react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { INSTRUMENTS, SLOTS_PER_BEAT, type BackingView, type Instrument } from "@/lib/audio/backing";
import { RichText } from "@/features/lessons/components/RichText";
import { faNum } from "@/lib/format";
import { A_MINOR_PENTATONIC_POS1 } from "@/lib/music/shapes";
import { BeatIndicator } from "./components/BeatIndicator";
import { LatencySetting } from "./components/TabPlayer";
import { backingTrackProblems, backingTracks } from "./content/backingTracks";
import { useBackingSettings } from "./backingSettings";
import { useExerciseSettings } from "./exerciseSettings";
import { useBackingTrack } from "./useBackingTrack";
import styles from "./backing.module.css";
import tabStyles from "./tabPlayer.module.css";

const STEPS = [-5, -1, +1, +5];
const SHAPE = [...A_MINOR_PENTATONIC_POS1];
const INSTRUMENT_LABEL: Record<Instrument, string> = { drums: "درام", bass: "باس", chords: "آکورد" };
const pct = (v: number) => Math.round(v * 100);

export function BackingPage() {
  const track = backingTracks[0];
  return (
    <>
      <PageHeader title="بکینگ‌ترک" subtitle="شافل بلوز برای نواختن با گیتار" />
      {import.meta.env.DEV && backingTrackProblems.length > 0 && (
        <Card className={tabStyles.devErrors} role="alert">
          <strong>خطای محتوای بکینگ‌ترک (فقط در حالت توسعه دیده می‌شود)</strong>
          {backingTrackProblems.map((p) => (
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
      {track ? <BackingPlayer track={track} /> : <Card>هنوز بکینگ‌ترکی وجود ندارد.</Card>}
    </>
  );
}

function BackingPlayer({ track }: { track: (typeof backingTracks)[number] }) {
  const { settings, stepBpm, setBpm, resetBpm, setCountIn, setChannel, setMaster } = useBackingSettings();
  const exerciseSettings = useExerciseSettings();
  const visualOffsetMs = exerciseSettings.settings.visualOffsetMs;
  const bpm = settings.bpmById[track.id] ?? track.bpmDefault;
  const { playing, view, stopReason, toggle } = useBackingTrack(track, {
    bpm,
    countIn: settings.countIn,
    mix: settings.mix,
    visualOffsetMs,
  });

  const bar = view?.phase === "play" ? view.bar : null;
  const chordName = track.bars[bar ?? 0]?.chord.name ?? "";
  // Pulse once per beat (not on every triplet slot): n changes only when a new beat starts
  const current = view ? { beat: view.beat, n: Math.floor(view.tick / SLOTS_PER_BEAT) } : null;

  return (
    <Card className={styles.player}>
      <div>
        <h2 className={tabStyles.title}>{track.title}</h2>
        {track.description && (
          <p className={tabStyles.description}>
            <RichText text={track.description} />
          </p>
        )}
      </div>

      {/* Top of the page and sticky under the header: reachable with one thumb on a phone */}
      <div className={tabStyles.startBar}>
        <Button variant={playing ? "secondary" : "primary"} block className={tabStyles.startBtn} onClick={toggle}>
          {playing ? <Square size={22} aria-hidden /> : <Play size={22} aria-hidden />}
          {playing ? "توقف" : settings.countIn ? "شروع (با یک میزان شمارش)" : "شروع"}
        </Button>
      </div>

      {stopReason && (
        <p className={tabStyles.notice} role="status">
          <AlertTriangle size={18} aria-hidden />
          {stopReason === "hidden"
            ? "پخش متوقف شد چون صفحه از دید خارج شد (تب عوض شد یا صفحه قفل شد)."
            : "صدا در این مرورگر در دسترس نیست. دوباره روی شروع بزن یا صفحه را دوباره باز کن."}
        </p>
      )}

      <Display track={track} view={view} chordName={chordName} />
      <BeatIndicator beatsPerBar={track.beatsPerBar} current={current} accent />

      <div className={tabStyles.bpmRow}>
        <div className={tabStyles.bpmSteps} dir="ltr">
          {STEPS.slice(0, 2).map((s) => (
            <button
              key={s}
              type="button"
              className={tabStyles.stepBtn}
              onClick={() => stepBpm(track, s)}
              disabled={bpm <= track.bpmMin}
              aria-label={`کاهش ${faNum(Math.abs(s))}`}
            >
              −{faNum(Math.abs(s))}
            </button>
          ))}
          <output className={tabStyles.bpmValue}>
            {faNum(bpm)}
            <small>
              <bdi dir="ltr">BPM</bdi>
            </small>
          </output>
          {STEPS.slice(2).map((s) => (
            <button
              key={s}
              type="button"
              className={tabStyles.stepBtn}
              onClick={() => stepBpm(track, s)}
              disabled={bpm >= track.bpmMax}
              aria-label={`افزایش ${faNum(s)}`}
            >
              +{faNum(s)}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => resetBpm(track.id)} disabled={bpm === track.bpmDefault} title="بازنشانی تمپو">
          <RotateCcw size={16} aria-hidden />
          پیش‌فرض ({faNum(track.bpmDefault)})
        </Button>
      </div>
      <input
        type="range"
        dir="ltr"
        min={track.bpmMin}
        max={track.bpmMax}
        value={bpm}
        onChange={(e) => setBpm(track, Number(e.target.value))}
        className={styles.slider}
        aria-label="تمپو"
      />

      <fieldset className={styles.mixer}>
        <legend className={styles.legend}>سازها</legend>
        {INSTRUMENTS.map((name) => {
          const ch = settings.mix[name];
          return (
            <div key={name} className={styles.channel}>
              <label className={tabStyles.toggle}>
                <input type="checkbox" checked={ch.on} onChange={(e) => setChannel(name, { on: e.target.checked })} />
                {INSTRUMENT_LABEL[name]}
              </label>
              <input
                type="range"
                dir="ltr"
                min={0}
                max={100}
                value={pct(ch.volume)}
                disabled={!ch.on}
                onChange={(e) => setChannel(name, { volume: Number(e.target.value) / 100 })}
                className={styles.slider}
                aria-label={`حجم ${INSTRUMENT_LABEL[name]}`}
              />
            </div>
          );
        })}
        <div className={styles.channel}>
          <span className={styles.channelLabel}>حجم کل</span>
          <input
            type="range"
            dir="ltr"
            min={0}
            max={100}
            value={pct(settings.mix.master)}
            onChange={(e) => setMaster(Number(e.target.value) / 100)}
            className={styles.slider}
            aria-label="حجم کل"
          />
        </div>
      </fieldset>

      <label className={tabStyles.toggle}>
        <input type="checkbox" checked={settings.countIn} onChange={(e) => setCountIn(e.target.checked)} />
        شمارش ورودی (یک میزان های‌هت)
      </label>

      <figure className={styles.figure}>
        <Fretboard readOnly highlightedNotes={SHAPE} ariaLabel="A Minor Pentatonic پوزیشن ۱" />
        <figcaption className={styles.caption}>
          <bdi dir="ltr">A Minor Pentatonic</bdi> پوزیشن ۱. نقطه‌های قرمز ریشه (<bdi dir="ltr">A</bdi>) هستند؛ عدد هر
          نقطه شماره‌ی انگشت است.
        </figcaption>
      </figure>

      <LatencySetting
        value={visualOffsetMs}
        onChange={exerciseSettings.setVisualOffsetMs}
        onStep={exerciseSettings.stepVisualOffsetMs}
      />
    </Card>
  );
}

/** Chord name, count-in and the bars of the track (left to right, like written music) */
function Display({ track, view, chordName }: { track: (typeof backingTracks)[number]; view: BackingView | null; chordName: string }) {
  const countIn = view?.phase === "count-in" ? view.beat + 1 : null;
  const bar = view?.phase === "play" ? view.bar : null;
  return (
    <div className={styles.display}>
      <div className={styles.chordRow}>
        <span className={styles.chord} dir="ltr" data-dim={countIn !== null ? "" : undefined}>
          {chordName}
        </span>
        <span className={styles.status} aria-live="polite">
          {countIn !== null
            ? `شمارش ${faNum(countIn)}`
            : bar !== null
              ? `میزان ${faNum(bar + 1)} از ${faNum(track.bars.length)}`
              : `${faNum(track.bars.length)} میزان · شافل`}
        </span>
      </div>
      <ol className={styles.bars} dir="ltr" aria-label="میزان‌ها">
        {track.bars.map((b, i) => (
          <li key={i} className={styles.bar} data-active={i === bar ? "" : undefined} aria-current={i === bar ? "true" : undefined}>
            <span className={styles.barNum}>{faNum(i + 1)}</span>
            {b.chord.name}
          </li>
        ))}
      </ol>
    </div>
  );
}
