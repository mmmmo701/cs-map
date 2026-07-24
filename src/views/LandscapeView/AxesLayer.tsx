import type { ZoomTransform } from "d3-zoom";
import type { Scales } from "../../visualization/coordinateScales";
import type { CoordinateAxis } from "../../types/universe";
import { toScreen } from "./landscapeLayout";

interface AxesLayerProps {
  scales: Scales;
  transform: ZoomTransform;
  xAxis: CoordinateAxis;
  yAxis: CoordinateAxis;
  dimmed: boolean;
}

const TICKS = [0, 25, 50, 75, 100];

export function AxesLayer({ scales, transform, xAxis, yAxis, dimmed }: AxesLayerProps) {
  const start = toScreen(transform, { x: scales.x(0), y: scales.y(50) });
  const end = toScreen(transform, { x: scales.x(100), y: scales.y(50) });
  const top = toScreen(transform, { x: scales.x(50), y: scales.y(100) });
  const bottom = toScreen(transform, { x: scales.x(50), y: scales.y(0) });

  const opacity = dimmed ? 0.35 : 0.7;

  return (
    <g opacity={opacity} style={{ transition: "opacity var(--motion-base) var(--motion-easing)" }}>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--grid-line)" strokeWidth={1} />
      <line x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke="var(--grid-line)" strokeWidth={1} />

      {TICKS.map((tick) => {
        const px = toScreen(transform, { x: scales.x(tick), y: scales.y(50) });
        return (
          <line
            key={`x-tick-${tick}`}
            x1={px.x}
            y1={px.y - 4}
            x2={px.x}
            y2={px.y + 4}
            stroke="var(--grid-line)"
            strokeWidth={1}
          />
        );
      })}
      {TICKS.map((tick) => {
        const py = toScreen(transform, { x: scales.x(50), y: scales.y(tick) });
        return (
          <line
            key={`y-tick-${tick}`}
            x1={py.x - 4}
            y1={py.y}
            x2={py.x + 4}
            y2={py.y}
            stroke="var(--grid-line)"
            strokeWidth={1}
          />
        );
      })}

      <text x={start.x + 6} y={start.y - 8} fontSize={11} fill="var(--text-muted)" letterSpacing={0.4}>
        {xAxis.left_label?.toUpperCase()}
      </text>
      <text x={end.x - 6} y={end.y - 8} fontSize={11} fill="var(--text-muted)" textAnchor="end" letterSpacing={0.4}>
        {xAxis.right_label?.toUpperCase()}
      </text>
      <text x={top.x + 8} y={top.y + 12} fontSize={11} fill="var(--text-muted)" letterSpacing={0.4}>
        {yAxis.top_label?.toUpperCase()}
      </text>
      <text x={bottom.x + 8} y={bottom.y - 6} fontSize={11} fill="var(--text-muted)" letterSpacing={0.4}>
        {yAxis.bottom_label?.toUpperCase()}
      </text>
    </g>
  );
}
