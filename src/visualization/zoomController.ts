import { useEffect, useMemo, useRef } from "react";
import { select, type Selection } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import type { CameraState } from "../state/types";

export const ZOOM_EXTENT: [number, number] = [0.55, 3.0];

interface UseLandscapeZoomOptions {
  onCameraChange: (camera: CameraState) => void;
  disabled?: boolean;
}

export interface LandscapeZoomControls {
  setTransform: (camera: CameraState) => void;
}

/**
 * Wires d3-zoom to an SVG root for pan/zoom. D3 only computes the transform —
 * React remains responsible for rendering the resulting <g transform> (see
 * PROJECT_PLAN.md section 4.1). Panning is blocked when the gesture starts on
 * an element marked data-no-pan (nodes, labels, controls).
 */
export function useLandscapeZoom(
  svgRef: React.RefObject<SVGSVGElement | null>,
  { onCameraChange, disabled }: UseLandscapeZoomOptions,
): LandscapeZoomControls {
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;

  const behavior = useMemo(() => {
    return zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_EXTENT)
      .filter((event: Event) => {
        const target = event.target as Element | null;
        if (target?.closest?.("[data-no-pan]")) return false;
        if (event.type === "mousedown") return !(event as MouseEvent).button;
        return true;
      });
  }, []);

  useEffect(() => {
    behaviorRef.current = behavior;
    if (!svgRef.current) return;
    const selection = select(svgRef.current) as Selection<SVGSVGElement, unknown, null, undefined>;

    behavior.on("zoom", (event) => {
      const t = event.transform;
      onCameraChangeRef.current({ x: t.x, y: t.y, k: t.k });
    });

    if (!disabled) {
      selection.call(behavior);
    }
    selection.on("dblclick.zoom", null);

    return () => {
      selection.on(".zoom", null);
    };
  }, [svgRef, behavior, disabled]);

  const setTransform = (camera: CameraState) => {
    if (!svgRef.current || !behaviorRef.current) return;
    const selection = select(svgRef.current) as Selection<SVGSVGElement, unknown, null, undefined>;
    selection.call(behaviorRef.current.transform, zoomIdentity.translate(camera.x, camera.y).scale(camera.k));
  };

  return { setTransform };
}
