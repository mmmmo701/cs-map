import clsx from "clsx";
import type Fuse from "fuse.js";
import { SearchBox } from "../SearchBox/SearchBox";
import { useUniverseStore } from "../../state/universeStore";
import type { ViewId } from "../../state/types";
import type { SearchDocument } from "../../data/searchIndex";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  title: string;
  searchEngine: Fuse<SearchDocument>;
  showFiltersButton: boolean;
}

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "landscape", label: "Landscape" },
  { id: "connections", label: "Connections" },
  { id: "taxonomy", label: "Taxonomy" },
];

export function AppHeader({ title, searchEngine, showFiltersButton }: AppHeaderProps) {
  const view = useUniverseStore((s) => s.view);
  const setView = useUniverseStore((s) => s.setView);
  const filtersOpen = useUniverseStore((s) => s.filtersOpen);
  const setFiltersOpen = useUniverseStore((s) => s.setFiltersOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <SearchBox searchEngine={searchEngine} />

      <nav className={styles.tabs} aria-label="View">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={clsx(styles.tab, view === v.id && styles.tabActive)}
            aria-current={view === v.id ? "page" : undefined}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className={styles.actions}>
        {showFiltersButton && (
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={filtersOpen}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </button>
        )}
        <button type="button" className={styles.iconButton} onClick={() => setHelpOpen(true)}>
          How to read this map
        </button>
      </div>
    </header>
  );
}
