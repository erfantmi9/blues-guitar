import { useEffect } from "react";
import { useLocation } from "react-router";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackupSection } from "./BackupSection";

export function SettingsPage() {
  const { hash } = useLocation();
  // /settings#backup (from the reminder on the log page)
  useEffect(() => {
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }));
  }, [hash]);

  return (
    <>
      <PageHeader title="تنظیمات" subtitle="زمان تمرین و همگام‌سازی" />
      <BackupSection />
      <ComingSoon step={2}>زمان تمرین روزانه و اتصال به سرور برای همگام‌سازی گوشی و لپ‌تاپ.</ComingSoon>
    </>
  );
}
