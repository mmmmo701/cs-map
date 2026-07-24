import { forceCollide, forceSimulation, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import type { UniverseIndex } from "../../data/buildIndexes";
import type { NeighborhoodResult } from "../../data/selectors";
import { isConstellationNode, isFieldNode } from "../../data/selectors";
import type { NodeId } from "../../types/universe";

const DEPTH_1_RADIUS = 190;
const DEPTH_2_RADIUS = 330;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic PRNG seeded from the root id, so revisiting a field opens the same layout. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function domainAngle(index: UniverseIndex, domainId: string): number {
  const order = index.domainsSorted.findIndex((d) => d.id === domainId);
  const total = index.domainsSorted.length || 1;
  return (order >= 0 ? order : 0) * ((2 * Math.PI) / total);
}

/** Circular mean of a node's domain angles, weighted toward its primary domain. */
function nodeAngle(index: UniverseIndex, nodeId: NodeId): number {
  const node = index.nodeById.get(nodeId);
  if (!node) return 0;
  if (!isFieldNode(node) && !isConstellationNode(node)) return 0;

  const domainIds = node.domain_ids;
  const primaryId = isFieldNode(node) ? node.primary_domain_id : domainIds[0];
  let sumX = 0;
  let sumY = 0;
  for (const domainId of domainIds) {
    const angle = domainAngle(index, domainId);
    const weight = domainId === primaryId ? 2 : 1;
    sumX += Math.cos(angle) * weight;
    sumY += Math.sin(angle) * weight;
  }
  return Math.atan2(sumY, sumX);
}

interface SimNode extends SimulationNodeDatum {
  id: NodeId;
  targetX: number;
  targetY: number;
  radius: number;
  fx?: number;
  fy?: number;
}

export interface ConnectionLayoutResult {
  positions: Map<NodeId, { x: number; y: number }>;
  ring: Map<NodeId, 0 | 1 | 2>;
}

export function computeConnectionLayout(
  index: UniverseIndex,
  neighborhood: NeighborhoodResult,
): ConnectionLayoutResult {
  const rng = mulberry32(hashString(neighborhood.rootId));
  const ring = new Map<NodeId, 0 | 1 | 2>();
  ring.set(neighborhood.rootId, 0);
  for (const id of neighborhood.depth1) ring.set(id, 1);
  for (const id of neighborhood.depth2) ring.set(id, 2);

  const simNodes: SimNode[] = [];

  simNodes.push({ id: neighborhood.rootId, targetX: 0, targetY: 0, radius: 26, fx: 0, fy: 0 });

  for (const id of neighborhood.depth1) {
    const angle = nodeAngle(index, id) + (rng() - 0.5) * 0.35;
    simNodes.push({
      id,
      targetX: Math.cos(angle) * DEPTH_1_RADIUS,
      targetY: Math.sin(angle) * DEPTH_1_RADIUS,
      radius: 20,
    });
  }

  for (const id of neighborhood.depth2) {
    const angle = nodeAngle(index, id) + (rng() - 0.5) * 0.35;
    simNodes.push({
      id,
      targetX: Math.cos(angle) * DEPTH_2_RADIUS,
      targetY: Math.sin(angle) * DEPTH_2_RADIUS,
      radius: 16,
    });
  }

  for (const node of simNodes) {
    if (node.fx === undefined) {
      node.x = node.targetX;
      node.y = node.targetY;
    }
  }

  const simulation = forceSimulation(simNodes)
    .force("collide", forceCollide<SimNode>((d) => d.radius + 14).strength(0.9))
    .force("x", forceX<SimNode>((d) => d.targetX).strength(0.25))
    .force("y", forceY<SimNode>((d) => d.targetY).strength(0.25))
    .stop();

  for (let i = 0; i < 160; i++) simulation.tick();

  const positions = new Map<NodeId, { x: number; y: number }>();
  for (const node of simNodes) {
    positions.set(node.id, { x: node.x ?? node.targetX, y: node.y ?? node.targetY });
  }

  return { positions, ring };
}
