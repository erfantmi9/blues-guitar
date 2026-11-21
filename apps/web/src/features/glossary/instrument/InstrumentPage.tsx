import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router";
import type { GlossaryTerm, StringNumber } from "@bg/shared";
import { Check, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RichText } from "@/features/lessons/components/RichText";
import { faNum } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { getTerm, termHref } from "../content";
import { ProgressBar } from "../components/ProgressBar";
import { TermCard } from "../components/TermCard";
import { playTermNotes } from "../playNotes";
import { useGlossaryProgress } from "../progress";
import { ViewArt, type ArtState } from "./art";
import {
  defaultViewOf,
  getView,
  instrumentHref,
  mapPartIds,
  PICKUPS,
  SWITCH_POSITIONS,
  VIEWS,
  type Hotspot,
  type MapView,
  type ViewId,
} from "./parts";
import styles from "./instrument.module.css";

type SwitchPos = 1 | 2 | 3 | 4 | 5;
const POSITIONS: SwitchPos[] = [1, 2, 3, 4, 5];
/** Parts whose tap starts an animation */
const ANIMATED = new Set(["tuning-peg", "string", "volume-knob", "tone-knob", "tremolo-arm", "gain", "amp-volume", "eq"]);
const KNOBS = new Set(["volume-knob", "tone-knob", "gain", "amp-volume", "eq"]);

