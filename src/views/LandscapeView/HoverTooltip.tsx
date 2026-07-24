import type { UniverseIndex } from "../../data/buildIndexes";
import { isConstellationNode, isFieldNode } from "../../data/selectors";
import type { ScreenPoint } from "./landscapeLayout";
import styles from "./LandscapeView.module.css";

interface HoverTooltipProps {
  index: UniverseIndex;
  nodeId: string;
  anchor: ScreenPoint | null;
}

function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return match ? match[0].trim() : text;
}

export function HoverTooltip({ index, nodeId, anchor }: HoverTooltipProps) {
  const node = index.nodeById.get(nodeId);
  if (!node || !anchor) return null;

  const domains = isFieldNode(node)
    ? node.domain_ids.map((id) => index.domainById.get(id)?.short_name).filter(Boolean)
    : isConstellationNode(node)
      ? node.domain_ids.map((id) => index.domainById.get(id)?.short_name).filter(Boolean)
      : [];

  const typeLabel = isFieldNode(node)
    ? node.node_class === "bridge_field"
      ? "Bridge field"
      : "Ordinary field"
    : isConstellationNode(node)
      ? "Constellation"
      : "Domain";

  const summary = isFieldNode(node) || isConstellationNode(node) ? node.summary : "";

  return (
    <div
      className={styles.tooltip}
      style={{ left: anchor.x, top: anchor.y }}
      role="tooltip"
      aria-hidden="true"
    >
      <p className={styles.tooltipName}>{node.name}</p>
      <p className={styles.tooltipMeta}>
        {typeLabel}
        {domains.length > 0 ? ` · ${domains.join(", ")}` : ""}
      </p>
      {summary && <p className={styles.tooltipSummary}>{firstSentence(summary)}</p>}
    </div>
  );
}
