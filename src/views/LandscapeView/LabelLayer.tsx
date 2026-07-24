import { useMemo } from "react";
import type { ConstellationNode, Domain, FieldNode } from "../../types/universe";
import { placeLabels, type LabelCandidateInput } from "../../visualization/labelPlacement";
import type { DomainRegionScreen, ScreenPoint } from "./landscapeLayout";
import { clampNodeRadius } from "./landscapeLayout";
import { domainColorVar } from "../../styles/applyDomainTheme";
import { useUniverseStore } from "../../state/universeStore";

interface LabelLayerProps {
  domains: Domain[];
  domainRegions: Map<string, DomainRegionScreen>;
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

const DOMAIN_LABEL_FONT_SIZE = 14.5;

export function LabelLayer({
  domains,
  domainRegions,
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
  const selectNode = useUniverseStore((s) => s.selectNode);

  const candidates = useMemo(() => {
    const list: LabelCandidateInput[] = [];
    const isAlwaysVisible = (id: string) =>
      id === selectedNodeId || id === hoveredNodeId || id === keyboardFocusedNodeId;
    const showAllFieldLabels = visibleCategories.has("all_field_labels");
    const showPriority1 = visibleCategories.has("priority_1_field_labels");
    const showConstellationLabels = visibleCategories.has("visible_constellations");
    const showDomainLabels = visibleCategories.has("domain_labels");

    if (showDomainLabels) {
      for (const domain of domains) {
        const region = domainRegions.get(domain.id);
        if (!region) continue;
        list.push({
          id: domain.id,
          x: region.cx,
          y: region.cy - region.ry + 16,
          nodeRadius: 0,
          text: domain.name,
          priorityRank: -1,
          alwaysVisible: true,
          anchorMode: "centered",
          fontSize: DOMAIN_LABEL_FONT_SIZE,
        });
      }
    }

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
  }, [
    domains,
    domainRegions,
    fields,
    constellations,
    positions,
    visibleCategories,
    selectedNodeId,
    hoveredNodeId,
    keyboardFocusedNodeId,
    zoomK,
  ]);

  const placed = useMemo(() => placeLabels(candidates, viewport), [candidates, viewport]);
  const domainById = useMemo(() => new Map(domains.map((d) => [d.id, d])), [domains]);

  return (
    <g>
      {[...placed.values()].map((label) => {
        const domain = domainById.get(label.id);
        if (domain) {
          const colorVar = `var(${domainColorVar(domain.id)})`;
          return (
            <g key={label.id} data-no-pan="true" style={{ cursor: "pointer" }} onClick={() => selectNode(domain.id, { openPanel: true })}>
              <rect
                x={label.x - label.width / 2 - 8}
                y={label.y - label.height / 2 - 3}
                width={label.width + 16}
                height={label.height + 6}
                rx={7}
                fill="var(--surface-1)"
                fillOpacity={0.72}
                stroke={colorVar}
                strokeOpacity={0.5}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={label.fontSize}
                fontWeight={600}
                fill={colorVar}
                pointerEvents="none"
              >
                {label.text}
              </text>
            </g>
          );
        }
        return (
          <text
            key={label.id}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline="middle"
            fontSize={label.fontSize}
            fontWeight={500}
            fill="var(--text-primary)"
            paintOrder="stroke"
            stroke="var(--background)"
            strokeWidth={3}
            pointerEvents="none"
          >
            {label.text}
          </text>
        );
      })}
    </g>
  );
}
