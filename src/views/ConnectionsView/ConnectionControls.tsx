import type { UniverseIndex } from "../../data/buildIndexes";
import type { NeighborhoodResult } from "../../data/selectors";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./ConnectionsView.module.css";

interface ConnectionControlsProps {
  index: UniverseIndex;
  neighborhood: NeighborhoodResult;
}

export function ConnectionControls({ index, neighborhood }: ConnectionControlsProps) {
  const connectionDepth = useUniverseStore((s) => s.connectionDepth);
  const setConnectionDepth = useUniverseStore((s) => s.setConnectionDepth);
  const filters = useUniverseStore((s) => s.filters);
  const toggleRelationshipType = useUniverseStore((s) => s.toggleRelationshipType);
  const toggleShowConstellations = useUniverseStore((s) => s.toggleShowConstellations);
  const breadcrumbs = useUniverseStore((s) => s.connectionBreadcrumbs);
  const pushConnectionRoot = useUniverseStore((s) => s.pushConnectionRoot);
  const setView = useUniverseStore((s) => s.setView);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);

  const conceptualRelationTypes = index.data.relation_types.filter((rt) => rt.id !== "part_of");
  const allConceptualTypeIds = conceptualRelationTypes.map((rt) => rt.id);
  const rootNode = index.nodeById.get(neighborhood.rootId);

  return (
    <div className={styles.controls}>
      {breadcrumbs.length > 1 && (
        <nav className={styles.breadcrumbs} aria-label="Connections history">
          {breadcrumbs.map((id, i) => {
            const node = index.nodeById.get(id);
            if (!node) return null;
            return (
              <span key={id} className={styles.breadcrumbItem}>
                <button
                  type="button"
                  className={styles.breadcrumbButton}
                  disabled={id === neighborhood.rootId}
                  onClick={() => pushConnectionRoot(id)}
                >
                  {node.name}
                </button>
                {i < breadcrumbs.length - 1 && <span aria-hidden="true"> › </span>}
              </span>
            );
          })}
        </nav>
      )}

      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>Depth</span>
        <div className={styles.segmented}>
          <button
            type="button"
            aria-pressed={connectionDepth === 1}
            onClick={() => setConnectionDepth(1)}
          >
            1 hop
          </button>
          <button
            type="button"
            aria-pressed={connectionDepth === 2}
            onClick={() => setConnectionDepth(2)}
          >
            2 hops
          </button>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.showConstellations}
            onChange={() => toggleShowConstellations()}
          />
          Include constellations
        </label>

        <div className={styles.spacer} />

        <button type="button" onClick={() => pushConnectionRoot(neighborhood.rootId)}>
          Center root
        </button>
        <button
          type="button"
          onClick={() => {
            if (selectedNodeId) setView("landscape");
          }}
        >
          View {rootNode?.name ?? "root"} in Landscape
        </button>
      </div>

      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>Relationship types</span>
        {conceptualRelationTypes.map((rt) => (
          <label key={rt.id} className={styles.checkboxLabel} title={rt.description}>
            <input
              type="checkbox"
              checked={filters.relationshipTypes.size === 0 || filters.relationshipTypes.has(rt.id)}
              onChange={() => toggleRelationshipType(rt.id, allConceptualTypeIds)}
            />
            {rt.label}
          </label>
        ))}
      </div>

      {neighborhood.truncated && (
        <p className={styles.truncatedNotice}>
          Some lower-ranked second-hop fields are hidden to keep the graph readable.
        </p>
      )}
    </div>
  );
}
