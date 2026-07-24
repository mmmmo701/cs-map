import type { UniverseIndex } from "../data/buildIndexes";
import type { ViewId } from "./types";
import type { NodeId } from "../types/universe";

const VALID_VIEWS: ViewId[] = ["landscape", "connections", "taxonomy"];

export interface UrlState {
  view: ViewId;
  nodeId: NodeId | null;
  depth: 1 | 2;
  requestedNodeId: string | null;
}

export function parseUrlState(searchParams: URLSearchParams, index: UniverseIndex): UrlState {
  const rawView = searchParams.get("view");
  const view: ViewId = VALID_VIEWS.includes(rawView as ViewId) ? (rawView as ViewId) : "landscape";

  const requestedNodeId = searchParams.get("node");
  const nodeId = requestedNodeId && index.nodeById.has(requestedNodeId) ? requestedNodeId : null;

  const rawDepth = searchParams.get("depth");
  const depth: 1 | 2 = rawDepth === "2" ? 2 : 1;

  return { view, nodeId, depth, requestedNodeId };
}

export function serializeUrlState(state: { view: ViewId; nodeId: NodeId | null; depth: 1 | 2 }): URLSearchParams {
  const params = new URLSearchParams();
  params.set("view", state.view);
  if (state.nodeId) params.set("node", state.nodeId);
  if (state.view === "connections" && state.depth === 2) params.set("depth", "2");
  return params;
}
