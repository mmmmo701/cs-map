import { arc as d3arc } from "d3-shape";

interface BridgeFieldGlyphProps {
  radius: number;
  colors: string[];
}

const MAX_SEGMENTS = 4;
const GAP_RADIANS = (2 * Math.PI) / 180; // ~2px-equivalent angular gap

export function BridgeFieldGlyph({ radius, colors }: BridgeFieldGlyphProps) {
  const strokeWidth = 3;
  const innerRadius = radius - strokeWidth;

  // Risk mitigation (section 27): show primary + up to 3 secondary domains,
  // collapsing the rest into a neutral "additional domains" segment.
  const segmentColors =
    colors.length > MAX_SEGMENTS
      ? [...colors.slice(0, MAX_SEGMENTS - 1), "var(--text-muted)"]
      : colors;

  const arcGenerator = d3arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const segmentAngle = (2 * Math.PI) / segmentColors.length;

  return (
    <g>
      <circle r={innerRadius} fill="var(--background)" />
      {segmentColors.map((color, i) => {
        const startAngle = i * segmentAngle + GAP_RADIANS / 2;
        const endAngle = (i + 1) * segmentAngle - GAP_RADIANS / 2;
        const d = arcGenerator({ startAngle, endAngle }) ?? undefined;
        return <path key={`${color}-${i}`} d={d} fill={color} />;
      })}
    </g>
  );
}