const plain = (s: string) => s.replace(/`/g, "");
const hotspotKey = (h: Hotspot) => `${h.part}:${h.instance ?? 0}`;
const hasPart = (v: MapView, part: string) => v.hotspots.some((h) => h.part === part);

function viewWidth(v: MapView): string {
  const byHeight = v.maxHeightVh ? `max(${v.minWidth}px, ${((v.maxHeightVh * v.w) / v.h).toFixed(2)}vh)` : null;
  return `min(100%, ${v.maxWidth}px${byHeight ? `, ${byHeight}` : ""})`;
}

/** /glossary/instrument?view=<full|head|body|amp>&part=<term id> */
export function InstrumentPage() {
  const [params, setParams] = useSearchParams();
  const partParam = params.get("part");
  const selected = partParam && mapPartIds.includes(partParam) && getTerm(partParam) ? partParam : null;
  const view = getView(params.get("view")) ?? getView((selected && defaultViewOf(selected)) || "full")!;

  const { progress, toggleLearned } = useGlossaryProgress();
  const learned = useMemo(() => new Set(progress.learned), [progress.learned]);
  const learnedOnMap = mapPartIds.filter((id) => learned.has(id)).length;

  const [anim, setAnim] = useState<{ key: string; n: number }>({ key: "", n: 0 });
  const [turned, setTurned] = useState<ReadonlySet<string>>(new Set());
  const [switchPos, setSwitchPos] = useState<SwitchPos>(3);
  /** The instance tapped last (e.g. "string:6"): only it glows. Chosen from the list or a link: all instances glow. */
  const [tapped, setTapped] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const mapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const select = (part: string | null, viewId: ViewId = view.id, fromTap = false) => {
    if (!fromTap) setTapped(null);
    setParams(part ? { view: viewId, part } : { view: viewId }, { replace: true });
  };

  // Selection changed from a link (prerequisite chip, list, «نشانش بده»): bring the map into view if it is off screen
  useEffect(() => {
    const box = mapRef.current?.getBoundingClientRect();
    if (!box || !selected) return;
    if (box.bottom < 80 || box.top > window.innerHeight) mapRef.current!.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const tap = (h: Hotspot) => {
    select(h.part, view.id, true);
    setTapped(hotspotKey(h));
    // Phone: the card is under the map. If it is below the fold, scroll just enough to show its top,
    // so most of the map stays in view.
    requestAnimationFrame(() => {
      const top = cardRef.current?.getBoundingClientRect().top;
      if (top !== undefined && top > window.innerHeight - 140)
        window.scrollBy({ top: top - (window.innerHeight - 240), behavior: reducedMotion ? "auto" : "smooth" });
    });
    const key = hotspotKey(h);
    if (ANIMATED.has(h.part)) setAnim((a) => ({ key, n: a.n + 1 }));
    if (KNOBS.has(h.part)) setTurned((t) => new Set(t).add(key));
    if (h.part === "string" && h.instance) playTermNotes([{ string: h.instance as StringNumber, fret: 0 }]);
    if (h.part === "pickup-selector") setSwitchPos((p) => ((p % 5) + 1) as SwitchPos);
  };

  const lit = (part: string) => {
    if (!selected) return false;
    if (selected === "electric-guitar" || part === selected) return true;
    // Show the switch together with the pickups it turns on
    if ((selected === "pickup-selector" || selected === "single-coil") && part === "pickup") return true;
    return false;
  };
  const litPickups = view.id === "body" ? SWITCH_POSITIONS[switchPos] : [];
  const st: ArtState = {
    on: lit,
    anim: (key) => (anim.key === key ? (anim.n % 2 ? "a" : "b") : undefined),
    turned: (key) => turned.has(key),
    switchPosition: switchPos,
    litPickups,
    uid,
  };

  const ofSelected = selected ? view.hotspots.filter((h) => h.part === selected) : [];
  const glows = ofSelected.some((h) => hotspotKey(h) === tapped) ? ofSelected.filter((h) => hotspotKey(h) === tapped) : ofSelected;
  const term = selected ? getTerm(selected) : undefined;

  /** In the card: a chip for a part on the map selects it here; otherwise it opens the term on its level page */
  const hrefFor = (t: GlossaryTerm) =>
    mapPartIds.includes(t.id) ? instrumentHref(t.id, hasPart(view, t.id) ? view.id : undefined) : termHref(t);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    // RTL: the right arrow goes to the previous tab
    const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = VIEWS[(i + step + VIEWS.length) % VIEWS.length]!;
    switchView(next.id);
    document.getElementById(`${uid}-tab-${next.id}`)?.focus();
  };
  const switchView = (id: ViewId) => select(selected && hasPart(getView(id)!, selected) ? selected : null, id);

  return (
    <>
      <Link to="/glossary" className={styles.back}>
        <ChevronRight size={18} aria-hidden />
        مسیر اصطلاحات
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>نقشه‌ی ساز</h1>
        <p className={styles.subtitle}>روی هر قطعه بزن تا اسمش، کارش و کجا بهش می‌رسی را ببینی.</p>
      </header>

      <div className={styles.progressRow}>
        <span>
          {faNum(learnedOnMap)} از {faNum(mapPartIds.length)} قطعه یاد گرفته شد
        </span>
        <ProgressBar value={learnedOnMap} total={mapPartIds.length} label="قطعه‌های یاد گرفته" />
      </div>

      <div className={styles.tabs} role="tablist" aria-label="نماها">
        {VIEWS.map((v, i) => (
          <button
            key={v.id}
            id={`${uid}-tab-${v.id}`}
            type="button"
            role="tab"
            aria-selected={v.id === view.id}
            aria-controls={`${uid}-panel`}
            tabIndex={v.id === view.id ? 0 : -1}
            className={styles.tab}
            onClick={() => switchView(v.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.mapCol} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view.id}`}>
          <div
            ref={mapRef}
            key={view.id}
            className={styles.map}
            data-dim={(selected && selected !== "electric-guitar") || undefined}
            style={{ width: viewWidth(view), aspectRatio: `${view.w} / ${view.h}` } as CSSProperties}
            dir="ltr"
          >
            <ViewArt view={view.id} st={st} glows={glows} />
            <div className={styles.hotspots}>
              {view.hotspots.map((h) => {
                const t = getTerm(h.part);
                if (!t) return null;
                const on = glows.includes(h);
                return (
                  <button
                    key={hotspotKey(h)}
                    type="button"
                    className={styles.hotspot}
                    style={{ left: `${(h.x / view.w) * 100}%`, top: `${(h.y / view.h) * 100}%` }}
                    aria-label={`${plain(t.fa)} (${t.term})${h.detail ? `، ${h.detail}` : ""}`}
                    aria-pressed={on}
                    data-learned={learned.has(h.part) || undefined}
                    onClick={() => tap(h)}
                  >
                    <span className={styles.pin} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>

          {view.id === "body" && (selected === "pickup-selector" || selected === "pickup" || selected === "single-coil") && (
            <SwitchControl position={switchPos} onChange={setSwitchPos} />
          )}
          {view.id === "amp" && selected === "gain" && <GainMeter full={turned.has("gain:1")} run={st.anim("gain:1")} />}
        </div>

        <div className={styles.cardCol} aria-live="polite" ref={cardRef}>
          {term ? (
            <ul className={styles.cardList}>
              <TermCard
                key={term.id}
                term={term}
                learned={learned}
                onToggleLearned={toggleLearned}
                targeted={false}
                hrefFor={hrefFor}
                showOnMap={false}
              />
            </ul>
          ) : (
            <Card className={styles.hint}>یک نقطه‌ی روی نقشه را لمس کن، یا از فهرست زیر یک قطعه را انتخاب کن.</Card>
          )}
        </div>
      </div>

      <section className={styles.listSection} aria-labelledby={`${uid}-list`}>
        <h2 id={`${uid}-list`} className={styles.listTitle}>
          همه‌ی قطعه‌ها
        </h2>
        <ul className={styles.list}>
          {mapPartIds.map((id) => {
            const t = getTerm(id);
            if (!t) return null;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={styles.listItem}
                  aria-pressed={id === selected}
                  onClick={() => select(id, hasPart(view, id) ? view.id : defaultViewOf(id))}
                >
                  <span className={styles.listFa}>
                    <RichText text={t.fa} />
                  </span>
                  <bdi dir="ltr" className={styles.listEn}>
                    {t.term}
                  </bdi>
                  {learned.has(id) && <Check size={16} className={styles.listCheck} aria-label="یاد گرفته‌ای" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function SwitchControl({ position, onChange }: { position: SwitchPos; onChange: (p: SwitchPos) => void }) {
  const active = PICKUPS.filter((p) => SWITCH_POSITIONS[position].includes(p.name));
  return (
    <div className={styles.switchBox}>
      <div className={styles.segments} role="radiogroup" aria-label="حالت سوییچ پیکاپ">
        {POSITIONS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={p === position}
            className={styles.segment}
            onClick={() => onChange(p)}
          >
            {faNum(p)}
          </button>
        ))}
      </div>
      <p className={styles.switchCaption} aria-live="polite">
        حالت {faNum(position)}: {active.map((p) => `${p.fa} (${p.tone})`).join(" + ")}
      </p>
    </div>
  );
}

function GainMeter({ full, run }: { full: boolean; run: "a" | "b" | undefined }) {
  return (
    <div className={styles.gainBox}>
      <span className={styles.gainLabel}>تمیز ← کثیف</span>
      <div className={styles.gainTrack} role="meter" aria-label="میزان گین" aria-valuemin={0} aria-valuemax={100} aria-valuenow={full ? 100 : 0}>
        <div className={styles.gainFill} data-full={full || undefined} data-anim={run} />
      </div>
    </div>
  );
}
