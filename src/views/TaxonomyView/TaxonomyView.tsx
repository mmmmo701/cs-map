import { useMemo } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { useUniverseStore } from "../../state/universeStore";
import {
  constellationMatchesDomainFilter,
  fieldMatchesFilters,
  isConstellationRevealed,
} from "../../data/selectors";
import { DomainSection } from "./DomainSection";
import { ConstellationSection } from "./ConstellationSection";
import styles from "./TaxonomyView.module.css";

interface TaxonomyViewProps {
  index: UniverseIndex;
}

export function TaxonomyView({ index }: TaxonomyViewProps) {
  const filters = useUniverseStore((s) => s.filters);
  const searchQuery = useUniverseStore((s) => s.searchQuery);

  // Taxonomy uses the shared filter state, but does its own lightweight text
  // matching over name/topics so the view keeps working without the SVG map.
  const matchedIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.trim().toLowerCase();
    const ids = new Set<string>();
    for (const field of index.data.fields) {
      if (
        field.name.toLowerCase().includes(query) ||
        field.representative_topics.some((t) => t.toLowerCase().includes(query))
      ) {
        ids.add(field.id);
      }
    }
    for (const constellation of index.data.constellations) {
      if (
        constellation.name.toLowerCase().includes(query) ||
        constellation.component_field_ids.some((id) => ids.has(id))
      ) {
        ids.add(constellation.id);
      }
    }
    return ids;
  }, [index, searchQuery]);

  const visibleFieldIds = useMemo(() => {
    const ids = new Set<string>();
    for (const field of index.data.fields) {
      if (!fieldMatchesFilters(field, filters)) continue;
      if (matchedIds && !matchedIds.has(field.id)) continue;
      ids.add(field.id);
    }
    return ids;
  }, [index, filters, matchedIds]);

  const searchResultIds = useMemo(() => {
    if (!searchQuery.trim()) return undefined;
    // Reuses the same fuzzy engine query shape only for reveal-rule purposes;
    // matchedIds above already covers Taxonomy's own text filter.
    return matchedIds ?? undefined;
  }, [matchedIds, searchQuery]);

  const visibleConstellations = useMemo(
    () =>
      index.data.constellations.filter((constellation) => {
        if (!constellationMatchesDomainFilter(constellation, filters)) return false;
        if (matchedIds && !matchedIds.has(constellation.id)) return false;
        return isConstellationRevealed(constellation, filters, { searchResultIds });
      }),
    [index, filters, matchedIds, searchResultIds],
  );

  const totalFieldMatches = visibleFieldIds.size;

  return (
    <div className={styles.taxonomy}>
      <div className={styles.intro}>
        <p>{index.data.metadata.subtitle}</p>
        {searchQuery.trim() && (
          <p className={styles.matchSummary}>
            {totalFieldMatches} field{totalFieldMatches === 1 ? "" : "s"} match “{searchQuery}”
          </p>
        )}
      </div>

      {index.domainsSorted.map((domain) => (
        <DomainSection
          key={domain.id}
          index={index}
          domain={domain}
          visibleFieldIds={visibleFieldIds}
        />
      ))}

      <ConstellationSection index={index} constellations={visibleConstellations} />
    </div>
  );
}
