import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useUniverseStore } from "../state/universeStore";
import { parseUrlState, serializeUrlState } from "../state/urlState";
import type { UniverseIndex } from "../data/buildIndexes";

/**
 * Keeps the URL and the app store in sync (PROJECT_PLAN.md section 8.2).
 * On first mount it hydrates the store from the URL, falling back to
 * Landscape and surfacing a dismissible notice for an unknown node id.
 * After that, view/selection/depth changes are reflected back into the URL.
 */
export function useUrlSync(index: UniverseIndex, defaultView: "landscape" | "taxonomy" = "landscape"): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const hydrated = useRef(false);

  const view = useUniverseStore((s) => s.view);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const connectionDepth = useUniverseStore((s) => s.connectionDepth);
  const setView = useUniverseStore((s) => s.setView);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const setConnectionDepth = useUniverseStore((s) => s.setConnectionDepth);
  const setUrlNotice = useUniverseStore((s) => s.setUrlNotice);

  useEffect(() => {
    const parsed = parseUrlState(searchParams, index);
    const hasExplicitView = searchParams.has("view");
    setView(hasExplicitView ? parsed.view : defaultView);
    if (parsed.nodeId) {
      selectNode(parsed.nodeId, { openPanel: true });
    }
    if (parsed.depth) setConnectionDepth(parsed.depth);
    if (parsed.requestedNodeId && !parsed.nodeId) {
      setUrlNotice(`"${parsed.requestedNodeId}" is not a known field, domain, or constellation.`);
    }
    hydrated.current = true;
    // Only hydrate once, when the index first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (!hydrated.current) return;
    const params = serializeUrlState({ view, nodeId: selectedNodeId, depth: connectionDepth });
    setSearchParams(params, { replace: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedNodeId, connectionDepth]);
}
