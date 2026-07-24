import type {
  ConstellationId,
  ConstellationNode,
  Domain,
  DomainId,
  FieldId,
  FieldNode,
  NodeId,
  Relation,
  RelationType,
  UniverseData,
  UniverseNode,
} from "../types/universe";

export interface UniverseIndex {
  data: UniverseData;
  domainById: Map<DomainId, Domain>;
  fieldById: Map<FieldId, FieldNode>;
  constellationById: Map<ConstellationId, ConstellationNode>;
  nodeById: Map<NodeId, UniverseNode | Domain>;
  fieldsByDomain: Map<DomainId, FieldNode[]>;
  constellationsByDomain: Map<DomainId, ConstellationNode[]>;
  constellationsByComponent: Map<FieldId, ConstellationNode[]>;
  incomingRelations: Map<NodeId, Relation[]>;
  outgoingRelations: Map<NodeId, Relation[]>;
  undirectedAdjacency: Map<NodeId, Relation[]>;
  relationTypeById: Map<string, RelationType>;
  domainsSorted: Domain[];
}

function fieldSortKey(field: FieldNode): [number, string] {
  return [field.display.priority, field.name];
}

export function buildUniverseIndex(data: UniverseData): UniverseIndex {
  const domainById = new Map<DomainId, Domain>();
  const fieldById = new Map<FieldId, FieldNode>();
  const constellationById = new Map<ConstellationId, ConstellationNode>();
  const nodeById = new Map<NodeId, UniverseNode | Domain>();

  const domainsSorted = [...data.domains].sort((a, b) => a.display_order - b.display_order);

  for (const domain of data.domains) {
    domainById.set(domain.id, domain);
    nodeById.set(domain.id, domain);
  }
  for (const field of data.fields) {
    fieldById.set(field.id, field);
    nodeById.set(field.id, field);
  }
  for (const constellation of data.constellations) {
    constellationById.set(constellation.id, constellation);
    nodeById.set(constellation.id, constellation);
  }

  const fieldsByDomain = new Map<DomainId, FieldNode[]>();
  for (const domain of data.domains) {
    fieldsByDomain.set(domain.id, []);
  }
  for (const field of data.fields) {
    for (const domainId of field.domain_ids) {
      fieldsByDomain.get(domainId)?.push(field);
    }
  }
  for (const list of fieldsByDomain.values()) {
    list.sort((a, b) => {
      const [pa, na] = fieldSortKey(a);
      const [pb, nb] = fieldSortKey(b);
      return pa !== pb ? pa - pb : na.localeCompare(nb);
    });
  }

  const constellationsByDomain = new Map<DomainId, ConstellationNode[]>();
  for (const domain of data.domains) {
    constellationsByDomain.set(domain.id, []);
  }
  const constellationsByComponent = new Map<FieldId, ConstellationNode[]>();
  for (const field of data.fields) {
    constellationsByComponent.set(field.id, []);
  }
  for (const constellation of data.constellations) {
    for (const domainId of constellation.domain_ids) {
      constellationsByDomain.get(domainId)?.push(constellation);
    }
    for (const componentId of constellation.component_field_ids) {
      constellationsByComponent.get(componentId)?.push(constellation);
    }
  }

  const incomingRelations = new Map<NodeId, Relation[]>();
  const outgoingRelations = new Map<NodeId, Relation[]>();
  const undirectedAdjacency = new Map<NodeId, Relation[]>();

  const pushTo = (map: Map<NodeId, Relation[]>, key: NodeId, relation: Relation) => {
    const list = map.get(key);
    if (list) list.push(relation);
    else map.set(key, [relation]);
  };

  for (const relation of data.relations) {
    pushTo(outgoingRelations, relation.source, relation);
    pushTo(incomingRelations, relation.target, relation);
    pushTo(undirectedAdjacency, relation.source, relation);
    pushTo(undirectedAdjacency, relation.target, relation);
  }

  const relationTypeById = new Map<string, RelationType>();
  for (const relationType of data.relation_types) {
    relationTypeById.set(relationType.id, relationType);
  }

  return {
    data,
    domainById,
    fieldById,
    constellationById,
    nodeById,
    fieldsByDomain,
    constellationsByDomain,
    constellationsByComponent,
    incomingRelations,
    outgoingRelations,
    undirectedAdjacency,
    relationTypeById,
    domainsSorted,
  };
}
