import type { ReactNode } from "react";
import { Card } from "./Card";

/** Temporary placeholder until the page is built in a later step */
export function ComingSoon({ step, children }: { step: number; children?: ReactNode }) {
  return (
    <Card>
      <strong>در مرحله‌ی {step.toLocaleString("fa-IR")} ساخته می‌شود.</strong>
      {children && <div style={{ color: "var(--muted)", marginTop: 8 }}>{children}</div>}
    </Card>
  );
}
