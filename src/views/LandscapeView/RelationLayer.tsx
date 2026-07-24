import { useMemo, useState } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { buildRelationSentence, getConceptualRelations } from "../../data/selectors";
import { RelationPath } from "../../visualization/RelationPath";
import type { ScreenPoint } from "./landscapeLayout";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./LandscapeView.module.css";

interface RelationLayerProps {
  index: UniverseIndex;
  focusNodeId: string | null;
  positions: Map<string, ScreenPoint>;
}

const INITIAL_EDGE_LIMIT = 8;

export function RelationLayer({ index, focusNodeId, positions }: RelationLayerProps) {
  const [showAll, setShowAll] = useState(false);
  const selectNode = useUniverseStore((s) => s.selectNode);

  const relations = useMemo(() => {
    if (!focusNodeId) return [];
    return [...getConceptualRelations(index, focusNodeId)].sort((a, b) => b.strength - a.strength);
  }, [index, focusNodeId]);

  if (!focusNodeId || relations.length === 0) return null;

  const visibleRelations = showAll ? relations : relations.slice(0, INITIAL_EDGE_LIMIT);
  const hiddenCount = relations.length - visibleRelations.length;
  const focusPoint = positions.get(focusNodeId);
  if (!focusPoint) return null;

  return (
    <g>
      {visibleRelations.map((relation, i) => {
        const otherId = relation.source === focusNodeId ? relation.target : relation.source;
        const otherPoint = positions.get(otherId);
        if (!otherPoint) return null;
        const relationType = index.relationTypeById.get(relation.type);
        const sourcePoint = relation.source === focusNodeId ? focusPoint : otherPoint;
        const targetPoint = relation.source === focusNodeId ? otherPoint : focusPoint;
        return (
          <RelationPath
            key={`${relation.source}-${relation.target}-${relation.type}-${i}`}
            id={`edge-${relation.source}-${relation.target}-${relation.type}`}
            source={sourcePoint}
            target={targetPoint}
            line={relationType?.style.line ?? "solid"}
            hasArrow={Boolean(relationType?.directed && relationType.style.arrow === "target")}
            active
            bendOffset={16 + (i % 3) * 6}
            ariaLabel={buildRelationSentence(index, relation)}
            onSelect={() => selectNode(otherId, { openPanel: true })}
          />
        );
      })}
      {hiddenCount > 0 && (
        <foreignObject x={focusPoint.x - 90} y={focusPoint.y + 20} width={180} height={32}>
          <button type="button" className={styles.showAllEdges} data-no-pan onClick={() => setShowAll(true)}>
            Show all {relations.length} relations
          </button>
        </foreignObject>
      )}
    </g>
  );
}
