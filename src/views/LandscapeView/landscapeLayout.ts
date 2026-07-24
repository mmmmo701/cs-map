import { zoomIdentity, type ZoomTransform } from "d3-zoom";
import type { Scales } from "../../visualization/coordinateScales";
import type { CameraState } from "../../state/types";
import type { ConceptualPosition, Domain } from "../../types/universe";

export function toZoomTransform(camera: CameraState): ZoomTransform {
  return zoomIdentity.translate(camera.x, camera.y).scale(camera.k);
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export function basePosition(scales: Scales, position: ConceptualPosition): ScreenPoint {
  return { x: scales.x(position.abstract_to_concrete), y: scales.y(position.machine_to_human) };
}

export function toScreen(transform: ZoomTransform, point: ScreenPoint): ScreenPoint {
  const [x, y] = transform.apply([point.x, point.y]);
  return { x, y };
}

export interface DomainRegionScreen {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export function domainRegionScreen(scales: Scales, transform: ZoomTransform, domain: Domain): DomainRegionScreen {
  const unitX = (scales.x(100) - scales.x(0)) / 100;
  const unitY = (scales.y(0) - scales.y(100)) / 100;
  const center = toScreen(transform, {
    x: scales.x(domain.region.center.x),
    y: scales.y(domain.region.center.y),
  });
  return {
    cx: center.x,
    cy: center.y,
    rx: Math.abs(domain.region.radius_x * unitX * transform.k),
    ry: Math.abs(domain.region.radius_y * unitY * transform.k),
  };
}

/** Radius stays legible across zoom levels without growing unbounded (section 11.6). */
export function clampNodeRadius(baseRadius: number, k: number): number {
  return Math.min(11, Math.max(6, baseRadius * Math.sqrt(k)));
}

export interface SemanticZoomStep {
  minimum_zoom: number;
  show: string[];
}

const ZOOM_HYSTERESIS = 0.03;

/**
 * Each threshold's categories are cumulative — zooming in keeps everything
 * already shown and adds more (section 11.9's steps build on each other).
 * A small hysteresis band around each individual threshold prevents a
 * category from flickering on/off while the pointer rests near a boundary.
 */
export function resolveVisibleZoomCategories(
  steps: SemanticZoomStep[],
  k: number,
  previouslyActive: ReadonlySet<number>,
): { activeIndices: Set<number>; show: Set<string> } {
  const activeIndices = new Set<number>();
  const show = new Set<string>();

  steps.forEach((step, i) => {
    const wasActive = previouslyActive.has(i);
    const isActive = wasActive ? k >= step.minimum_zoom - ZOOM_HYSTERESIS : k >= step.minimum_zoom + ZOOM_HYSTERESIS;
    if (isActive) {
      activeIndices.add(i);
      for (const category of step.show) show.add(category);
    }
  });

  return { activeIndices, show };
}
