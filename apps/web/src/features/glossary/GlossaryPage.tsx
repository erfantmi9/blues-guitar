import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";

export function GlossaryPage() {
  return (
    <>
      <PageHeader title="اصطلاحات" subtitle="زبان موسیقی به زبان ساده" />
      <ComingSoon step={8}></ComingSoon>
    </>
  );
}
