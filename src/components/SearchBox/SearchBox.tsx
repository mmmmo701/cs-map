import { useEffect, useId, useMemo, useRef, useState } from "react";
import type Fuse from "fuse.js";
import { search, type SearchDocument, type SearchDocumentKind } from "../../data/searchIndex";
import { useUniverseStore } from "../../state/universeStore";
import styles from "./SearchBox.module.css";

interface SearchBoxProps {
  searchEngine: Fuse<SearchDocument>;
}

const KIND_LABEL: Record<SearchDocumentKind, string> = {
  field: "Fields",
  constellation: "Constellations",
  domain: "Domains",
};

const KIND_ORDER: SearchDocumentKind[] = ["field", "constellation", "domain"];

export function SearchBox({ searchEngine }: SearchBoxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectNode = useUniverseStore((s) => s.selectNode);

  const results = useMemo(() => search(searchEngine, query, 24), [searchEngine, query]);

  const grouped = useMemo(() => {
    const groups = new Map<SearchDocumentKind, typeof results>();
    for (const kind of KIND_ORDER) groups.set(kind, []);
    for (const result of results) {
      groups.get(result.document.kind)?.push(result);
    }
    return KIND_ORDER.map((kind) => ({ kind, items: groups.get(kind) ?? [] })).filter(
      (group) => group.items.length > 0,
    );
  }, [results]);

  const flatResults = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  function handleSelect(nodeId: string) {
    selectNode(nodeId, { openPanel: true });
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      setIsOpen(false);
      return;
    }
    if (!isOpen || flatResults.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = activeIndex >= 0 ? flatResults[activeIndex] : flatResults[0];
      if (target) handleSelect(target.document.id);
    }
  }

  const activeId =
    activeIndex >= 0 && flatResults[activeIndex] ? `${listboxId}-${flatResults[activeIndex].document.id}` : undefined;

  return (
    <div className={styles.searchBox}>
      <label htmlFor={`${listboxId}-input`} className="visually-hidden">
        Search fields, aliases, topics, books, and venues
      </label>
      <input
        id={`${listboxId}-input`}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen && flatResults.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeId}
        autoComplete="off"
        placeholder="Search fields, topics, books, venues…"
        className={styles.input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && query.trim() && (
        <div className={styles.popover} id={listboxId} role="listbox">
          {flatResults.length === 0 ? (
            <p className={styles.noResults}>No matches for “{query}”.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.kind} className={styles.group}>
                <p className={styles.groupLabel}>{KIND_LABEL[group.kind]}</p>
                {group.items.map((result) => {
                  const flatIndex = flatResults.indexOf(result);
                  return (
                    <button
                      type="button"
                      key={result.document.id}
                      id={`${listboxId}-${result.document.id}`}
                      role="option"
                      aria-selected={flatIndex === activeIndex}
                      className={styles.result}
                      data-active={flatIndex === activeIndex || undefined}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(result.document.id)}
                    >
                      <span className={styles.resultName}>{result.document.name}</span>
                      {result.matchContext && (
                        <span className={styles.resultContext}>{result.matchContext}</span>
                      )}
                      {result.document.domains.length > 0 && (
                        <span className={styles.resultDomains}>{result.document.domains.join(", ")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
