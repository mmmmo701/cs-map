import { useUniverseStore, DEFAULT_CAMERA } from "../../state/universeStore";
import type { UniverseIndex } from "../../data/buildIndexes";
import { getConceptualRelations, isConstellationNode, isFieldNode } from "../../data/selectors";
import styles from "./StatusBar.module.css";

interface StatusBarProps {
  index: UniverseIndex;
  visibleCount: number;
}

export function StatusBar({ index, visibleCount }: StatusBarProps) {
  const view = useUniverseStore((s) => s.view);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const clearSelection = useUniverseStore((s) => s.clearSelection);
  const setLandscapeCamera = useUniverseStore((s) => s.setLandscapeCamera);

  const selectedNode = selectedNodeId ? index.nodeById.get(selectedNodeId) : undefined;

  let statusText = `${visibleCount} node${visibleCount === 1 ? "" : "s"} visible`;
  if (selectedNode) {
    const parts = [selectedNode.name];
    if (isFieldNode(selectedNode)) {
      parts.push(selectedNode.node_class === "bridge_field" ? "bridge field" : "ordinary field");
      parts.push(`${selectedNode.domain_ids.length} domain${selectedNode.domain_ids.length === 1 ? "" : "s"}`);
    } else if (isConstellationNode(selectedNode)) {
      parts.push("constellation");
      parts.push(`${selectedNode.component_field_ids.length} component fields`);
    } else {
      parts.push("domain");
    }
    const relationCount = getConceptualRelations(index, selectedNodeId!).length;
    parts.push(`${relationCount} direct relation${relationCount === 1 ? "" : "s"}`);
    statusText = parts.join(" · ");
  }

  return (
    <footer className={styles.statusBar}>
      <p className={styles.status}>{statusText}</p>
      <div className={styles.controls}>
        {selectedNodeId && (
          <button type="button" onClick={() => clearSelection()}>
            Clear selection
          </button>
        )}
        {view === "landscape" && (
          <button type="button" onClick={() => setLandscapeCamera(DEFAULT_CAMERA)}>
            Reset camera
          </button>
        )}
        <span className={styles.hint}>
          Press <kbd>/</kbd> to search
        </span>
      </div>
    </footer>
  );
}
