import type { KeyboardEvent, MouseEvent } from "react";
import { OrdinaryFieldGlyph } from "./OrdinaryFieldGlyph";
import { BridgeFieldGlyph } from "./BridgeFieldGlyph";
import { ConstellationGlyph } from "./ConstellationGlyph";

export type GlyphKind = "ordinary_field" | "bridge_field" | "constellation";

interface NodeGlyphProps {
  id: string;
  kind: GlyphKind;
  x: number;
  y: number;
  radius: number;
  colors: string[];
  ariaLabel: string;
  selected: boolean;
  hovered: boolean;
  focused: boolean;
  dimmed: boolean;
  haloRadius: number;
  haloOpacity: number;
  pulseKey?: number;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onFocusNode: () => void;
  onDoubleClick: () => void;
}

export function NodeGlyph({
  id,
  kind,
  x,
  y,
  radius,
  colors,
  ariaLabel,
  selected,
  hovered,
  focused,
  dimmed,
  haloRadius,
  haloOpacity,
  pulseKey,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onFocusNode,
  onDoubleClick,
}: NodeGlyphProps) {
  const raised = hovered || selected || focused;
  const displayRadius = raised ? radius * 1.12 : radius;
  const hitRadius = Math.max(12, radius);

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  function handleClick(event: MouseEvent<SVGGElement>) {
    event.stopPropagation();
    onSelect();
  }

  function handleDoubleClick(event: MouseEvent<SVGGElement>) {
    event.stopPropagation();
    onDoubleClick();
  }

  return (
    <g
      transform={`translate(${x},${y})`}
      opacity={dimmed ? 0.32 : 1}
      style={{ transition: "opacity var(--motion-base) var(--motion-easing)" }}
      data-no-pan
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onFocusNode}
    >
      {selected && <circle r={haloRadius} fill="var(--focus-ring)" opacity={haloOpacity} />}
      {selected && pulseKey !== undefined && (
        <circle key={pulseKey} r={haloRadius} fill="var(--focus-ring)" className="node-halo-pulse-once" />
      )}
      <g
        style={{
          transform: `scale(${displayRadius / Math.max(radius, 0.001)})`,
          transition: "transform var(--motion-fast) var(--motion-easing)",
        }}
      >
        {kind === "ordinary_field" && <OrdinaryFieldGlyph radius={radius} color={colors[0] ?? "#888"} />}
        {kind === "bridge_field" && <BridgeFieldGlyph radius={radius} colors={colors} />}
        {kind === "constellation" && <ConstellationGlyph radius={radius} colors={colors} />}
      </g>
      {focused && !selected && (
        <circle r={radius + 5} fill="none" stroke="var(--focus-ring)" strokeWidth={2} />
      )}
      <circle r={hitRadius} fill="transparent" style={{ pointerEvents: "all" }} data-node-id={id} />
    </g>
  );
}
