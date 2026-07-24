import type { Domain } from "../../types/universe";
import { domainColorVar } from "../../styles/applyDomainTheme";
import styles from "./DomainChips.module.css";

interface DomainChipsProps {
  domains: Domain[];
  primaryDomainId?: string;
  size?: "sm" | "md";
}

export function DomainChips({ domains, primaryDomainId, size = "md" }: DomainChipsProps) {
  if (domains.length === 0) return null;
  return (
    <ul className={styles.chipList} data-size={size}>
      {domains.map((domain) => (
        <li key={domain.id}>
          <span
            className={styles.chip}
            data-primary={domain.id === primaryDomainId || undefined}
            style={{ ["--chip-color" as string]: `var(${domainColorVar(domain.id)})` }}
          >
            <span className={styles.dot} aria-hidden="true" />
            {domain.short_name}
            {domain.id === primaryDomainId && <span className={styles.visuallyHidden}> (primary domain)</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
