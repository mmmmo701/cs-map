import type { ZoomTransform } from "d3-zoom";
import type { Scales } from "../../visualization/coordinateScales";
import type { Domain, VisualDesign } from "../../types/universe";
import { domainColorVar } from "../../styles/applyDomainTheme";
import { domainRegionScreen } from "./landscapeLayout";

interface DomainRegionLayerProps {
  domains: Domain[];
  scales: Scales;
  transform: ZoomTransform;
  domainRendering: VisualDesign["domain_rendering"];
}

// Domain name labels are rendered by LabelLayer, which runs the shared
// collision-avoidance pass — see landscapeLayout.domainRegionScreen for the
// geometry both layers share.
export function DomainRegionLayer({ domains, scales, transform, domainRendering }: DomainRegionLayerProps) {
  return (
    <g>
      {domains.map((domain) => {
        const region = domainRegionScreen(scales, transform, domain);
        const colorVar = `var(${domainColorVar(domain.id)})`;
        return (
          <ellipse
            key={domain.id}
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
        );
      })}
    </g>
  );
}
