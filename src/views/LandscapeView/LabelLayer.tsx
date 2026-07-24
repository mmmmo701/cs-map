import { useMemo } from "react";
import type { ConstellationNode, FieldNode } from "../../types/universe";
import { placeLabels, type LabelCandidateInput } from "../../visualization/labelPlacement";
import type { ScreenPoint } from "./landscapeLayout";
import { clampNodeRadius } from "./landscapeLayout";

interface LabelLayerProps {
  fields: FieldNode[];
  constellations: ConstellationNode[];
  positions: Map<string, ScreenPoint>;
  visibleCategories: Set<string>;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  keyboardFocusedNodeId: string | null;
  zoomK: number;
  viewport: { width: number; height: number };
}

export function LabelLayer({
  fields,
  constellations,
  positions,
  visibleCategories,
  selectedNodeId,
  hoveredNodeId,
  keyboardFocusedNodeId,
  zoomK,
  viewport,
}: LabelLayerProps) {
  const candidates = useMemo(() => {
    const list: LabelCandidateInput[] = [];
    const isAlwaysVisible = (id: string) =>
      id === selectedNodeId || id === hoveredNodeId || id === keyboardFocusedNodeId;
    const showAllFieldLabels = visibleCategories.has("all_field_labels");
    const showPriority1 = visibleCategories.has("priority_1_field_labels");
    const showConstellationLabels = visibleCategories.has("visible_constellations");

    for (const field of fields) {
      const point = positions.get(field.id);
      if (!point) continue;
      const always = isAlwaysVisible(field.id);
      const eligible = always || showAllFieldLabels || (showPriority1 && field.display.priority === 1);
      if (!eligible) continue;
      const priorityRank = always ? 0 : field.display.priority === 1 ? 1 : 2;
      const baseRadius = field.node_class === "bridge_field" ? 8 : 7;
      list.push({
        id: field.id,
        x: point.x,
        y: point.y,
        nodeRadius: clampNodeRadius(baseRadius, zoomK),
        text: field.name,
        priorityRank,
        alwaysVisible: always,
      });
    }

    for (const constellation of constellations) {
      const point = positions.get(constellation.id);
      if (!point) continue;
      const always = isAlwaysVisible(constellation.id);
      const eligible = always || showConstellationLabels;
      if (!eligible) continue;
      list.push({
        id: constellation.id,
        x: point.x,
        y: point.y,
        nodeRadius: clampNodeRadius(9, zoomK),
        text: constellation.name,
        priorityRank: always ? 0 : 3,
        alwaysVisible: always,
      });
    }

    return list;
  }, [fields, constellations, positions, visibleCategories, selectedNodeId, hoveredNodeId, keyboardFocusedNodeId, zoomK]);

  const placed = useMemo(() => placeLabels(candidates, viewport), [candidates, viewport]);

  return (
    <g>
      {[...placed.values()].map((label) => (
        <text
          key={label.id}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor}
          dominantBaseline="middle"
          fontSize={12.5}
          fontWeight={500}
          fill="var(--text-primary)"
          paintOrder="stroke"
          stroke="var(--background)"
          strokeWidth={3}
          pointerEvents="none"
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}
