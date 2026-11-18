import type { StageStatus } from "@bg/shared";
import { Check, Clock, Lock, PlayCircle } from "lucide-react";
import styles from "../lessons.module.css";

const config = {
  "coming-soon": { label: "به‌زودی", icon: Clock },
  locked: { label: "قفل", icon: Lock },
  "in-progress": { label: "در حال انجام", icon: PlayCircle },
  done: { label: "تمام‌شده", icon: Check },
} satisfies Record<StageStatus, { label: string; icon: typeof Check }>;

export function StatusBadge({ status }: { status: StageStatus }) {
  const { label, icon: Icon } = config[status];
  return (
    <span className={`${styles.badge} ${styles[`badge-${status}`]}`}>
      <Icon size={14} aria-hidden />
      {label}
    </span>
  );
}
