import type { ConceptualPosition, CoordinateAxis } from "../types/universe";

function describeAxis(value: number, lowLabel: string, highLabel: string): string {
  const low = lowLabel.toLowerCase();
  const high = highLabel.toLowerCase();
  if (value <= 20) return `strongly ${low}`;
  if (value <= 40) return low;
  if (value <= 60) return "central";
  if (value <= 80) return high;
  return `strongly ${high}`;
}

export function describePosition(
  position: ConceptualPosition,
  xAxis: CoordinateAxis,
  yAxis: CoordinateAxis,
): string {
  const xDescriptor = describeAxis(
    position.abstract_to_concrete,
    xAxis.left_label ?? "abstract",
    xAxis.right_label ?? "concrete",
  );
  const yDescriptor = describeAxis(
    position.machine_to_human,
    yAxis.bottom_label ?? "machine-centered",
    yAxis.top_label ?? "human-centered",
  );

  if (xDescriptor === "central" && yDescriptor === "central") {
    return "Positioned centrally on both axes — a mixed, cross-cutting position.";
  }
  if (xDescriptor === "central") {
    return `Positioned centrally on the abstract–concrete axis, and toward the ${yDescriptor} side vertically.`;
  }
  if (yDescriptor === "central") {
    return `Positioned toward the ${xDescriptor} side, and centrally on the machine–human axis.`;
  }
  return `Positioned toward the ${xDescriptor} and ${yDescriptor} side of the map.`;
}
