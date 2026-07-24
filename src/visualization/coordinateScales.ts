import { scaleLinear, type ScaleLinear } from "d3-scale";

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const BASE_PADDING: Padding = { top: 72, right: 72, bottom: 64, left: 72 };

export interface Scales {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
}

export function createScales(width: number, height: number, padding: Padding = BASE_PADDING): Scales {
  const x = scaleLinear()
    .domain([0, 100])
    .range([padding.left, Math.max(padding.left + 1, width - padding.right)]);
  const y = scaleLinear()
    .domain([0, 100])
    .range([Math.max(padding.top + 1, height - padding.bottom), padding.top]);
  return { x, y };
}
