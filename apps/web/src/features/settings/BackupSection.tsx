import { useId, useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RichText } from "@/features/lessons/components/RichText";
import { storage } from "@/lib/storage";
import { backupFileName, buildBackup, keysToRemove, parseBackup, type BackupError, type RestoreEntry } from "@/lib/storage/backup";
import { faNum, formatDateTime } from "@/lib/format";
import { backupKeys } from "./backupKeys";
import { summarize, type BackupSummary } from "./backupSchema";
import styles from "./settings.module.css";

/** Plain-language messages; nothing from the file itself is ever shown */
const ERRORS: Record<BackupError, string> = {
  "too-large": "فایل بزرگ‌تر از ۲ مگابایت است.",
  "not-json": "این فایل قابل خواندن نیست (`JSON` معتبر نیست).",
  "wrong-app": "این فایل پشتیبان `Slow Bend` نیست.",
  "unknown-key": "این فایل کلید ناشناخته دارد؛ هیچ داده‌ای تغییر نکرد.",
  "newer-format": "این فایل با نسخه‌ی جدیدتری از سایت ساخته شده. صفحه را دوباره بارگذاری کن و باز امتحان کن.",
  "wrong-format": "قالب این فایل شناخته‌شده نیست.",
  "no-data": "در این فایل داده‌ای نیست.",
  "newer-version": "بخشی از این فایل با نسخه‌ی جدیدتری از سایت ساخته شده. صفحه را دوباره بارگذاری کن و باز امتحان کن.",
  "invalid-data": "بخشی از داده‌های این فایل خراب است، پس هیچ چیزی بازگردانده نشد.",
  "nothing-known": "در این فایل پیشرفتی که این سایت بشناسد پیدا نشد.",
};

type State =
  | { step: "idle" }
  | { step: "error"; message: string }
  | { step: "confirm"; entries: RestoreEntry[]; incoming: BackupSummary; current: BackupSummary; ignored: number; exportedAt: string | null }
  | { step: "done" };

function currentEntries(): RestoreEntry[] {
  const file = buildBackup(backupKeys, storage.readRaw);
  // Same validation path as an imported file, so "now" and "in the file" are counted the same way
  const parsed = parseBackup(JSON.stringify(file), 0, backupKeys);
  return parsed.ok ? parsed.entries : [];
}

export function BackupSection() {
  const [state, setState] = useState<State>({ step: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const exportFile = () => {
    const file = buildBackup(backupKeys, storage.readRaw);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // the same file can be chosen again
    if (!f) return;
    // Size first, so a huge file is never read
    setState({ step: "idle" });
    let parsed;
    try {
      parsed = f.size > 2 * 1024 * 1024 ? parseBackup("", f.size, backupKeys) : parseBackup(await f.text(), f.size, backupKeys);
    } catch {
      setState({ step: "error", message: "خواندن فایل انجام نشد؛ دوباره تلاش کن." });
      return;
    }
    if (!parsed.ok) return setState({ step: "error", message: ERRORS[parsed.error] });
    setState({
      step: "confirm",
      entries: parsed.entries,
      incoming: summarize(parsed.entries),
      current: summarize(currentEntries()),
      ignored: parsed.ignoredKeys,
      exportedAt: parsed.exportedAt,
    });
  };

  const restore = (entries: RestoreEntry[]) => {
    try {
      const removes = keysToRemove(backupKeys, entries, (key) => storage.readRaw(key) !== null);
      storage.replace(entries, removes);
      setState({ step: "done" });
    } catch {
      setState({ step: "error", message: "بازگرداندن انجام نشد و داده‌ی فعلی دست‌نخورده ماند." });
    }
  };

  return (
    <Card className={styles.section} id="backup" aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        پشتیبان‌گیری از پیشرفت
      </h2>
      <p className={styles.reminder}>پیشرفت فقط در همین مرورگر ذخیره می‌شود؛ گاهی پشتیبان بگیر.</p>

      <div className={styles.buttons}>
        <Button variant="primary" onClick={exportFile}>
          <Download size={18} aria-hidden />
          گرفتن فایل پشتیبان
        </Button>
        <Button onClick={() => inputRef.current?.click()}>
          <Upload size={18} aria-hidden />
          بازگرداندن از فایل
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className={styles.fileInput}
          onChange={onFile}
          tabIndex={-1}
          aria-hidden
        />
      </div>

      <div aria-live="polite">
        {state.step === "error" && (
          <p className={styles.error} role="alert">
            <AlertTriangle size={18} aria-hidden />
            <RichText text={state.message} />
          </p>
        )}
        {state.step === "done" && (
          <p className={styles.success}>
            <CheckCircle2 size={18} aria-hidden />
            پیشرفت از فایل بازگردانده شد.
          </p>
        )}
        {state.step === "confirm" && (
          <div className={styles.confirm}>
            <p className={styles.confirmTitle}>
              این فایل
              {state.exportedAt && <> (ساخته‌شده در {formatDateTime(state.exportedAt)})</>} این‌ها را دارد:
            </p>
            <SummaryTable incoming={state.incoming} current={state.current} />
            {state.ignored > 0 && (
              <p className={styles.muted}>{faNum(state.ignored)} مورد ناشناخته در فایل بود که نادیده گرفته می‌شود.</p>
            )}
            <p className={styles.warning}>
              <AlertTriangle size={18} aria-hidden />
              با بازگرداندن، همه‌ی پیشرفت فعلی این مرورگر با محتوای این فایل جایگزین می‌شود. این کار برگشت ندارد.
            </p>
            <div className={styles.buttons}>
              <Button variant="primary" onClick={() => restore(state.entries)}>
                بله، جایگزین کن
              </Button>
              <Button variant="ghost" onClick={() => setState({ step: "idle" })}>
                انصراف
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function SummaryTable({ incoming, current }: { incoming: BackupSummary; current: BackupSummary }) {
  const rows: [string, keyof BackupSummary][] = [
    ["درس‌های تمام‌شده", "lessonsDone"],
    ["گزارش‌ها", "reports"],
    ["اصطلاح‌های یادگرفته", "termsLearned"],
    ["تنظیمات تمرین", "settings"],
  ];
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" />
          <th scope="col">در فایل</th>
          <th scope="col">الان در این مرورگر</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, key]) => (
          <tr key={key}>
            <th scope="row">{label}</th>
            <td>{faNum(incoming[key])}</td>
            <td>{faNum(current[key])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
