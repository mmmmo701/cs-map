import type { UniverseIndex } from "../../data/buildIndexes";
import type { Domain, FieldNode } from "../../types/universe";
import { DomainChips } from "../DomainChips/DomainChips";
import { VenueList } from "../VenueList/VenueList";
import { BookList } from "../BookList/BookList";
import { PositionExplanation } from "./PositionExplanation";
import { RelatedFieldsList } from "./RelatedFieldsList";
import { PanelActions } from "./PanelActions";
import { getConstellationsForField } from "../../data/selectors";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./DetailPanel.module.css";

interface FieldDetailProps {
  index: UniverseIndex;
  field: FieldNode;
}

export function FieldDetail({ index, field }: FieldDetailProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const domains = field.domain_ids.map((id) => index.domainById.get(id)).filter((d): d is Domain => !!d);
  const revealedConstellations = getConstellationsForField(index, field.id);

  return (
    <div className={styles.body}>
      <span className={styles.badge} data-kind={field.node_class}>
        {field.node_class === "bridge_field" ? "Bridge field" : "Ordinary field"}
      </span>

      <DomainChips domains={domains} primaryDomainId={field.primary_domain_id} />

      <section>
        <p className={styles.summaryText}>{field.summary}</p>
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Conceptual position</h3>
        <PositionExplanation position={field.position} metadata={index.data.metadata} />
      </section>

      {field.representative_topics.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Representative topics</h3>
          <ul className={styles.topicList}>
            {field.representative_topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className={styles.sectionHeading}>Related fields</h3>
        <RelatedFieldsList index={index} nodeId={field.id} />
      </section>

      {revealedConstellations.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Part of these constellations</h3>
          <ul className={styles.topicList}>
            {revealedConstellations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={styles.inlineLink}
                  onClick={() => selectNode(c.id, { openPanel: true })}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(field.representative_venues.journals.length > 0 || field.representative_venues.conferences.length > 0) && (
        <section>
          <h3 className={styles.sectionHeading}>Representative venues</h3>
          <VenueList venues={field.representative_venues} />
        </section>
      )}

      {field.books.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Books</h3>
          <BookList books={field.books} />
        </section>
      )}

      <PanelActions nodeId={field.id} />
    </div>
  );
}
