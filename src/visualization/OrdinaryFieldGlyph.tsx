interface OrdinaryFieldGlyphProps {
  radius: number;
  color: string;
}

export function OrdinaryFieldGlyph({ radius, color }: OrdinaryFieldGlyphProps) {
  return <circle r={radius} fill="var(--background)" stroke={color} strokeWidth={2} />;
}
