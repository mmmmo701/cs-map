export function blendHexColors(colors: string[]): string {
  if (colors.length === 0) return "#888888";
  if (colors.length === 1) return colors[0];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const color of colors) {
    const value = parseInt(color.replace("#", ""), 16);
    r += (value >> 16) & 0xff;
    g += (value >> 8) & 0xff;
    b += value & 0xff;
  }
  const n = colors.length;
  const toHex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
