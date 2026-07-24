import type { UniverseIndex } from "../../data/buildIndexes";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./ConnectionsView.module.css";

interface ConnectionsEmptyStateProps {
  index: UniverseIndex;
}

export function ConnectionsEmptyState({ index }: ConnectionsEmptyStateProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  const suggested = [...index.data.fields]
    .filter((f) => f.display.priority === 1)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8);

  return (
    <div className={styles.emptyState}>
      <h2>Explore how one field connects to others</h2>
      <p>
        Connections starts from a single field or constellation and shows its direct relationships —
        it does not display the entire network at once. Search above, or pick a starting point:
      </p>
      <ul className={styles.suggestions}>
        {suggested.map((field) => (
          <li key={field.id}>
            <button type="button" onClick={() => selectNode(field.id, { openPanel: false })}>
              {field.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
