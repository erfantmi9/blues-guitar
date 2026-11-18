import type { Duration } from "@bg/shared";

const faInt = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const fa2 = new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2, useGrouping: false });
const faDate = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short" });

export const faNum = (n: number) => faInt.format(n);

export function formatDuration(d: Duration): string {
  return typeof d === "number" ? `${faNum(d)} دقیقه` : `${faNum(d.min)} تا ${faNum(d.max)} دقیقه`;
}

/** Duration the timer uses: upper bound of a range (you can always skip early) */
export function durationToSeconds(d: Duration): number {
  return (typeof d === "number" ? d : d.max) * 60;
}

/** mm:ss with Persian digits */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${fa2.format(Math.floor(total / 60))}:${fa2.format(total % 60)}`;
}

export function formatDateTime(iso: string): string {
  try {
    return faDate.format(new Date(iso));
  } catch {
    return iso;
  }
}
