const HEADERS: Record<string, string> = {
  "uses_methods_from|outgoing": "Uses methods from",
  "uses_methods_from|incoming": "Fields that use methods from this one",
  "theoretical_foundation_for|outgoing": "Theoretical foundation for",
  "theoretical_foundation_for|incoming": "Theoretical foundations for this field",
  "systems_foundation_for|outgoing": "Systems foundation for",
  "systems_foundation_for|incoming": "Systems foundations for this field",
  "applied_to|outgoing": "Applied to",
  "applied_to|incoming": "Has methods applied from",
  "overlaps_with|undirected": "Overlaps with",
  "synthesizes|undirected": "Synthesizes with",
};

export function getRelationGroupHeader(
  relationTypeId: string,
  relationTypeLabel: string,
  direction: "outgoing" | "incoming" | "undirected",
): string {
  return HEADERS[`${relationTypeId}|${direction}`] ?? relationTypeLabel;
}
