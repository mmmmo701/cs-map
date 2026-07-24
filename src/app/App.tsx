import { useMemo } from "react";
import type Fuse from "fuse.js";
import type { UniverseIndex } from "../data/buildIndexes";
import type { SearchDocument } from "../data/searchIndex";
import { AppHeader } from "../components/AppHeader/AppHeader";
import { StatusBar } from "../components/StatusBar/StatusBar";
import { FilterPanel } from "../components/FilterPanel/FilterPanel";
import { DetailPanel } from "../components/DetailPanel/DetailPanel";
import { HelpDialog } from "../components/HelpDialog/HelpDialog";
import { EmptyState } from "../components/EmptyState/EmptyState";
import { LandscapeView } from "../views/LandscapeView/LandscapeView";
import { ConnectionsView } from "../views/ConnectionsView/ConnectionsView";
import { TaxonomyView } from "../views/TaxonomyView/TaxonomyView";
import { useUniverseData } from "../hooks/useUniverseData";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useUrlSync } from "../hooks/useUrlSync";
import { useUniverseStore } from "../state/universeStore";
import { getVisibleFields } from "../data/selectors";
import styles from "./App.module.css";

export default function App() {
  const dataState = useUniverseData();

  if (dataState.status === "loading") {
    return (
      <div className={styles.loadingShell} role="status" aria-live="polite">
        <p>Loading the universe of computer science…</p>
      </div>
    );
  }

  if (dataState.status === "error") {
    return (
      <EmptyState
        tone="error"
        title="The map data could not be loaded."
        description={
          <>
            <p>{dataState.error.message}</p>
            {import.meta.env.DEV && dataState.issues && (
              <ul style={{ textAlign: "left", marginTop: 12 }}>
                {dataState.issues.slice(0, 15).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </>
        }
        action={
          <button type="button" onClick={dataState.reload}>
            Retry
          </button>
        }
      />
    );
  }

  return <ReadyApp index={dataState.index} searchEngine={dataState.searchEngine} />;
}

interface ReadyAppProps {
  index: UniverseIndex;
  searchEngine: Fuse<SearchDocument>;
}

function ReadyApp({ index, searchEngine }: ReadyAppProps) {
  const breakpoint = useResponsiveLayout();
  // Mobile visitors land on Taxonomy by default — it's the fully usable,
  // non-SVG browse mode (section 18.4) — unless the URL names a view.
  useUrlSync(index, breakpoint === "mobile" ? "taxonomy" : "landscape");
  const view = useUniverseStore((s) => s.view);
  const filters = useUniverseStore((s) => s.filters);
  const filtersOpen = useUniverseStore((s) => s.filtersOpen);
  const setFiltersOpen = useUniverseStore((s) => s.setFiltersOpen);
  const detailsPanelOpen = useUniverseStore((s) => s.detailsPanelOpen);
  const helpOpen = useUniverseStore((s) => s.helpOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);
  const urlNotice = useUniverseStore((s) => s.urlNotice);
  const setUrlNotice = useUniverseStore((s) => s.setUrlNotice);

  const isDesktop = breakpoint === "desktop";
  const showDetailInGrid = isDesktop && detailsPanelOpen;
  const showFilterInGrid = isDesktop;

  const visibleCount = useMemo(() => getVisibleFields(index, filters).length, [index, filters]);

  const gridColumns = `${showFilterInGrid ? "var(--filter-rail-width)" : "0px"} 1fr ${
    showDetailInGrid ? "var(--panel-width)" : "0px"
  }`;

  return (
    <div className={styles.shell}>
      <AppHeader title={index.data.metadata.title} searchEngine={searchEngine} showFiltersButton={!isDesktop} />

      {urlNotice && (
        <div className={styles.notice} role="status">
          <span>{urlNotice}</span>
          <button type="button" onClick={() => setUrlNotice(null)} aria-label="Dismiss notice">
            ×
          </button>
        </div>
      )}

      <div className={styles.main} style={{ gridTemplateColumns: gridColumns }}>
        {isDesktop && <FilterPanel index={index} collapsed={false} asSheet={false} />}

        <main className={styles.canvas}>
          {view === "landscape" && <LandscapeView index={index} />}
          {view === "connections" && <ConnectionsView index={index} />}
          {view === "taxonomy" && <TaxonomyView index={index} />}
        </main>

        {showDetailInGrid && <DetailPanel index={index} asSheet={false} />}
      </div>

      {!isDesktop && filtersOpen && (
        <>
          <div className={styles.scrim} onClick={() => setFiltersOpen(false)} />
          <FilterPanel index={index} collapsed={false} asSheet onRequestClose={() => setFiltersOpen(false)} />
        </>
      )}

      {!isDesktop && detailsPanelOpen && <DetailPanel index={index} asSheet />}

      <StatusBar index={index} visibleCount={visibleCount} />

      <HelpDialog metadata={index.data.metadata} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
