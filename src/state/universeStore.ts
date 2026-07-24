import { create } from "zustand";
import { createDefaultFilters, type CameraState, type FilterState, type ViewId } from "./types";
import type { NodeClassFilter, NodeId } from "../types/universe";

export type ConnectionLayoutMode = "domain_sectors" | "radial";

export const DEFAULT_CAMERA: CameraState = { x: 0, y: 0, k: 1 };

export interface AppState {
  view: ViewId;
  selectedNodeId: NodeId | null;
  hoveredNodeId: NodeId | null;
  keyboardFocusedNodeId: NodeId | null;
  searchQuery: string;
  filters: FilterState;
  landscapeCamera: CameraState;
  connectionDepth: 1 | 2;
  connectionLayoutMode: ConnectionLayoutMode;
  connectionBreadcrumbs: NodeId[];
  detailsPanelOpen: boolean;
  filtersOpen: boolean;
  helpOpen: boolean;
  urlNotice: string | null;

  setView: (view: ViewId) => void;
  selectNode: (nodeId: NodeId | null, options?: { openPanel?: boolean }) => void;
  clearSelection: () => void;
  setHoveredNode: (nodeId: NodeId | null) => void;
  setKeyboardFocusedNode: (nodeId: NodeId | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (updater: (filters: FilterState) => FilterState) => void;
  toggleDomainFilter: (domainId: string, allDomainIds: string[]) => void;
  toggleNodeClassFilter: (nodeClass: NodeClassFilter) => void;
  toggleShowConstellations: () => void;
  toggleRelationshipType: (relationTypeId: string, allTypeIds: string[]) => void;
  setCoordinateRange: (axis: "x" | "y", range: [number, number]) => void;
  resetFilters: () => void;
  resetView: () => void;
  setLandscapeCamera: (camera: CameraState) => void;
  setConnectionDepth: (depth: 1 | 2) => void;
  setConnectionLayoutMode: (mode: ConnectionLayoutMode) => void;
  pushConnectionRoot: (nodeId: NodeId) => void;
  setDetailsPanelOpen: (open: boolean) => void;
  setFiltersOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setUrlNotice: (notice: string | null) => void;
}

export const useUniverseStore = create<AppState>((set) => ({
  view: "landscape",
  selectedNodeId: null,
  hoveredNodeId: null,
  keyboardFocusedNodeId: null,
  searchQuery: "",
  filters: createDefaultFilters(),
  landscapeCamera: DEFAULT_CAMERA,
  connectionDepth: 1,
  connectionLayoutMode: "domain_sectors",
  connectionBreadcrumbs: [],
  detailsPanelOpen: false,
  filtersOpen: false,
  helpOpen: false,
  urlNotice: null,

  setView: (view) => set({ view }),

  selectNode: (nodeId, options) =>
    set((state) => ({
      selectedNodeId: nodeId,
      detailsPanelOpen: nodeId ? (options?.openPanel ?? true) : false,
      connectionBreadcrumbs:
        nodeId && state.view === "connections" ? pushBreadcrumb(state.connectionBreadcrumbs, nodeId) : state.connectionBreadcrumbs,
    })),

  clearSelection: () => set({ selectedNodeId: null, detailsPanelOpen: false }),

  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  setKeyboardFocusedNode: (nodeId) => set({ keyboardFocusedNodeId: nodeId }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (updater) => set((state) => ({ filters: updater(state.filters) })),

  // Same "empty means all" convention as relationshipTypes — see the
  // toggleRelationshipType comment for why this can't be a plain add/delete.
  toggleDomainFilter: (domainId, allDomainIds) =>
    set((state) => {
      const current = state.filters.domainIds;
      const currentlyAllowed = current.size === 0 || current.has(domainId);
      let domainIds: Set<string>;
      if (currentlyAllowed) {
        domainIds = current.size === 0 ? new Set(allDomainIds) : new Set(current);
        domainIds.delete(domainId);
      } else {
        domainIds = new Set(current);
        domainIds.add(domainId);
        if (domainIds.size === allDomainIds.length) domainIds = new Set();
      }
      return { filters: { ...state.filters, domainIds } };
    }),

  toggleNodeClassFilter: (nodeClass) =>
    set((state) => {
      const nodeClasses = new Set(state.filters.nodeClasses);
      if (nodeClasses.has(nodeClass)) nodeClasses.delete(nodeClass);
      else nodeClasses.add(nodeClass);
      return { filters: { ...state.filters, nodeClasses } };
    }),

  toggleShowConstellations: () =>
    set((state) => ({
      filters: { ...state.filters, showConstellations: !state.filters.showConstellations },
    })),

  // An empty relationshipTypes set means "all allowed" (see FilterState docs).
  // Toggling one off from that implicit-all state must exclude just that
  // type, not collapse to "only this type" — so we expand to the full set
  // first when needed, and canonicalize back to empty once everything is
  // re-included.
  toggleRelationshipType: (relationTypeId, allTypeIds) =>
    set((state) => {
      const current = state.filters.relationshipTypes;
      const currentlyAllowed = current.size === 0 || current.has(relationTypeId);
      let relationshipTypes: Set<string>;
      if (currentlyAllowed) {
        relationshipTypes = current.size === 0 ? new Set(allTypeIds) : new Set(current);
        relationshipTypes.delete(relationTypeId);
      } else {
        relationshipTypes = new Set(current);
        relationshipTypes.add(relationTypeId);
        if (relationshipTypes.size === allTypeIds.length) relationshipTypes = new Set();
      }
      return { filters: { ...state.filters, relationshipTypes } };
    }),

  setCoordinateRange: (axis, range) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [axis === "x" ? "xRange" : "yRange"]: range,
      },
    })),

  resetFilters: () => set({ filters: createDefaultFilters() }),

  resetView: () =>
    set({
      filters: createDefaultFilters(),
      selectedNodeId: null,
      detailsPanelOpen: false,
      landscapeCamera: DEFAULT_CAMERA,
      connectionDepth: 1,
      connectionBreadcrumbs: [],
    }),

  setLandscapeCamera: (camera) => set({ landscapeCamera: camera }),
  setConnectionDepth: (depth) => set({ connectionDepth: depth }),
  setConnectionLayoutMode: (mode) => set({ connectionLayoutMode: mode }),

  pushConnectionRoot: (nodeId) =>
    set((state) => ({
      selectedNodeId: nodeId,
      detailsPanelOpen: state.detailsPanelOpen,
      connectionBreadcrumbs: pushBreadcrumb(state.connectionBreadcrumbs, nodeId),
    })),

  setDetailsPanelOpen: (open) => set({ detailsPanelOpen: open }),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
  setHelpOpen: (open) => set({ helpOpen: open }),
  setUrlNotice: (notice) => set({ urlNotice: notice }),
}));

function pushBreadcrumb(breadcrumbs: NodeId[], nodeId: NodeId): NodeId[] {
  const withoutDuplicate = breadcrumbs.filter((id) => id !== nodeId);
  return [...withoutDuplicate, nodeId].slice(-8);
}
