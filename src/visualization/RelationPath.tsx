import { ARROW_MARKER_ACTIVE_ID, ARROW_MARKER_ID } from "./markers";

export interface RelationPathProps {
  id: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  line: string;
  hasArrow: boolean;
  active: boolean;
  bendOffset?: number;
  onSelect?: () => void;
  ariaLabel?: string;
}

function quadraticPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  bend: number,
): { d: string; midpoint: { x: number; y: number } } {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const controlX = midX + nx * bend;
  const controlY = midY + ny * bend;
  return {
    d: `M ${source.x},${source.y} Q ${controlX},${controlY} ${target.x},${target.y}`,
    midpoint: { x: controlX, y: controlY },
  };
}

const DASH_ARRAY: Record<string, string | undefined> = {
  solid: undefined,
  dashed: "6 4",
  dotted: "1.5 4",
  double: undefined,
};

export function RelationPath({
  id,
  source,
  target,
  line,
  hasArrow,
  active,
  bendOffset = 18,
  onSelect,
  ariaLabel,
}: RelationPathProps) {
  const { d } = quadraticPath(source, target, bendOffset);
  const color = active ? "var(--edge-active)" : "var(--edge-muted)";
  const markerId = active ? ARROW_MARKER_ACTIVE_ID : ARROW_MARKER_ID;
  const strokeWidth = active ? 1.6 : 1.1;

  if (line === "double") {
    const a = quadraticPath(source, target, bendOffset - 3);
    const b = quadraticPath(source, target, bendOffset + 3);
    return (
      <g
        data-no-pan
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        aria-label={ariaLabel}
        onClick={onSelect}
        style={{ cursor: onSelect ? "pointer" : undefined }}
      >
        <path d={a.d} fill="none" stroke={color} strokeWidth={strokeWidth} />
        <path d={b.d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      </g>
    );
  }

  return (
    <path
      id={id}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={DASH_ARRAY[line]}
      markerEnd={hasArrow ? `url(#${markerId})` : undefined}
      data-no-pan
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onSelect}
      style={{ cursor: onSelect ? "pointer" : undefined }}
    />
  );
}
