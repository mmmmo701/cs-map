import type { UniverseIndex } from "../../data/buildIndexes";
import type { Domain } from "../../types/universe";
import { domainColorVar } from "../../styles/applyDomainTheme";
import { FieldRow } from "./FieldRow";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./TaxonomyView.module.css";

interface DomainSectionProps {
  index: UniverseIndex;
  domain: Domain;
  visibleFieldIds: Set<string>;
}

export function DomainSection({ index, domain, visibleFieldIds }: DomainSectionProps) {
  const allFields = index.fieldsByDomain.get(domain.id) ?? [];
  const visibleFields = allFields.filter((f) => visibleFieldIds.has(f.id));
  const selectNode = useUniverseStore((s) => s.selectNode);

  if (visibleFields.length === 0) return null;

  return (
    <section
      className={styles.domainSection}
      style={{ ["--section-color" as string]: `var(${domainColorVar(domain.id)})` }}
      aria-labelledby={`domain-${domain.id}-heading`}
    >
      <details open>
        <summary className={styles.domainSummary}>
          <span className={styles.domainDot} aria-hidden="true" />
          <h2 id={`domain-${domain.id}-heading`} className={styles.domainName}>
            <button
              type="button"
              className={styles.domainNameButton}
              onClick={(e) => {
                e.preventDefault();
                selectNode(domain.id, { openPanel: false });
              }}
            >
              {domain.name}
            </button>
          </h2>
          <span className={styles.domainCount}>
            {visibleFields.length} field{visibleFields.length === 1 ? "" : "s"}
          </span>
        </summary>
        <div className={styles.domainBody}>
          <p className={styles.domainDescription}>{domain.summary}</p>
          <ul className={styles.fieldList}>
            {visibleFields.map((field) => (
              <FieldRow
                key={field.id}
                index={index}
                field={field}
                context={field.primary_domain_id === domain.id ? "primary" : "secondary"}
                contextDomain={domain}
              />
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
