import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export function SettingsPage() {
  return (
    <>
      <PageHeader title="تنظیمات" subtitle="زمان تمرین و همگام‌سازی" />
      <ComingSoon step={2}>زمان تمرین روزانه و اتصال به سرور برای همگام‌سازی گوشی و لپ‌تاپ.</ComingSoon>
    </>
  );
}
