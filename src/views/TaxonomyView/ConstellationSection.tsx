import { useMemo } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { ConstellationNode, Domain } from "../../types/universe";
import { DomainChips } from "../../components/DomainChips/DomainChips";
import { VenueList } from "../../components/VenueList/VenueList";
import { BookList } from "../../components/BookList/BookList";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./TaxonomyView.module.css";

interface ConstellationSectionProps {
  index: UniverseIndex;
  constellations: ConstellationNode[];
}

const TYPE_LABELS: Record<string, string> = {
  cross_cutting_umbrella: "Cross-cutting umbrellas",
  hybrid_methodology: "Hybrid methodologies",
  cross_domain_theme: "Cross-domain themes",
  application_umbrella: "Application umbrellas",
  systems_ecosystem: "Systems ecosystems",
  practice_ecosystem: "Practice ecosystems",
  cross_domain_field: "Cross-domain fields",
  cross_domain_umbrella: "Cross-domain umbrellas",
};

function humanizeType(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ConstellationSection({ index, constellations }: ConstellationSectionProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, ConstellationNode[]>();
    for (const constellation of constellations) {
      const list = groups.get(constellation.constellation_type);
      if (list) list.push(constellation);
      else groups.set(constellation.constellation_type, [constellation]);
    }
    return [...groups.entries()].sort((a, b) => humanizeType(a[0]).localeCompare(humanizeType(b[0])));
  }, [constellations]);

  if (constellations.length === 0) return null;

  return (
    <section className={styles.constellationSection} aria-labelledby="constellation-heading">
      <h2 id="constellation-heading" className={styles.constellationHeading}>
        Cross-cutting constellations
      </h2>
      <p className={styles.constellationIntro}>
        These are not ordinary children of a single domain — they synthesize several established
        fields. See “Why this is a constellation” on each entry.
      </p>

      {grouped.map(([type, items]) => (
        <div key={type} className={styles.typeGroup}>
          <h3 className={styles.typeHeading}>{humanizeType(type)}</h3>
          <ul className={styles.constellationList}>
            {items.map((constellation) => (
              <ConstellationEntry key={constellation.id} index={index} constellation={constellation} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ConstellationEntry({
  index,
  constellation,
}: {
  index: UniverseIndex;
  constellation: ConstellationNode;
}) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const setView = useUniverseStore((s) => s.setView);

  const domains = constellation.domain_ids
    .map((id) => index.domainById.get(id))
    .filter((d): d is Domain => !!d);
  const components = constellation.component_field_ids
    .map((id) => index.fieldById.get(id))
    .filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <li className={styles.constellationEntry}>
      <div className={styles.fieldRowHeader}>
        <h4 className={styles.fieldName}>
          <button
            type="button"
            className={styles.fieldNameButton}
            onClick={() => selectNode(constellation.id, { openPanel: true })}
          >
            {constellation.name}
          </button>
        </h4>
        <span className={styles.badge} data-kind="constellation">
          Constellation
        </span>
      </div>

      <DomainChips domains={domains} size="sm" />

      <p className={styles.summary}>{constellation.summary}</p>

      <div className={styles.whyBox}>
        <p className={styles.whyLabel}>Why this is a constellation</p>
        <p>{constellation.why_not_ordinary_child}</p>
      </div>

      {components.length > 0 && (
        <p className={styles.topics}>
          <span className={styles.topicsLabel}>Component fields: </span>
          {components.map((f) => f.name).join(", ")}
        </p>
      )}

      <VenueList venues={constellation.representative_venues} />
      <BookList books={constellation.books} />

      <div className={styles.rowActions}>
        <button type="button" onClick={() => selectNode(constellation.id, { openPanel: true })}>
          Open details
        </button>
        <button
          type="button"
          onClick={() => {
            selectNode(constellation.id, { openPanel: true });
            setView("landscape");
          }}
        >
          Show components in Landscape
        </button>
        <button
          type="button"
          onClick={() => {
            selectNode(constellation.id, { openPanel: false });
            setView("connections");
          }}
        >
          Explore connections
        </button>
      </div>
    </li>
  );
}
