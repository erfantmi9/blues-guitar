/**
 * SVG drawings of the instrument map. A simple, original double-cutaway (Strat-style) guitar and a small amp:
 * no copied images or logos. Colors come only from design tokens (wood, fret wire, nut, inlay, accent).
 * Each part is a <g data-part="<term id>">, so the page can light the selected part and dim the rest.
 * Animations are CSS (instrument.module.css) on transform/opacity only, started via data-anim="a|b".
 */
import type { ReactNode } from "react";
import type { StringNumber } from "@bg/shared";
import {
  AMP,
  AMP_INPUT,
  AMP_KNOBS,
  AMP_SPEAKER,
  BODY,
  BODY_KNOBS,
  bodyStringX,
  FULL,
  FULL_DOTS,
  FULL_DOUBLE_DOT,
  fullFretY,
  GUITAR_JACK,
  HEAD,
  headNutX,
  headPegY,
  PICKUPS,
  STRINGS,
  SWITCH_SLOT,
  TREMOLO_PIVOT,
  type PickupName,
  type ViewId,
} from "./parts";
import styles from "./instrument.module.css";

export type ArtState = {
  /** Is the part lit (selected, or shown together with the selection)? */
  on: (part: string) => boolean;
  /** Animation run for one drawn element: "a"/"b" alternate so a repeat tap restarts it */
  anim: (key: string) => "a" | "b" | undefined;
  /** Knobs that were turned up and stay up */
  turned: (key: string) => boolean;
  switchPosition: 1 | 2 | 3 | 4 | 5;
  litPickups: readonly PickupName[];
  /** Unique prefix for gradient ids */
  uid: string;
};

const isWound = (s: StringNumber) => s >= 3;
const stringColor = (s: StringNumber) => (isWound(s) ? "var(--string-wound)" : "var(--string-plain)");

function P({ id, st, children }: { id: string; st: ArtState; children: ReactNode }) {
  return (
    <g data-part={id} data-on={st.on(id) || undefined} className={styles.part}>
      {children}
    </g>
  );
}

/** Shared gradients: the selection glow and the body finish */
function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <radialGradient id={`${uid}-glow`}>
        <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.55 }} />
        <stop offset="45%" style={{ stopColor: "var(--accent)", stopOpacity: 0.28 }} />
        <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
      </radialGradient>
      <radialGradient id={`${uid}-burst`} cx="50%" cy="55%" r="60%">
        <stop offset="0%" style={{ stopColor: "var(--accent-hi)" }} />
        <stop offset="55%" style={{ stopColor: "var(--accent-lo)" }} />
        <stop offset="100%" style={{ stopColor: "var(--wood-1)" }} />
      </radialGradient>
    </defs>
  );
}

