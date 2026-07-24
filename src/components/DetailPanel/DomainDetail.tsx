import type { UniverseIndex } from "../../data/buildIndexes";
import type { Domain } from "../../types/universe";
import { useUniverseStore } from "../../state/universeStore";
import { PanelActions } from "./PanelActions";
import styles from "./DetailPanel.module.css";

interface DomainDetailProps {
  index: UniverseIndex;
  domain: Domain;
}

export function DomainDetail({ index, domain }: DomainDetailProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const fields = index.fieldsByDomain.get(domain.id) ?? [];

  return (
    <div className={styles.body}>
      <span className={styles.badge}>Domain</span>
      <p className={styles.summaryText}>{domain.summary}</p>

      <section>
        <h3 className={styles.sectionHeading}>
          {fields.length} field{fields.length === 1 ? "" : "s"}
        </h3>
        <ul className={styles.topicList}>
          {fields.map((field) => (
            <li key={field.id}>
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => selectNode(field.id, { openPanel: true })}
              >
                {field.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <PanelActions nodeId={domain.id} />
    </div>
  );
}
