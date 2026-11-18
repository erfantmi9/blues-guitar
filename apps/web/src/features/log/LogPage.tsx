import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export function LogPage() {
  return (
    <>
      <PageHeader title="تمرین روزانه" subtitle="چک‌لیست و ثبت پیشرفت" />
      <ComingSoon step={7}>چک‌لیست، روزهای پشت‌سرهم و نمودار BPM.</ComingSoon>
    </>
  );
}