function Knob({ x, y, r, animKey, st, pointer = "var(--wood-1)", fill = "var(--inlay)" }: {
  x: number; y: number; r: number; animKey: string; st: ArtState; pointer?: string; fill?: string;
}) {
  return (
    <g className={styles.knob} data-anim={st.anim(animKey)} data-turned={st.turned(animKey) || undefined}>
      <circle cx={x} cy={y} r={r} fill={fill} stroke="var(--dot-edge)" strokeWidth={1.5} />
      <line x1={x} y1={y} x2={x} y2={y - r + 3} stroke={pointer} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

// ---------- Full guitar ----------

const FULL_BODY =
  "M100 515 C40 515 8 490 8 440 C8 400 26 385 26 360 C26 330 10 300 22 272 C32 250 52 248 62 262 " +
  "C72 276 80 292 86 300 L114 300 C120 292 128 282 140 276 C150 270 166 272 170 286 " +
  "C176 306 172 330 174 350 C176 372 192 396 192 440 C192 490 160 515 100 515 Z";
const FULL_HEAD =
  "M86 86 L84 72 C74 60 70 30 72 14 C74 4 96 2 112 6 C126 10 128 22 118 30 C112 36 132 44 134 58 C136 72 120 78 114 86 Z";
const FULL_GUARD =
  "M60 300 C40 300 30 330 34 360 C38 400 30 430 50 452 C70 472 100 470 120 466 L150 470 C170 470 178 440 172 410 " +
  "C168 380 176 340 160 312 C150 298 130 300 114 300 Z";

function FullArt({ st }: { st: ArtState }) {
  const frets = Array.from({ length: 21 }, (_, i) => fullFretY(i + 1)).filter((y) => y < 300);
  return (
    <>
      <P id="body" st={st}>
        <path d={FULL_BODY} fill={`url(#${st.uid}-burst)`} stroke="var(--dot-edge)" strokeWidth={1.5} />
      </P>
      <P id="pickguard" st={st}>
        <path d={FULL_GUARD} fill="var(--nut)" stroke="var(--dot-edge)" strokeWidth={1} />
      </P>
      <P id="pickup" st={st}>
        {[340, 372].map((y) => (
          <rect key={y} x={82} y={y - 4.5} width={36} height={9} rx={4.5} fill="var(--inlay)" stroke="var(--dot-edge)" />
        ))}
        <rect x={82} y={399.5} width={36} height={9} rx={4.5} fill="var(--inlay)" stroke="var(--dot-edge)" transform="rotate(-8 100 404)" />
      </P>
      <P id="pickup-selector" st={st}>
        <line x1={138} y1={392} x2={132} y2={380} stroke="var(--wood-1)" strokeWidth={3} strokeLinecap="round" />
      </P>
      <P id="volume-knob" st={st}>
        <circle cx={142} cy={404} r={5.5} fill="var(--inlay)" stroke="var(--dot-edge)" />
      </P>
      <P id="tone-knob" st={st}>
        <circle cx={152} cy={421} r={5.5} fill="var(--inlay)" stroke="var(--dot-edge)" />
        <circle cx={160} cy={438} r={5.5} fill="var(--inlay)" stroke="var(--dot-edge)" />
      </P>
      <P id="bridge" st={st}>
        <rect x={80} y={444} width={40} height={12} rx={2} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
      <P id="tremolo-arm" st={st}>
        <path d="M118 452 C126 460 132 468 140 480" fill="none" stroke="var(--fret-wire)" strokeWidth={2.2} strokeLinecap="round" />
      </P>
      <P id="output-jack" st={st}>
        <ellipse cx={166} cy={458} rx={6} ry={4} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
      <P id="strap-button" st={st}>
        <circle cx={100} cy={512} r={3.5} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
        <circle cx={40} cy={255} r={3} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
      <P id="neck" st={st}>
        <rect x={FULL.neckLeft - 2} y={80} width={32} height={224} rx={3} fill="var(--wood-2)" />
      </P>
      <P id="headstock" st={st}>
        <path d={FULL_HEAD} fill="var(--wood-2)" stroke="var(--dot-edge)" strokeWidth={1} />
      </P>
      <P id="tuning-peg" st={st}>
        {[18, 29, 40, 51, 62, 73].map((y) => (
          <g key={y}>
            <ellipse cx={64} cy={y} rx={5} ry={3.4} fill="var(--fret-wire)" />
            <circle cx={80} cy={y} r={2.2} fill="var(--fret-wire)" />
          </g>
        ))}
      </P>
      <P id="fretboard" st={st}>
        <rect x={FULL.neckLeft + 1} y={FULL.nutY + 2} width={26} height={212} fill="var(--wood-1)" />
      </P>
      <P id="fret" st={st}>
        {frets.map((y) => (
          <line key={y} x1={FULL.neckLeft + 1} x2={FULL.neckRight - 1} y1={y} y2={y} stroke="var(--fret-wire)" strokeWidth={1} />
        ))}
      </P>
      <P id="fret-marker" st={st}>
        {FULL_DOTS.map((y) => (
          <circle key={y} cx={100} cy={y} r={2.4} fill="var(--inlay)" />
        ))}
        <circle cx={95} cy={FULL_DOUBLE_DOT} r={2.4} fill="var(--inlay)" />
        <circle cx={105} cy={FULL_DOUBLE_DOT} r={2.4} fill="var(--inlay)" />
      </P>
      <P id="nut" st={st}>
        <rect x={FULL.neckLeft} y={FULL.nutY - 2.5} width={28} height={5} rx={1} fill="var(--nut)" stroke="var(--dot-edge)" strokeWidth={0.6} />
      </P>
      <P id="string" st={st}>
        {STRINGS.map((s, i) => (
          <line key={s} x1={89 + i * 4.4} y1={FULL.nutY} x2={87 + i * 5.2} y2={450} stroke={stringColor(s)} strokeWidth={isWound(s) ? 0.9 : 0.6} />
        ))}
      </P>
    </>
  );
}

// ---------- Headstock close-up ----------

const HEAD_PATH =
  "M94 300 L72 52 C70 26 84 12 108 12 C138 12 160 26 158 46 C156 62 140 70 150 84 C172 110 196 150 190 200 C186 240 160 270 146 300 Z";

function HeadArt({ st }: { st: ArtState }) {
  return (
    <>
      <P id="neck" st={st}>
        <rect x={88} y={296} width={66} height={70} fill="var(--wood-2)" />
      </P>
      <P id="fretboard" st={st}>
        <rect x={91} y={304} width={60} height={62} fill="var(--wood-1)" />
      </P>
      <P id="fret" st={st}>
        <line x1={91} x2={151} y1={HEAD.nutY + 40} y2={HEAD.nutY + 40} stroke="var(--fret-wire)" strokeWidth={3} />
      </P>
      <P id="headstock" st={st}>
        <path d={HEAD_PATH} fill="var(--wood-2)" stroke="var(--dot-edge)" strokeWidth={1.5} />
      </P>
      <P id="tuning-peg" st={st}>
        {STRINGS.map((s) => {
          const y = headPegY(s);
          return (
            <g key={s}>
              <rect x={HEAD.keyX + 8} y={y - 2.5} width={26} height={5} fill="var(--fret-wire)" />
              <g className={styles.peg} data-anim={st.anim(`tuning-peg:${s}`)}>
                <ellipse cx={HEAD.keyX} cy={y} rx={14} ry={9} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
                <line x1={HEAD.keyX - 8} x2={HEAD.keyX + 8} y1={y} y2={y} stroke="var(--dot-edge)" strokeWidth={1.5} />
              </g>
              <circle cx={HEAD.postX} cy={y} r={6} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
              <circle cx={HEAD.postX} cy={y} r={2.2} fill="var(--wood-1)" />
            </g>
          );
        })}
      </P>
      <P id="nut" st={st}>
        <rect x={90} y={HEAD.nutY - 4} width={62} height={8} rx={2} fill="var(--nut)" stroke="var(--dot-edge)" />
      </P>
      <P id="string" st={st}>
        {STRINGS.map((s) => (
          <g key={s} className={styles.string} data-anim={st.anim(`string:${s}`)}>
            <line x1={headNutX(s)} y1={HEAD.nutY} x2={HEAD.postX} y2={headPegY(s)} stroke={stringColor(s)} strokeWidth={isWound(s) ? 2 : 1.3} />
            <line x1={headNutX(s)} y1={HEAD.nutY} x2={headNutX(s)} y2={HEAD.h} stroke={stringColor(s)} strokeWidth={isWound(s) ? 2 : 1.3} />
          </g>
        ))}
      </P>
    </>
  );
}

// ---------- Body close-up ----------

const BODY_PATH =
  "M-40 330 V-40 H52 C70 10 104 40 132 40 H188 C216 40 250 10 268 -40 H360 V330 C340 380 250 398 160 398 C70 398 -20 380 -40 330 Z";
const GUARD_PATH =
  "M70 30 C96 30 120 44 132 44 H188 C210 44 240 40 262 60 C300 96 320 180 316 250 C314 300 316 340 286 356 " +
  "C260 370 226 344 200 300 L196 282 H124 C110 300 90 320 60 318 C30 316 24 280 34 240 C44 200 40 120 52 70 C56 48 60 30 70 30 Z";

function BodyArt({ st }: { st: ArtState }) {
  const p = st.switchPosition;
  const dx = ((SWITCH_SLOT.x5 - SWITCH_SLOT.x1) * (p - 1)) / 4;
  const dy = ((SWITCH_SLOT.y5 - SWITCH_SLOT.y1) * (p - 1)) / 4;
  return (
    <>
      <P id="body" st={st}>
        <path d={BODY_PATH} fill={`url(#${st.uid}-burst)`} stroke="var(--dot-edge)" strokeWidth={2} />
      </P>
      <P id="neck" st={st}>
        <rect x={132} y={-10} width={56} height={54} fill="var(--wood-2)" />
      </P>
      <P id="fretboard" st={st}>
        <rect x={136} y={-10} width={48} height={52} fill="var(--wood-1)" />
        {[4, 28].map((y) => (
          <line key={y} x1={136} x2={184} y1={y} y2={y} stroke="var(--fret-wire)" strokeWidth={2} />
        ))}
      </P>
      <P id="pickguard" st={st}>
        <path d={GUARD_PATH} fill="var(--nut)" stroke="var(--dot-edge)" strokeWidth={1.5} />
      </P>
      <P id="single-coil" st={st}>
        <path d="M122 80 H114 V205 H122" fill="none" stroke="var(--accent-2)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </P>
      <P id="pickup" st={st}>
        {PICKUPS.map((pu) => (
          <g key={pu.name} transform={pu.name === "bridge" ? `rotate(-8 160 ${pu.y})` : undefined}>
            <rect x={124} y={pu.y - 8} width={72} height={16} rx={8} fill="var(--inlay)" stroke="var(--dot-edge)" strokeWidth={1.2} />
            <rect
              x={124}
              y={pu.y - 8}
              width={72}
              height={16}
              rx={8}
              fill="var(--accent)"
              className={styles.lit}
              data-lit={st.litPickups.includes(pu.name) || undefined}
            />
            {STRINGS.map((s) => (
              <circle key={s} cx={bodyStringX(s)} cy={pu.y} r={2.2} fill="var(--fret-wire)" stroke="var(--dot-edge)" strokeWidth={0.6} />
            ))}
          </g>
        ))}
      </P>
      <P id="pickup-selector" st={st}>
        <line
          x1={SWITCH_SLOT.x1}
          y1={SWITCH_SLOT.y1}
          x2={SWITCH_SLOT.x5}
          y2={SWITCH_SLOT.y5}
          stroke="var(--wood-1)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <g className={styles.lever} style={{ transform: `translate(${dx}px, ${dy}px)` }}>
          <rect x={SWITCH_SLOT.x1 - 7} y={SWITCH_SLOT.y1 - 5} width={14} height={10} rx={5} fill="var(--inlay)" stroke="var(--dot-edge)" />
        </g>
      </P>
      {BODY_KNOBS.map((k) => (
        <P key={`${k.part}${k.instance}`} id={k.part} st={st}>
          <Knob x={k.x} y={k.y} r={12} animKey={`${k.part}:${k.instance}`} st={st} />
        </P>
      ))}
      <P id="bridge" st={st}>
        <rect x={128} y={252} width={64} height={22} rx={3} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
        {STRINGS.map((s) => (
          <rect key={s} x={bodyStringX(s) - 2.5} y={256} width={5} height={10} rx={1} fill="var(--inlay)" />
        ))}
      </P>
      <P id="tremolo-arm" st={st}>
        <g
          className={styles.tremolo}
          data-anim={st.anim("tremolo-arm:0")}
          style={{ transformOrigin: `${TREMOLO_PIVOT.x}px ${TREMOLO_PIVOT.y}px` }}
        >
          <path
            d={`M${TREMOLO_PIVOT.x} ${TREMOLO_PIVOT.y} C205 280 214 300 228 330`}
            fill="none"
            stroke="var(--fret-wire)"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={229} cy={333} r={4.5} fill="var(--inlay)" stroke="var(--dot-edge)" />
        </g>
      </P>
      <P id="output-jack" st={st}>
        <ellipse cx={296} cy={340} rx={13} ry={9} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
        <circle cx={296} cy={340} r={4} fill="var(--wood-1)" />
      </P>
      <P id="strap-button" st={st}>
        <circle cx={160} cy={391} r={5} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
      <P id="string" st={st}>
        {STRINGS.map((s) => (
          <line key={s} x1={bodyStringX(s)} y1={-10} x2={bodyStringX(s)} y2={262} stroke={stringColor(s)} strokeWidth={isWound(s) ? 1.6 : 1} />
        ))}
      </P>
    </>
  );
}

// ---------- Amp ----------

const CABLE_PATH = `M${GUITAR_JACK.x} ${GUITAR_JACK.y} C14 230 14 150 24 112 C34 78 50 ${AMP_INPUT.y} 72 ${AMP_INPUT.y}`;

function AmpArt({ st }: { st: ArtState }) {
  return (
    <>
      <P id="amp" st={st}>
        <rect x={62} y={12} width={274} height={278} rx={10} fill="var(--wood-1)" stroke="var(--border-strong)" strokeWidth={1.5} />
        <rect x={70} y={22} width={258} height={62} rx={4} fill="var(--fret-wire)" />
        <text x={AMP_INPUT.x} y={77} className={styles.ampLabel} textAnchor="middle">
          INPUT
        </text>
        {AMP_KNOBS.map((k) => (
          <text key={k.label} x={k.x} y={77} className={styles.ampLabel} textAnchor="middle">
            {k.label}
          </text>
        ))}
      </P>
      <P id="speaker" st={st}>
        <rect x={72} y={94} width={254} height={186} rx={6} fill="var(--wood-2)" />
        <circle cx={AMP_SPEAKER.x} cy={AMP_SPEAKER.y} r={AMP_SPEAKER.r} fill="var(--dot-edge)" />
        <circle cx={AMP_SPEAKER.x} cy={AMP_SPEAKER.y} r={AMP_SPEAKER.r - 14} fill="none" stroke="var(--wood-grain)" strokeWidth={2} />
        <circle cx={AMP_SPEAKER.x} cy={AMP_SPEAKER.y} r={AMP_SPEAKER.r - 36} fill="none" stroke="var(--wood-grain)" strokeWidth={2} />
        <circle cx={AMP_SPEAKER.x} cy={AMP_SPEAKER.y} r={20} fill="var(--wood-1)" stroke="var(--wood-grain)" strokeWidth={2} />
      </P>
      <P id="amp-input" st={st}>
        <circle cx={AMP_INPUT.x} cy={AMP_INPUT.y} r={8} fill="var(--wood-1)" />
        <circle cx={AMP_INPUT.x} cy={AMP_INPUT.y} r={3.5} fill="var(--inlay)" />
      </P>
      {AMP_KNOBS.map((k) => (
        <P key={k.label} id={k.part} st={st}>
          <Knob x={k.x} y={AMP.knobY} r={13} animKey={`${k.part}:${k.instance}`} st={st} fill="var(--wood-2)" pointer="var(--inlay)" />
        </P>
      ))}
      <P id="electric-guitar" st={st}>
        <path d="M0 222 C30 222 52 250 58 300 H0 Z" fill={`url(#${st.uid}-burst)`} stroke="var(--dot-edge)" />
      </P>
      <P id="output-jack" st={st}>
        <ellipse cx={GUITAR_JACK.x} cy={GUITAR_JACK.y} rx={11} ry={7.5} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
      <P id="cable" st={st}>
        <path d={CABLE_PATH} fill="none" stroke="var(--muted)" strokeWidth={4.5} strokeLinecap="round" />
        <rect x={64} y={AMP_INPUT.y - 4} width={16} height={8} rx={2} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
        <circle cx={GUITAR_JACK.x} cy={GUITAR_JACK.y} r={4} fill="var(--fret-wire)" stroke="var(--dot-edge)" />
      </P>
    </>
  );
}

export function ViewArt({ view, st, glows }: { view: ViewId; st: ArtState; glows: { x: number; y: number }[] }) {
  const size = { full: FULL, head: HEAD, body: BODY, amp: AMP }[view];
  return (
    <svg viewBox={`0 0 ${size.w} ${size.h}`} className={styles.svg} aria-hidden focusable="false">
      <Defs uid={st.uid} />
      <g className={styles.enter}>
        {view === "full" && <FullArt st={st} />}
        {view === "head" && <HeadArt st={st} />}
        {view === "body" && <BodyArt st={st} />}
        {view === "amp" && <AmpArt st={st} />}
      </g>
      {glows.map((p, i) => (
        <circle key={`${view}-${p.x}-${p.y}-${i}`} cx={p.x} cy={p.y} r={30} fill={`url(#${st.uid}-glow)`} className={styles.glow} />
      ))}
    </svg>
  );
}
