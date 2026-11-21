import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";
import styles from "./log.module.css";

export function LogPage() {
  return (
    <>
      <PageHeader title="تمرین روزانه" subtitle="چک‌لیست و ثبت پیشرفت" />
      <Card className={styles.reminder}>
        <ShieldCheck size={18} aria-hidden />
        <span>
          پیشرفت فقط در همین مرورگر ذخیره می‌شود؛ گاهی پشتیبان بگیر. <Link to="/settings#backup">پشتیبان‌گیری</Link>
        </span>
      </Card>
      <ComingSoon step={7}>چک‌لیست، روزهای پشت‌سرهم و نمودار BPM.</ComingSoon>
    </>
  );
}
