import type { UniverseIndex } from "../../data/buildIndexes";
import type { Domain, FieldNode } from "../../types/universe";
import { DomainChips } from "../../components/DomainChips/DomainChips";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./TaxonomyView.module.css";

interface FieldRowProps {
  index: UniverseIndex;
  field: FieldNode;
  context: "primary" | "secondary";
  contextDomain: Domain;
}

export function FieldRow({ index, field, context, contextDomain }: FieldRowProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const setView = useUniverseStore((s) => s.setView);

  const openDetails = () => selectNode(field.id, { openPanel: true });
  const showInLandscape = () => {
    selectNode(field.id, { openPanel: true });
    setView("landscape");
  };
  const exploreConnections = () => {
    selectNode(field.id, { openPanel: false });
    setView("connections");
  };

  if (context === "secondary") {
    const primaryDomain = index.domainById.get(field.primary_domain_id);
    return (
      <li className={styles.crossRefRow}>
        <button type="button" className={styles.crossRefButton} onClick={openDetails}>
          {field.name}
        </button>
        <span className={styles.crossRefNote}>
          primarily under {primaryDomain?.name ?? field.primary_domain_id}; also belongs under{" "}
          {contextDomain.name}
        </span>
      </li>
    );
  }

  const domains = field.domain_ids.map((id) => index.domainById.get(id)).filter((d): d is Domain => !!d);

  return (
    <li className={styles.fieldRow}>
      <div className={styles.fieldRowHeader}>
        <h3 className={styles.fieldName}>
          <button type="button" className={styles.fieldNameButton} onClick={openDetails}>
            {field.name}
          </button>
        </h3>
        <span className={styles.badge} data-kind={field.node_class}>
          {field.node_class === "bridge_field" ? "Bridge field" : "Ordinary field"}
        </span>
      </div>

      <DomainChips domains={domains} primaryDomainId={field.primary_domain_id} size="sm" />

      <p className={styles.summary}>{field.summary}</p>

      {field.representative_topics.length > 0 && (
        <p className={styles.topics}>
          <span className={styles.topicsLabel}>Topics: </span>
          {field.representative_topics.slice(0, 5).join(", ")}
        </p>
      )}

      <div className={styles.rowActions}>
        <button type="button" onClick={openDetails}>
          Open details
        </button>
        <button type="button" onClick={showInLandscape}>
          Show in Landscape
        </button>
        <button type="button" onClick={exploreConnections}>
          Explore connections
        </button>
      </div>
    </li>
  );
}
