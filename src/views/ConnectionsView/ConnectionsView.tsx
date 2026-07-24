import { useMemo } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { useUniverseStore } from "../../state/universeStore";
import { getNeighborhood } from "../../data/selectors";
import { ConnectionsEmptyState } from "./ConnectionsEmptyState";
import { ConnectionControls } from "./ConnectionControls";
import { ConnectionsCanvas } from "./ConnectionsCanvas";
import styles from "./ConnectionsView.module.css";

interface ConnectionsViewProps {
  index: UniverseIndex;
}

export function ConnectionsView({ index }: ConnectionsViewProps) {
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const connectionDepth = useUniverseStore((s) => s.connectionDepth);
  const filters = useUniverseStore((s) => s.filters);

  const neighborhood = useMemo(() => {
    if (!selectedNodeId || !index.nodeById.has(selectedNodeId)) return null;
    return getNeighborhood(index, selectedNodeId, connectionDepth, filters);
  }, [index, selectedNodeId, connectionDepth, filters]);

  if (!selectedNodeId || !neighborhood) {
    return <ConnectionsEmptyState index={index} />;
  }

  return (
    <div className={styles.shell}>
      <ConnectionControls index={index} neighborhood={neighborhood} />
      <ConnectionsCanvas index={index} neighborhood={neighborhood} />
    </div>
  );
}
