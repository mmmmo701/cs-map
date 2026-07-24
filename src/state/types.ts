import type { NodeClassFilter } from "../types/universe";

export type ViewId = "landscape" | "connections" | "taxonomy";

export interface FilterState {
  domainIds: Set<string>;
  nodeClasses: Set<NodeClassFilter>;
  xRange: [number, number];
  yRange: [number, number];
  relationshipTypes: Set<string>;
  showConstellations: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  k: number;
}

/**
 * An empty domainIds / relationshipTypes set means "no restriction" (all
 * allowed) — mirrors the recommendation in PROJECT_PLAN.md section 16.1.
 */
export function createDefaultFilters(): FilterState {
  return {
    domainIds: new Set(),
    nodeClasses: new Set(["ordinary_field", "bridge_field", "constellation"]),
    xRange: [0, 100],
    yRange: [0, 100],
    relationshipTypes: new Set(),
    showConstellations: false,
  };
}
