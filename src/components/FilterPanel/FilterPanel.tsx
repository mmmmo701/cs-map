import { useEffect, useMemo, useRef } from "react";
import type { UniverseIndex } from "../../data/buildIndexes";
import { useUniverseStore } from "../../state/universeStore";
import { getVisibleFields } from "../../data/selectors";
import { domainColorVar } from "../../styles/applyDomainTheme";
import { RangeFilter } from "./RangeFilter";
import type { NodeClassFilter } from "../../types/universe";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  index: UniverseIndex;
  collapsed: boolean;
  asSheet: boolean;
  onRequestClose?: () => void;
}

const NODE_CLASS_OPTIONS: { id: NodeClassFilter; label: string }[] = [
  { id: "ordinary_field", label: "Ordinary fields" },
  { id: "bridge_field", label: "Bridge fields" },
  { id: "constellation", label: "Constellations" },
];

export function FilterPanel({ index, collapsed, asSheet, onRequestClose }: FilterPanelProps) {
  const filters = useUniverseStore((s) => s.filters);
  const toggleDomainFilter = useUniverseStore((s) => s.toggleDomainFilter);
  const toggleNodeClassFilter = useUniverseStore((s) => s.toggleNodeClassFilter);
  const toggleShowConstellations = useUniverseStore((s) => s.toggleShowConstellations);
  const toggleRelationshipType = useUniverseStore((s) => s.toggleRelationshipType);
  const setCoordinateRange = useUniverseStore((s) => s.setCoordinateRange);
  const resetFilters = useUniverseStore((s) => s.resetFilters);
  const resetView = useUniverseStore((s) => s.resetView);

  const allDomainIds = useMemo(() => index.domainsSorted.map((d) => d.id), [index]);
  const visibleFields = useMemo(() => getVisibleFields(index, filters), [index, filters]);

  const domainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const field of visibleFields) {
      for (const domainId of field.domain_ids) {
        counts.set(domainId, (counts.get(domainId) ?? 0) + 1);
      }
    }
    return counts;
  }, [visibleFields]);

  const { x: xAxis, y: yAxis } = index.data.metadata.coordinate_system;
  const conceptualRelationTypes = index.data.relation_types.filter((rt) => rt.id !== "part_of");
  const allRelationTypeIds = conceptualRelationTypes.map((rt) => rt.id);

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (asSheet) headingRef.current?.focus();
  }, [asSheet]);

  useEffect(() => {
    if (!asSheet) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onRequestClose?.();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [asSheet, onRequestClose]);

  if (collapsed) {
    return <div className={styles.railCollapsed} aria-hidden="true" />;
  }

  return (
    <div
      className={styles.panel}
      data-sheet={asSheet || undefined}
      role={asSheet ? "dialog" : undefined}
      aria-modal={asSheet || undefined}
      aria-label={asSheet ? "Filters" : undefined}
    >
      {asSheet && (
        <div className={styles.sheetHeader}>
          <h2 ref={headingRef} tabIndex={-1}>
            Filters
          </h2>
          <button type="button" onClick={onRequestClose} aria-label="Close filters">
            ×
          </button>
        </div>
      )}

      <section>
        <h3 className={styles.sectionHeading}>Domains</h3>
        <ul className={styles.domainList}>
          {index.domainsSorted.map((domain) => {
            const checked = filters.domainIds.size === 0 || filters.domainIds.has(domain.id);
            return (
              <li key={domain.id}>
                <label className={styles.domainRow}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDomainFilter(domain.id, allDomainIds)}
                  />
                  <span
                    className={styles.domainDot}
                    style={{ background: `var(${domainColorVar(domain.id)})` }}
                    aria-hidden="true"
                  />
                  <span className={styles.domainName}>{domain.name}</span>
                  <span className={styles.domainCount}>{domainCounts.get(domain.id) ?? 0}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Node type</h3>
        <ul className={styles.checkboxList}>
          {NODE_CLASS_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={filters.nodeClasses.has(option.id)}
                  onChange={() => toggleNodeClassFilter(option.id)}
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={filters.showConstellations} onChange={() => toggleShowConstellations()} />
          Show constellations by default
        </label>
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Conceptual position</h3>
        <RangeFilter
          label={xAxis.name.replace(/_/g, " ")}
          lowLabel={xAxis.left_label ?? "Low"}
          highLabel={xAxis.right_label ?? "High"}
          value={filters.xRange}
          onChange={(range) => setCoordinateRange("x", range)}
        />
        <RangeFilter
          label={yAxis.name.replace(/_/g, " ")}
          lowLabel={yAxis.bottom_label ?? "Low"}
          highLabel={yAxis.top_label ?? "High"}
          value={filters.yRange}
          onChange={(range) => setCoordinateRange("y", range)}
        />
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Relationship types</h3>
        <ul className={styles.checkboxList}>
          {conceptualRelationTypes.map((rt) => (
            <li key={rt.id}>
              <label className={styles.checkboxRow} title={rt.description}>
                <input
                  type="checkbox"
                  checked={filters.relationshipTypes.size === 0 || filters.relationshipTypes.has(rt.id)}
                  onChange={() => toggleRelationshipType(rt.id, allRelationTypeIds)}
                />
                {rt.label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.resetRow}>
        <button type="button" className={styles.reset} onClick={() => resetFilters()}>
          Reset filters
        </button>
        <button type="button" className={styles.reset} onClick={() => resetView()}>
          Reset entire view
        </button>
      </div>
    </div>
  );
}
