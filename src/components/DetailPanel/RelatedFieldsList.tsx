import type { UniverseIndex } from "../../data/buildIndexes";
import { getRelationsGroupedByType } from "../../data/selectors";
import { getRelationGroupHeader } from "../../data/relationHeaders";
import { useUniverseStore } from "../../state/universeStore";
import type { NodeId } from "../../types/universe";
import styles from "./DetailPanel.module.css";

interface RelatedFieldsListProps {
  index: UniverseIndex;
  nodeId: NodeId;
}

export function RelatedFieldsList({ index, nodeId }: RelatedFieldsListProps) {
  const groups = getRelationsGroupedByType(index, nodeId);
  const selectNode = useUniverseStore((s) => s.selectNode);

  if (groups.length === 0) {
    return <p className={styles.emptyNote}>No direct conceptual relations recorded.</p>;
  }

  return (
    <div className={styles.relatedGroups}>
      {groups.map((group) => (
        <div key={`${group.relationTypeId}|${group.direction}`}>
          <h4 className={styles.relatedGroupHeading}>
            {getRelationGroupHeader(group.relationTypeId, group.relationTypeLabel, group.direction)}
          </h4>
          <ul className={styles.relatedList}>
            {group.items.map((item) => (
              <li key={`${item.nodeId}-${item.relation.type}`}>
                <button type="button" onClick={() => selectNode(item.nodeId, { openPanel: true })}>
                  {item.nodeName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
