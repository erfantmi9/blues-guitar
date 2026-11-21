/**
 * Geometry of the instrument map (/glossary/instrument). Pure data: no React or DOM, so it is unit-tested.
 * Every hotspot's `part` is the id of a level-0 glossary term; the card text always comes from the glossary.
 * Coordinates are in each view's viewBox units; the SVG art (art.tsx) uses the same helpers.
 */
import type { StringNumber } from "@bg/shared";
import { faNum } from "@/lib/format";
import { noteAt } from "@/lib/music";

export type ViewId = "full" | "head" | "body" | "amp";

export type Hotspot = {
  part: string;
  x: number;
  y: number;
  /** For parts drawn more than once (strings, pegs, pickups, knobs) */
  instance?: number;
  /** Extra words for the accessible name, e.g. "سیم ۶، E" */
  detail?: string;
};

export type MapView = {
  id: ViewId;
  label: string;
  /** viewBox size */
  w: number;
  h: number;
  /** CSS width: min(100%, maxWidth, max(minWidth, maxHeightVh * w / h)) */
  maxWidth: number;
  minWidth: number;
  maxHeightVh?: number;
  hotspots: Hotspot[];
};

export const STRINGS: StringNumber[] = [6, 5, 4, 3, 2, 1];
const stringDetail = (s: StringNumber) => `سیم ${faNum(s)}، ${noteAt(s, 0)}`;

// ---------- Full guitar (vertical, head up) ----------

export const FULL = { w: 200, h: 520, nutY: 86, scaleLength: 328, neckLeft: 86, neckRight: 114 } as const;
/** y of fret n on the full view (real fret spacing: each fret is 2^(-1/12) of the remaining length) */
export const fullFretY = (n: number) => FULL.nutY + FULL.scaleLength * (1 - 2 ** (-n / 12));
const dotY = (n: number) => (fullFretY(n - 1) + fullFretY(n)) / 2;
export const FULL_DOTS = [3, 5, 7, 9].map((n) => dotY(n));
export const FULL_DOUBLE_DOT = dotY(12);

// ---------- Headstock close-up ----------

export const HEAD = { w: 240, h: 360, nutY: 300, postX: 88, keyX: 46 } as const;
/** x of string s on the nut (low E on the left, as you face the guitar) */
export const headNutX = (s: StringNumber) => 98 + (6 - s) * 9;
/** Six-in-line head: the low E peg is nearest the nut */
export const headPegY = (s: StringNumber) => 250 - (6 - s) * 38;
/** A point on string s between nut and post, 25 units below its post (pins are staggered this way) */
export function headStringPin(s: StringNumber): { x: number; y: number } {
  const y = headPegY(s) + 25;
  const x = HEAD.postX + ((headNutX(s) - HEAD.postX) * 25) / (HEAD.nutY - headPegY(s));
  return { x, y };
}

// ---------- Body close-up ----------

export const BODY = { w: 320, h: 400 } as const;
/** x of string s over the body */
export const bodyStringX = (s: StringNumber) => 145 + (6 - s) * 6;
export const PICKUPS = [
  { name: "neck", y: 90, fa: "گردن", tone: "گرم/نرم" },
  { name: "middle", y: 140, fa: "وسط", tone: "میانه" },
  { name: "bridge", y: 195, fa: "بریج", tone: "تیز/روشن" },
] as const;
export type PickupName = (typeof PICKUPS)[number]["name"];
/** Five-way switch: 1 = bridge … 5 = neck (lever towards the neck = neck pickup) */
export const SWITCH_POSITIONS: Record<1 | 2 | 3 | 4 | 5, PickupName[]> = {
  1: ["bridge"],
  2: ["bridge", "middle"],
  3: ["middle"],
  4: ["middle", "neck"],
  5: ["neck"],
};
/** Selector slot: position 1 at the bottom end (away from the neck), 5 at the top */
export const SWITCH_SLOT = { x1: 225, y1: 168, x5: 205, y5: 132 } as const;
export const BODY_KNOBS = [
  { part: "volume-knob", x: 215, y: 198, instance: 1 },
  { part: "tone-knob", x: 255, y: 238, instance: 1 },
  { part: "tone-knob", x: 295, y: 278, instance: 2 },
] as const;
export const TREMOLO_PIVOT = { x: 190, y: 268 } as const;

// ---------- Amp ----------

export const AMP = { w: 340, h: 300, knobY: 50 } as const;
export const AMP_INPUT = { x: 86, y: 52 } as const;
export const AMP_KNOBS = [
  { part: "gain", x: 132, label: "GAIN", instance: 1, detail: undefined },
  { part: "amp-volume", x: 178, label: "VOLUME", instance: 1, detail: undefined },
  { part: "eq", x: 224, label: "BASS", instance: 1, detail: "بم (Bass)" },
  { part: "eq", x: 270, label: "MID", instance: 2, detail: "میانی (Mid)" },
  { part: "eq", x: 316, label: "TREBLE", instance: 3, detail: "زیر (Treble)" },
] as const;
export const AMP_SPEAKER = { x: 199, y: 186, r: 76 } as const;
export const GUITAR_JACK = { x: 30, y: 270 } as const;

