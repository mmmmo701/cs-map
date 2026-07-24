import type { ZoomTransform } from "d3-zoom";
import type { Scales } from "../../visualization/coordinateScales";
import type { Domain, VisualDesign } from "../../types/universe";
import { domainColorVar } from "../../styles/applyDomainTheme";
import { domainRegionScreen } from "./landscapeLayout";
import { useUniverseStore } from "../../state/universeStore";

interface DomainRegionLayerProps {
  domains: Domain[];
  scales: Scales;
  transform: ZoomTransform;
  domainRendering: VisualDesign["domain_rendering"];
}

export function DomainRegionLayer({ domains, scales, transform, domainRendering }: DomainRegionLayerProps) {
  const selectNode = useUniverseStore((s) => s.selectNode);

  return (
    <g>
      {domains.map((domain) => {
        const region = domainRegionScreen(scales, transform, domain);
        const colorVar = `var(${domainColorVar(domain.id)})`;
        return (
          <g key={domain.id}>
            <ellipse
              cx={region.cx}
              cy={region.cy}
              rx={region.rx}
              ry={region.ry}
              fill={colorVar}
              fillOpacity={domainRendering.region_fill_opacity}
              stroke={colorVar}
              strokeOpacity={domainRendering.region_border_opacity}
              strokeWidth={1}
            />
            <text
              x={region.cx}
              y={region.cy - region.ry + 18}
              textAnchor="middle"
              fontSize={15}
              fontWeight={600}
              fill={colorVar}
              opacity={0.85}
              data-no-pan="true"
              style={{ cursor: "pointer" }}
              onClick={() => selectNode(domain.id, { openPanel: true })}
            >
              {domain.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
