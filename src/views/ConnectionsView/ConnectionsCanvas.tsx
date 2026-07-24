import { useEffect, useMemo, useRef, useState } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { NeighborhoodResult } from "../../data/selectors";
import { buildRelationSentence, isConstellationNode, isFieldNode } from "../../data/selectors";
import { NodeGlyph } from "../../visualization/NodeGlyph";
import { RelationPath } from "../../visualization/RelationPath";
import { EdgeMarkerDefs } from "../../visualization/markers";
import { computeConnectionLayout } from "./connectionLayout";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./ConnectionsView.module.css";

interface ConnectionsCanvasProps {
  index: UniverseIndex;
  neighborhood: NeighborhoodResult;
}

export function ConnectionsCanvas({ index, neighborhood }: ConnectionsCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const hoveredNodeId = useUniverseStore((s) => s.hoveredNodeId);
  const setHoveredNode = useUniverseStore((s) => s.setHoveredNode);
  const keyboardFocusedNodeId = useUniverseStore((s) => s.keyboardFocusedNodeId);
  const setKeyboardFocusedNode = useUniverseStore((s) => s.setKeyboardFocusedNode);
  const pushConnectionRoot = useUniverseStore((s) => s.pushConnectionRoot);
  const setDetailsPanelOpen = useUniverseStore((s) => s.setDetailsPanelOpen);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => computeConnectionLayout(index, neighborhood), [index, neighborhood]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const focusId = hoveredNodeId ?? selectedNodeId;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        role="group"
        aria-label={`Connections graph rooted at ${index.nodeById.get(neighborhood.rootId)?.name ?? ""}, showing ${neighborhood.nodeIds.size - 1} related nodes. Contains focusable nodes; a text list of relationships is also available below.`}
      >
        <EdgeMarkerDefs />
        <g transform={`translate(${centerX},${centerY})`}>
          {neighborhood.relations.map((relation, i) => {
            const sourcePos = layout.positions.get(relation.source);
            const targetPos = layout.positions.get(relation.target);
            if (!sourcePos || !targetPos) return null;
            const relationType = index.relationTypeById.get(relation.type);
            const active =
              !focusId || relation.source === focusId || relation.target === focusId;
            return (
              <RelationPath
                key={`${relation.source}-${relation.target}-${relation.type}-${i}`}
                id={`conn-edge-${i}`}
                source={sourcePos}
                target={targetPos}
                line={relationType?.style.line ?? "solid"}
                hasArrow={Boolean(relationType?.directed && relationType.style.arrow === "target")}
                active={active}
                bendOffset={12}
                ariaLabel={buildRelationSentence(index, relation)}
              />
            );
          })}

          {[...neighborhood.nodeIds].map((id) => {
            const node = index.nodeById.get(id);
            const pos = layout.positions.get(id);
            if (!node || !pos) return null;
            const isRoot = id === neighborhood.rootId;
            const kind = isFieldNode(node)
              ? node.node_class
              : isConstellationNode(node)
                ? ("constellation" as const)
                : ("ordinary_field" as const);
            const colors =
              isFieldNode(node) || isConstellationNode(node)
                ? node.domain_ids.map((d) => index.domainById.get(d)?.color ?? "#888")
                : ["#888"];
            const radius = isRoot ? 13 : layout.ring.get(id) === 1 ? 9 : 7;

            return (
              <NodeGlyph
                key={id}
                id={id}
                kind={kind}
                x={pos.x}
                y={pos.y}
                radius={radius}
                colors={colors}
                ariaLabel={node.name + (isRoot ? " (current root)" : "")}
                selected={isRoot}
                hovered={focusId === id && !isRoot}
                focused={keyboardFocusedNodeId === id}
                dimmed={false}
                haloRadius={radius + 8}
                haloOpacity={0.22}
                onSelect={() => {
                  if (isRoot) setDetailsPanelOpen(true);
                  else pushConnectionRoot(id);
                }}
                onHoverStart={() => setHoveredNode(id)}
                onHoverEnd={() => setHoveredNode(null)}
                onFocusNode={() => setKeyboardFocusedNode(id)}
                onDoubleClick={() => (isRoot ? undefined : pushConnectionRoot(id))}
              />
            );
          })}

          {[...neighborhood.nodeIds].map((id) => {
            const node = index.nodeById.get(id);
            const pos = layout.positions.get(id);
            if (!node || !pos) return null;
            const isRoot = id === neighborhood.rootId;
            return (
              <text
                key={`label-${id}`}
                x={pos.x}
                y={pos.y + (isRoot ? 30 : 20)}
                textAnchor="middle"
                fontSize={isRoot ? 14 : 11.5}
                fontWeight={isRoot ? 600 : 500}
                fill={isRoot ? "var(--text-primary)" : "var(--text-secondary)"}
                paintOrder="stroke"
                stroke="var(--background)"
                strokeWidth={3}
                pointerEvents="none"
              >
                {node.name}
              </text>
            );
          })}
        </g>
      </svg>

      <RelationTextList index={index} neighborhood={neighborhood} />
    </div>
  );
}

function RelationTextList({ index, neighborhood }: ConnectionsCanvasProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);
  return (
    <details className={styles.relationList}>
      <summary>View {neighborhood.relations.length} relationships as a list</summary>
      <ul>
        {neighborhood.relations.map((relation, i) => (
          <li key={`${relation.source}-${relation.target}-${relation.type}-${i}`}>
            <button
              type="button"
              onClick={() =>
                selectNode(
                  relation.source === neighborhood.rootId ? relation.target : relation.source,
                  { openPanel: true },
                )
              }
            >
              {buildRelationSentence(index, relation)}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
