import type { UniverseIndex } from "./buildIndexes";
import type { FilterState } from "../state/types";
import type {
  ConstellationNode,
  Domain,
  FieldNode,
  NodeId,
  Relation,
  UniverseNode,
} from "../types/universe";

export function isFieldNode(node: UniverseNode | Domain | undefined): node is FieldNode {
  return !!node && "kind" in node && node.kind === "field";
}

export function isConstellationNode(
  node: UniverseNode | Domain | undefined,
): node is ConstellationNode {
  return !!node && "kind" in node && node.kind === "constellation";
}

export function isDomain(node: UniverseNode | Domain | undefined): node is Domain {
  return !!node && !("kind" in node);
}

export function getNode(index: UniverseIndex, id: NodeId) {
  return index.nodeById.get(id);
}

export function getNodeName(index: UniverseIndex, id: NodeId): string {
  return getNode(index, id)?.name ?? id;
}

export function getDomainIdsForNode(index: UniverseIndex, id: NodeId): string[] {
  const node = getNode(index, id);
  if (isDomain(node)) return [node.id];
  if (isFieldNode(node) || isConstellationNode(node)) return node.domain_ids;
  return [];
}

export function fieldMatchesFilters(field: FieldNode, filters: FilterState): boolean {
  if (!filters.nodeClasses.has(field.node_class)) return false;
  if (filters.domainIds.size > 0 && !field.domain_ids.some((id) => filters.domainIds.has(id))) {
    return false;
  }
  const { abstract_to_concrete: x, machine_to_human: y } = field.position;
  if (x < filters.xRange[0] || x > filters.xRange[1]) return false;
  if (y < filters.yRange[0] || y > filters.yRange[1]) return false;
  return true;
}

export function constellationMatchesDomainFilter(constellation: ConstellationNode, filters: FilterState): boolean {
  if (filters.domainIds.size > 0 && !constellation.domain_ids.some((id) => filters.domainIds.has(id))) {
    return false;
  }
  return true;
}

/**
 * Reveal rules from PROJECT_PLAN.md section 17.2 — a constellation is only
 * visible when the "Show constellations" filter is on, or a more specific
 * context (selection, search, component focus) calls for it.
 */
export function isConstellationRevealed(
  constellation: ConstellationNode,
  filters: FilterState,
  context: {
    selectedNodeId?: NodeId | null;
    searchResultIds?: Set<NodeId>;
    revealedByNeighborhood?: Set<NodeId>;
  },
): boolean {
  // Specific contexts (selection, search, component focus) always win, even
  // if the general node-class filter has constellations switched off — see
  // PROJECT_PLAN.md section 16.2.
  if (context.selectedNodeId === constellation.id) return true;
  if (context.searchResultIds?.has(constellation.id)) return true;
  if (context.selectedNodeId && constellation.component_field_ids.includes(context.selectedNodeId)) {
    return true;
  }
  if (context.revealedByNeighborhood?.has(constellation.id)) return true;
  if (!filters.nodeClasses.has("constellation")) return false;
  return filters.showConstellations;
}

export function getVisibleFields(index: UniverseIndex, filters: FilterState): FieldNode[] {
  return index.data.fields.filter((field) => fieldMatchesFilters(field, filters));
}

export function getConstellationsForField(index: UniverseIndex, fieldId: NodeId): ConstellationNode[] {
  return index.constellationsByComponent.get(fieldId) ?? [];
}

/** Direct conceptual relations for a node, excluding taxonomic part_of edges. */
export function getConceptualRelations(index: UniverseIndex, nodeId: NodeId): Relation[] {
  const all = index.undirectedAdjacency.get(nodeId) ?? [];
  return all.filter((relation) => relation.type !== "part_of");
}

export interface RelationWithDirection {
  relation: Relation;
  direction: "outgoing" | "incoming" | "undirected";
  otherNodeId: NodeId;
}

export function getRelationsWithDirection(index: UniverseIndex, nodeId: NodeId): RelationWithDirection[] {
  const relations = getConceptualRelations(index, nodeId);
  return relations.map((relation) => {
    const relationType = index.relationTypeById.get(relation.type);
    const directed = relationType?.directed ?? false;
    if (!directed) {
      const otherNodeId = relation.source === nodeId ? relation.target : relation.source;
      return { relation, direction: "undirected" as const, otherNodeId };
    }
    if (relation.source === nodeId) {
      return { relation, direction: "outgoing" as const, otherNodeId: relation.target };
    }
    return { relation, direction: "incoming" as const, otherNodeId: relation.source };
  });
}

