import { useEffect, useState } from "react";
import { copyText } from "@/lib/clipboard";

/** Copy with a short "copied" / "failed" status */
export function useCopyFeedback() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const id = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(id);
  }, [status]);

  const copy = async (text: string) => setStatus((await copyText(text)) ? "copied" : "failed");
  const label = (idle: string) => (status === "copied" ? "کپی شد ✓" : status === "failed" ? "کپی نشد" : idle);

  return { copy, label };
}
