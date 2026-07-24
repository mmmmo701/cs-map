import { blendHexColors } from "./colorUtils";

interface ConstellationGlyphProps {
  radius: number;
  colors: string[];
}

function starPoints(radius: number): string {
  const points: string[] = [];
  const outer = radius;
  const inner = radius * 0.42;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

export function ConstellationGlyph({ radius, colors }: ConstellationGlyphProps) {
  const color = blendHexColors(colors);
  return (
    <polygon
      points={starPoints(radius)}
      fill="transparent"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}
