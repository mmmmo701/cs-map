import { useEffect, useMemo } from "react";
import type { ZoomTransform } from "d3-zoom";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { ConstellationNode, FieldNode } from "../../types/universe";
import type { Scales } from "../../visualization/coordinateScales";
import { NodeGlyph } from "../../visualization/NodeGlyph";
import { getConceptualRelations, getConstellationsForField } from "../../data/selectors";
import { basePosition, clampNodeRadius, toScreen, type ScreenPoint } from "./landscapeLayout";

interface NodeLayerProps {
  index: UniverseIndex;
  scales: Scales;
  transform: ZoomTransform;
  fields: FieldNode[];
  constellations: ConstellationNode[];
  showNodes: boolean;
  focusNodeId: string | null;
  selectedNodeId: string | null;
  keyboardFocusedNodeId: string | null;
  haloRadius: number;
  haloOpacity: number;
  pulseKey: number;
  onSelect: (id: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onFocusNode: (id: string) => void;
  onDoubleClickNode: (id: string) => void;
  onPositionsComputed: (positions: Map<string, ScreenPoint>) => void;
}

export function NodeLayer({
  index,
  scales,
  transform,
  fields,
  constellations,
  showNodes,
  focusNodeId,
  selectedNodeId,
  keyboardFocusedNodeId,
  haloRadius,
  haloOpacity,
  pulseKey,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onFocusNode,
  onDoubleClickNode,
  onPositionsComputed,
}: NodeLayerProps) {
  const relatedIds = useMemo(() => {
    if (!focusNodeId) return null;
    const ids = new Set<string>([focusNodeId]);
    for (const relation of getConceptualRelations(index, focusNodeId)) {
      ids.add(relation.source === focusNodeId ? relation.target : relation.source);
    }
    for (const c of getConstellationsForField(index, focusNodeId)) ids.add(c.id);
    return ids;
  }, [index, focusNodeId]);

  const positions = useMemo(() => {
    const map = new Map<string, ScreenPoint>();
    for (const field of fields) map.set(field.id, toScreen(transform, basePosition(scales, field.position)));
    for (const c of constellations) map.set(c.id, toScreen(transform, basePosition(scales, c.position)));
    return map;
  }, [fields, constellations, scales, transform]);

  useEffect(() => {
    onPositionsComputed(positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  if (!showNodes) return null;

  return (
    <g>
      {fields.map((field) => {
        const point = positions.get(field.id);
        if (!point) return null;
        const nodeStyle = field.node_class === "bridge_field" ? "bridge_field" : "ordinary_field";
        const baseRadius = nodeStyle === "bridge_field" ? 8 : 7;
        const colors = field.domain_ids.map((id) => index.domainById.get(id)?.color ?? "#888888");
        const domainNames = field.domain_ids.map((id) => index.domainById.get(id)?.name ?? id);
        const ariaLabel =
          nodeStyle === "bridge_field"
            ? `${field.name}, bridge field in ${domainNames.join(" and ")}`
            : `${field.name}, ordinary field in ${domainNames[0] ?? ""}`;
        return (
          <NodeGlyph
            key={field.id}
            id={field.id}
            kind={nodeStyle}
            x={point.x}
            y={point.y}
            radius={clampNodeRadius(baseRadius, transform.k)}
            colors={colors}
            ariaLabel={ariaLabel}
            selected={selectedNodeId === field.id}
            hovered={focusNodeId === field.id && focusNodeId !== selectedNodeId}
            focused={keyboardFocusedNodeId === field.id}
            dimmed={!!relatedIds && !relatedIds.has(field.id)}
            haloRadius={haloRadius}
            haloOpacity={haloOpacity}
            pulseKey={selectedNodeId === field.id ? pulseKey : undefined}
            onSelect={() => onSelect(field.id)}
            onHoverStart={() => onHoverStart(field.id)}
            onHoverEnd={onHoverEnd}
            onFocusNode={() => onFocusNode(field.id)}
            onDoubleClick={() => onDoubleClickNode(field.id)}
          />
        );
      })}
      {constellations.map((constellation) => {
        const point = positions.get(constellation.id);
        if (!point) return null;
        const colors = constellation.domain_ids.map((id) => index.domainById.get(id)?.color ?? "#888888");
        return (
          <NodeGlyph
            key={constellation.id}
            id={constellation.id}
            kind="constellation"
            x={point.x}
            y={point.y}
            radius={clampNodeRadius(9, transform.k)}
            colors={colors}
            ariaLabel={`${constellation.name}, cross-cutting constellation`}
            selected={selectedNodeId === constellation.id}
            hovered={focusNodeId === constellation.id && focusNodeId !== selectedNodeId}
            focused={keyboardFocusedNodeId === constellation.id}
            dimmed={!!relatedIds && !relatedIds.has(constellation.id)}
            haloRadius={haloRadius}
            haloOpacity={haloOpacity}
            pulseKey={selectedNodeId === constellation.id ? pulseKey : undefined}
            onSelect={() => onSelect(constellation.id)}
            onHoverStart={() => onHoverStart(constellation.id)}
            onHoverEnd={onHoverEnd}
            onFocusNode={() => onFocusNode(constellation.id)}
            onDoubleClick={() => onDoubleClickNode(constellation.id)}
          />
        );
      })}
    </g>
  );
}