export interface RelationGroup {
  relationTypeId: string;
  relationTypeLabel: string;
  direction: "outgoing" | "incoming" | "undirected";
  items: { nodeId: NodeId; nodeName: string; relation: Relation }[];
}

/** Groups a node's relations by relation type + direction, for the detail panel (section 15.6). */
export function getRelationsGroupedByType(index: UniverseIndex, nodeId: NodeId): RelationGroup[] {
  const withDirection = getRelationsWithDirection(index, nodeId);
  const groups = new Map<string, RelationGroup>();

  for (const { relation, direction, otherNodeId } of withDirection) {
    const relationType = index.relationTypeById.get(relation.type);
    const key = `${relation.type}|${direction}`;
    if (!groups.has(key)) {
      groups.set(key, {
        relationTypeId: relation.type,
        relationTypeLabel: relationType?.label ?? relation.type,
        direction,
        items: [],
      });
    }
    groups.get(key)!.items.push({
      nodeId: otherNodeId,
      nodeName: getNodeName(index, otherNodeId),
      relation,
    });
  }

  return [...groups.values()].sort((a, b) => a.relationTypeLabel.localeCompare(b.relationTypeLabel));
}

/** Builds a readable sentence for a relation, respecting actual edge direction (section 12.6, 15.6). */
export function buildRelationSentence(
  index: UniverseIndex,
  relation: Relation,
): string {
  const relationType = index.relationTypeById.get(relation.type);
  const label = relationType?.label ?? relation.type;
  const sourceName = getNodeName(index, relation.source);
  const targetName = getNodeName(index, relation.target);
  const verb = label.charAt(0).toLowerCase() + label.slice(1);
  return `${sourceName} ${verb} ${targetName}.`;
}

export interface NeighborhoodResult {
  rootId: NodeId;
  nodeIds: Set<NodeId>;
  depth1: NodeId[];
  depth2: NodeId[];
  relations: Relation[];
  truncated: boolean;
}

const MAX_DEPTH_2_NODES = 40;

export function getNeighborhood(
  index: UniverseIndex,
  rootId: NodeId,
  depth: 1 | 2,
  filters: FilterState,
): NeighborhoodResult {
  const nodeIds = new Set<NodeId>([rootId]);
  const relationsUsed: Relation[] = [];
  const rootNode = getNode(index, rootId);

  const relationAllowed = (relation: Relation) => {
    if (relation.type === "part_of") return false;
    return filters.relationshipTypes.size === 0 || filters.relationshipTypes.has(relation.type);
  };

  const depth1: NodeId[] = [];
  const depth1Relations = getConceptualRelations(index, rootId).filter(relationAllowed);
  for (const relation of depth1Relations) {
    const otherId = relation.source === rootId ? relation.target : relation.source;
    if (!nodeIds.has(otherId)) {
      nodeIds.add(otherId);
      depth1.push(otherId);
    }
    relationsUsed.push(relation);
  }

  if (isConstellationNode(rootNode)) {
    for (const componentId of rootNode.component_field_ids) {
      if (!nodeIds.has(componentId)) {
        nodeIds.add(componentId);
        depth1.push(componentId);
      }
    }
  }
  for (const constellation of getConstellationsForField(index, rootId)) {
    if (!nodeIds.has(constellation.id)) {
      nodeIds.add(constellation.id);
      depth1.push(constellation.id);
    }
  }

  const depth2: NodeId[] = [];
  let truncated = false;

  if (depth === 2) {
    const candidates: { id: NodeId; strength: number; priority: number }[] = [];
    for (const depth1Id of depth1) {
      const rels = getConceptualRelations(index, depth1Id).filter(relationAllowed);
      for (const relation of rels) {
        const otherId = relation.source === depth1Id ? relation.target : relation.source;
        if (nodeIds.has(otherId)) continue;
        relationsUsed.push(relation);
        const otherNode = getNode(index, otherId);
        const priority = isFieldNode(otherNode) ? otherNode.display.priority : 1;
        candidates.push({ id: otherId, strength: relation.strength, priority });
      }
    }
    candidates.sort((a, b) => b.strength - a.strength || a.priority - b.priority);
    for (const candidate of candidates) {
      if (nodeIds.has(candidate.id)) continue;
      if (nodeIds.size >= MAX_DEPTH_2_NODES) {
        truncated = true;
        continue;
      }
      nodeIds.add(candidate.id);
      depth2.push(candidate.id);
    }
  }

  return { rootId, nodeIds, depth1, depth2, relations: relationsUsed, truncated };
}

export function positionBucketLabel(value: number): string {
  if (value <= 20) return "strongly";
  if (value <= 40) return "moderately";
  if (value <= 60) return "centrally";
  if (value <= 80) return "moderately";
  return "strongly";
}
