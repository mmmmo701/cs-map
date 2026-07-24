import { useMemo } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { useUniverseStore } from "../../state/universeStore";
import { getVisibleFields, isConstellationRevealed } from "../../data/selectors";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { LandscapeCanvas } from "./LandscapeCanvas";

interface LandscapeViewProps {
  index: UniverseIndex;
}

export function LandscapeView({ index }: LandscapeViewProps) {
  const filters = useUniverseStore((s) => s.filters);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const resetFilters = useUniverseStore((s) => s.resetFilters);

  const fields = useMemo(() => getVisibleFields(index, filters), [index, filters]);

  const constellations = useMemo(
    () =>
      index.data.constellations.filter((c) =>
        isConstellationRevealed(c, filters, { selectedNodeId }),
      ),
    [index, filters, selectedNodeId],
  );

  if (fields.length === 0) {
    return (
      <EmptyState
        title="No fields match the current filters."
        description="Try widening the domain, node-type, or coordinate filters."
        action={
          <button type="button" onClick={() => resetFilters()}>
            Reset filters
          </button>
        }
      />
    );
  }

  return <LandscapeCanvas index={index} fields={fields} constellations={constellations} />;
}
