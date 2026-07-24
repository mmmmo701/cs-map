import type { UniverseIndex } from "../../data/buildIndexes";
import type { ConstellationNode, Domain } from "../../types/universe";
import { DomainChips } from "../DomainChips/DomainChips";
import { VenueList } from "../VenueList/VenueList";
import { BookList } from "../BookList/BookList";
import { RelatedFieldsList } from "./RelatedFieldsList";
import { PanelActions } from "./PanelActions";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./DetailPanel.module.css";

interface ConstellationDetailProps {
  index: UniverseIndex;
  constellation: ConstellationNode;
}

export function ConstellationDetail({ index, constellation }: ConstellationDetailProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const domains = constellation.domain_ids
    .map((id) => index.domainById.get(id))
    .filter((d): d is Domain => !!d);
  const components = constellation.component_field_ids
    .map((id) => index.fieldById.get(id))
    .filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <div className={styles.body}>
      <span className={styles.badge} data-kind="constellation">
        Cross-cutting constellation
      </span>

      <DomainChips domains={domains} />

      <section>
        <p className={styles.summaryText}>{constellation.summary}</p>
      </section>

      <section>
        <div className={styles.whyBox}>
          <h3 className={styles.whyLabel}>Why this is not an ordinary child</h3>
          <p>{constellation.why_not_ordinary_child}</p>
        </div>
      </section>

      {components.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Component fields</h3>
          <ul className={styles.topicList}>
            {components.map((field) => (
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
      )}

      {constellation.representative_topics.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Representative topics</h3>
          <ul className={styles.topicList}>
            {constellation.representative_topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className={styles.sectionHeading}>Related relations</h3>
        <RelatedFieldsList index={index} nodeId={constellation.id} />
      </section>

      {(constellation.representative_venues.journals.length > 0 ||
        constellation.representative_venues.conferences.length > 0) && (
        <section>
          <h3 className={styles.sectionHeading}>Representative venues</h3>
          <VenueList venues={constellation.representative_venues} />
        </section>
      )}

      {constellation.books.length > 0 && (
        <section>
          <h3 className={styles.sectionHeading}>Books</h3>
          <BookList books={constellation.books} />
        </section>
      )}

      <PanelActions nodeId={constellation.id} />
    </div>
  );
}
