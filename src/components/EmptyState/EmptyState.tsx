import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "error";
}

export function EmptyState({ title, description, action, tone = "neutral" }: EmptyStateProps) {
  return (
    <div className={styles.emptyState} data-tone={tone} role={tone === "error" ? "alert" : undefined}>
      <h2 className={styles.title}>{title}</h2>
      {description && <div className={styles.description}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
