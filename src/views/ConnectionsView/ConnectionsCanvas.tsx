import { useEffect, useMemo, useRef, useState } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { NeighborhoodResult } from "../../data/selectors";
import { buildRelationSentence, isConstellationNode, isFieldNode } from "../../data/selectors";
import { NodeGlyph } from "../../visualization/NodeGlyph";
import { RelationPath } from "../../visualization/RelationPath";
import { EdgeMarkerDefs } from "../../visualization/markers";
import { useLandscapeZoom, ZOOM_EXTENT } from "../../visualization/zoomController";
import { computeConnectionLayout } from "./connectionLayout";
import { useUniverseStore } from "../../state/universeStore";
import type { CameraState } from "../../state/types";
import styles from "./ConnectionsView.module.css";

interface ConnectionsCanvasProps {
  index: UniverseIndex;
  neighborhood: NeighborhoodResult;
}

const IDENTITY_CAMERA: CameraState = { x: 0, y: 0, k: 1 };

export function ConnectionsCanvas({ index, neighborhood }: ConnectionsCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [camera, setCamera] = useState<CameraState>(IDENTITY_CAMERA);

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

  const { setTransform } = useLandscapeZoom(svgRef, { onCameraChange: setCamera });

  // Re-centered, unzoomed view every time the root changes — panning/zoom
  // from a previous neighborhood wouldn't make sense applied to a new one.
  useEffect(() => {
    setTransform(IDENTITY_CAMERA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood.rootId]);

  const layout = useMemo(() => computeConnectionLayout(index, neighborhood), [index, neighborhood]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  function toScreen(pos: { x: number; y: number }) {
    return {
      x: (centerX + pos.x) * camera.k + camera.x,
      y: (centerY + pos.y) * camera.k + camera.y,
    };
  }

  function zoomBy(factor: number) {
    const nextK = Math.min(ZOOM_EXTENT[1], Math.max(ZOOM_EXTENT[0], camera.k * factor));
    // Zoom around the viewport center rather than the origin, so +/- feels
    // anchored to what's on screen instead of yanking the graph sideways.
    const scaleRatio = nextK / camera.k;
    setTransform({
      k: nextK,
      x: centerX - (centerX - camera.x) * scaleRatio,
      y: centerY - (centerY - camera.y) * scaleRatio,
    });
  }

  function handleResetView() {
    setTransform(IDENTITY_CAMERA);
  }

  const focusId = hoveredNodeId ?? selectedNodeId;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <svg
        ref={svgRef}
        className={styles.svg}
        width={dimensions.width}
        height={dimensions.height}
        role="group"
        aria-label={`Connections graph rooted at ${index.nodeById.get(neighborhood.rootId)?.name ?? ""}, showing ${neighborhood.nodeIds.size - 1} related nodes. Contains focusable nodes; a text list of relationships is also available below.`}
      >
        <EdgeMarkerDefs />

        {neighborhood.relations.map((relation, i) => {
          const sourcePos = layout.positions.get(relation.source);
          const targetPos = layout.positions.get(relation.target);
          if (!sourcePos || !targetPos) return null;
          const relationType = index.relationTypeById.get(relation.type);
          const active = !focusId || relation.source === focusId || relation.target === focusId;
          return (
            <RelationPath
              key={`${relation.source}-${relation.target}-${relation.type}-${i}`}
              id={`conn-edge-${i}`}
              source={toScreen(sourcePos)}
              target={toScreen(targetPos)}
              line={relationType?.style.line ?? "solid"}
              hasArrow={Boolean(relationType?.directed && relationType.style.arrow === "target")}
              active={active}
              bendOffset={12 * camera.k}
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
          const baseRadius = isRoot ? 13 : layout.ring.get(id) === 1 ? 9 : 7;
          const radius = baseRadius * camera.k;
          const screenPos = toScreen(pos);

          return (
            <NodeGlyph
              key={id}
              id={id}
              kind={kind}
              x={screenPos.x}
              y={screenPos.y}
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
          const screenPos = toScreen(pos);
          return (
            <text
              key={`label-${id}`}
              x={screenPos.x}
              y={screenPos.y + (isRoot ? 30 : 20) * camera.k}
              textAnchor="middle"
              fontSize={(isRoot ? 14 : 11.5) * camera.k}
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
      </svg>

      <div className={styles.canvasControls}>
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.4)}>
          −
        </button>
        <button type="button" onClick={handleResetView}>
          Reset view
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.4)}>
          +
        </button>
      </div>

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