// ---------- Views ----------

export const VIEWS: MapView[] = [
  {
    id: "full",
    label: "کل ساز",
    w: FULL.w,
    h: FULL.h,
    maxWidth: 320,
    minWidth: 200,
    maxHeightVh: 60,
    hotspots: [
      { part: "headstock", x: 104, y: 40 },
      { part: "nut", x: 100, y: FULL.nutY },
      { part: "fret", x: 100, y: fullFretY(3), detail: "فرت ۳" },
      { part: "fret-marker", x: 100, y: dotY(7) },
      { part: "fretboard", x: 100, y: 234 },
      { part: "neck", x: FULL.neckLeft, y: 278 },
      { part: "pickguard", x: 52, y: 372 },
      { part: "body", x: 28, y: 446 },
      { part: "bridge", x: 100, y: 450 },
      { part: "electric-guitar", x: 172, y: 470 },
      { part: "strap-button", x: 100, y: 510 },
    ],
  },
  {
    id: "head",
    label: "سر گیتار",
    w: HEAD.w,
    h: HEAD.h,
    maxWidth: 380,
    minWidth: 0,
    hotspots: [
      ...STRINGS.map((s) => ({ part: "tuning-peg", x: HEAD.keyX, y: headPegY(s), instance: s, detail: stringDetail(s) })),
      ...STRINGS.map((s) => ({ part: "string", ...headStringPin(s), instance: s, detail: stringDetail(s) })),
      { part: "headstock", x: 152, y: 150 },
      { part: "nut", x: 150, y: HEAD.nutY },
      { part: "fret", x: 128, y: HEAD.nutY + 40, detail: "فرت ۱" },
    ],
  },
  {
    id: "body",
    label: "بدنه",
    w: BODY.w,
    h: BODY.h,
    maxWidth: 380,
    minWidth: 0,
    hotspots: [
      ...PICKUPS.map((p, i) => ({ part: "pickup", x: 160, y: p.y, instance: i + 1, detail: `پیکاپ ${p.fa}` })),
      { part: "single-coil", x: 106, y: 140 },
      { part: "pickguard", x: 92, y: 250 },
      { part: "pickup-selector", x: (SWITCH_SLOT.x1 + SWITCH_SLOT.x5) / 2, y: (SWITCH_SLOT.y1 + SWITCH_SLOT.y5) / 2 },
      ...BODY_KNOBS.map((k) => ({ ...k, detail: k.part === "tone-knob" ? `تُن ${faNum(k.instance)}` : undefined })),
      { part: "bridge", x: 160, y: 263 },
      { part: "tremolo-arm", x: 222, y: 320 },
      { part: "output-jack", x: 296, y: 340 },
      { part: "strap-button", x: 160, y: 390 },
      { part: "body", x: 32, y: 350 },
    ],
  },
  {
    id: "amp",
    label: "آمپ",
    w: AMP.w,
    h: AMP.h,
    maxWidth: 420,
    minWidth: 0,
    hotspots: [
      { part: "amp-input", x: AMP_INPUT.x, y: AMP_INPUT.y },
      ...AMP_KNOBS.map((k) => ({ part: k.part, x: k.x, y: AMP.knobY, instance: k.instance, detail: k.detail })),
      { part: "speaker", x: AMP_SPEAKER.x, y: AMP_SPEAKER.y },
      { part: "amp", x: 329, y: 282 },
      { part: "cable", x: 18, y: 188 },
      { part: "output-jack", x: GUITAR_JACK.x, y: GUITAR_JACK.y, detail: "جک گیتار" },
    ],
  },
];

export const getView = (id: string | null) => VIEWS.find((v) => v.id === id);

/** Every part on the map, in the order first seen (views in tab order) */
export const mapPartIds: readonly string[] = [...new Set(VIEWS.flatMap((v) => v.hotspots.map((h) => h.part)))];
const onMap = new Set(mapPartIds);
export const isOnMap = (termId: string) => onMap.has(termId);

/** First view (in tab order) that shows the part */
export const defaultViewOf = (part: string): ViewId | undefined => VIEWS.find((v) => v.hotspots.some((h) => h.part === part))?.id;

export const instrumentHref = (part: string, view: ViewId | undefined = defaultViewOf(part)) =>
  `/glossary/instrument?view=${view ?? "full"}&part=${encodeURIComponent(part)}`;

/** Rendered width (px) of a view in a container `available` px wide and a viewport `vh` px tall */
export function renderedWidth(v: MapView, available: number, vh: number): number {
  const byHeight = v.maxHeightVh ? Math.max(v.minWidth, ((v.maxHeightVh / 100) * vh * v.w) / v.h) : Infinity;
  return Math.min(available, v.maxWidth, byHeight);
}
