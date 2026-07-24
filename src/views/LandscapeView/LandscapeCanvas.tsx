import { useEffect, useMemo, useRef, useState } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { ConstellationNode, FieldNode } from "../../types/universe";
import { createScales } from "../../visualization/coordinateScales";
import { EdgeMarkerDefs } from "../../visualization/markers";
import { useLandscapeZoom } from "../../visualization/zoomController";
import { useUniverseStore } from "../../state/universeStore";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  resolveVisibleZoomCategories,
  toZoomTransform,
  type ScreenPoint,
} from "./landscapeLayout";
import { AxesLayer } from "./AxesLayer";
import { DomainRegionLayer } from "./DomainRegionLayer";
import { RelationLayer } from "./RelationLayer";
import { NodeLayer } from "./NodeLayer";
import { LabelLayer } from "./LabelLayer";
import { HoverTooltip } from "./HoverTooltip";
import styles from "./LandscapeView.module.css";

interface LandscapeCanvasProps {
  index: UniverseIndex;
  fields: FieldNode[];
  constellations: ConstellationNode[];
}

const HOVER_DELAY_MS = 100;

export function LandscapeCanvas({ index, fields, constellations }: LandscapeCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const reducedMotion = useReducedMotion();

  const camera = useUniverseStore((s) => s.landscapeCamera);
  const setCamera = useUniverseStore((s) => s.setLandscapeCamera);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const clearSelection = useUniverseStore((s) => s.clearSelection);
  const keyboardFocusedNodeId = useUniverseStore((s) => s.keyboardFocusedNodeId);
  const setKeyboardFocusedNode = useUniverseStore((s) => s.setKeyboardFocusedNode);

  const [rawHoverId, setRawHoverId] = useState<string | null>(null);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, ScreenPoint>>(new Map());
  const [activeZoomIndices, setActiveZoomIndices] = useState<Set<number>>(new Set());
  const panMovedRef = useRef(false);
  const pulseKeyRef = useRef(0);
  const [pulseKey, setPulseKey] = useState(0);
  const previousSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({ width: Math.max(width, 200), height: Math.max(height, 200) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rawHoverId) {
      setActiveHoverId(null);
      return;
    }
    const timer = setTimeout(() => setActiveHoverId(rawHoverId), HOVER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [rawHoverId]);

  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== previousSelectedRef.current) {
      pulseKeyRef.current += 1;
      setPulseKey(pulseKeyRef.current);
    }
    previousSelectedRef.current = selectedNodeId;
  }, [selectedNodeId]);

  const { setTransform } = useLandscapeZoom(svgRef, {
    onCameraChange: (next) => {
      panMovedRef.current = true;
      setCamera(next);
    },
  });

  const scales = useMemo(() => createScales(dimensions.width, dimensions.height), [dimensions]);
  const transform = useMemo(() => toZoomTransform(camera), [camera]);

  useEffect(() => {
    const result = resolveVisibleZoomCategories(index.data.visual_design.semantic_zoom, transform.k, activeZoomIndices);
    const changed =
      result.activeIndices.size !== activeZoomIndices.size ||
      [...result.activeIndices].some((i) => !activeZoomIndices.has(i));
    if (changed) setActiveZoomIndices(result.activeIndices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transform.k]);

  const visibleCategories = useMemo(
    () =>
      resolveVisibleZoomCategories(index.data.visual_design.semantic_zoom, transform.k, activeZoomIndices).show,
    [index, transform.k, activeZoomIndices],
  );
  const showNodes = visibleCategories.has("all_field_nodes") || !!selectedNodeId || !!activeHoverId;

  const focusNodeId = activeHoverId ?? selectedNodeId;

  function handleCanvasClick(event: React.MouseEvent<SVGSVGElement>) {
    const target = event.target as Element;
    // Domain regions and other decoration sit visually on top of the
    // background rect but aren't its DOM descendant, so this has to be
    // handled at the svg level: anything not explicitly interactive
    // (marked data-no-pan) counts as an empty-canvas click.
    if (target.closest("[data-no-pan]")) return;
    if (!panMovedRef.current) clearSelection();
    panMovedRef.current = false;
  }

  function handleResetCamera() {
    setTransform({ x: 0, y: 0, k: 1 });
  }

  function centerOnNode(id: string) {
    const point = positions.get(id);
    if (!point) return;
    const basePt = { x: (point.x - camera.x) / camera.k, y: (point.y - camera.y) / camera.k };
    const targetK = Math.max(camera.k, 1);
    setTransform({
      x: dimensions.width / 2 - basePt.x * targetK,
      y: dimensions.height / 2 - basePt.y * targetK,
      k: targetK,
    });
  }

  function handleCanvasKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.key === "Home") {
      event.preventDefault();
      handleResetCamera();
      return;
    }
    if (!event.key.startsWith("Arrow")) return;
    const currentId = keyboardFocusedNodeId ?? selectedNodeId;
    const candidates = [...positions.entries()];
    if (candidates.length === 0) return;

    let nextId: string | null = null;
    if (!currentId) {
      nextId = candidates[0][0];
    } else {
      const current = positions.get(currentId);
      if (!current) return;
      const dirX = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      const dirY = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      let best: { id: string; score: number } | null = null;
      for (const [id, point] of candidates) {
        if (id === currentId) continue;
        const dx = point.x - current.x;
        const dy = point.y - current.y;
        const alongAxis = dx * dirX + dy * dirY;
        if (alongAxis <= 0) continue;
        const lateral = Math.abs(dx * dirY - dy * dirX);
        const score = alongAxis + lateral * 2;
        if (!best || score < best.score) best = { id, score };
      }
      nextId = best?.id ?? null;
    }

    if (nextId) {
      event.preventDefault();
      setKeyboardFocusedNode(nextId);
      const el = svgRef.current?.querySelector<SVGElement>(`[data-node-id="${CSS.escape(nextId)}"]`);
      (el?.parentElement as unknown as SVGGElement | null)?.focus?.();
    }
  }

  const haloConfig = index.data.visual_design.node_styles.selected;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <svg
        ref={svgRef}
        className={styles.svg}
        width={dimensions.width}
        height={dimensions.height}
        role="group"
        aria-label={`Landscape map of computer science fields. ${fields.length} fields shown, positioned by abstraction and human-centeredness. Contains focusable field nodes.`}
        onKeyDown={handleCanvasKeyDown}
        onClick={handleCanvasClick}
        tabIndex={-1}
      >
        <EdgeMarkerDefs />
        <rect x={0} y={0} width={dimensions.width} height={dimensions.height} fill="var(--background)" />

        <DomainRegionLayer
          domains={index.domainsSorted}
          scales={scales}
          transform={transform}
          domainRendering={index.data.visual_design.domain_rendering}
        />
        <AxesLayer
          scales={scales}
          transform={transform}
          xAxis={index.data.metadata.coordinate_system.x}
          yAxis={index.data.metadata.coordinate_system.y}
          dimmed={!!selectedNodeId}
        />
        <RelationLayer index={index} focusNodeId={focusNodeId} positions={positions} />
        <NodeLayer
          index={index}
          scales={scales}
          transform={transform}
          fields={fields}
          constellations={constellations}
          showNodes={showNodes}
          focusNodeId={focusNodeId}
          selectedNodeId={selectedNodeId}
          keyboardFocusedNodeId={keyboardFocusedNodeId}
          haloRadius={haloConfig.halo_radius_px}
          haloOpacity={haloConfig.halo_opacity}
          pulseKey={reducedMotion ? -1 : pulseKey}
          onSelect={(id) => selectNode(id, { openPanel: true })}
          onHoverStart={setRawHoverId}
          onHoverEnd={() => setRawHoverId(null)}
          onFocusNode={setKeyboardFocusedNode}
          onDoubleClickNode={centerOnNode}
          onPositionsComputed={setPositions}
        />
        {showNodes && (
          <LabelLayer
            fields={fields}
            constellations={constellations}
            positions={positions}
            visibleCategories={visibleCategories}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={activeHoverId}
            keyboardFocusedNodeId={keyboardFocusedNodeId}
            zoomK={transform.k}
            viewport={dimensions}
          />
        )}
      </svg>

      {activeHoverId && (
        <HoverTooltip index={index} nodeId={activeHoverId} anchor={positions.get(activeHoverId) ?? null} />
      )}

      <div className={styles.canvasControls}>
        <button type="button" onClick={handleResetCamera}>
          Reset view
        </button>
      </div>
    </div>
  );
}
