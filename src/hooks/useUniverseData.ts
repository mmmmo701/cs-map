import { useEffect, useState } from "react";
import { loadUniverseData } from "../data/loadUniverseData";
import { buildUniverseIndex, type UniverseIndex } from "../data/buildIndexes";
import { buildSearchDocuments, createSearchEngine } from "../data/searchIndex";
import { applyDomainTheme } from "../styles/applyDomainTheme";
import { DataValidationError } from "../data/validateReferences";
import Fuse from "fuse.js";
import type { SearchDocument } from "../data/searchIndex";

export type UniverseDataState =
  | { status: "loading" }
  | { status: "error"; error: Error; issues?: string[] }
  | { status: "ready"; index: UniverseIndex; searchEngine: Fuse<SearchDocument> };

export function useUniverseData(): UniverseDataState & { reload: () => void } {
  const [state, setState] = useState<UniverseDataState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    loadUniverseData()
      .then((data) => {
        if (cancelled) return;
        const index = buildUniverseIndex(data);
        const documents = buildSearchDocuments(index);
        const searchEngine = createSearchEngine(documents);
        applyDomainTheme(data.domains);
        setState({ status: "ready", index, searchEngine });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof DataValidationError) {
          setState({ status: "error", error, issues: error.issues });
        } else {
          setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { ...state, reload: () => setAttempt((a) => a + 1) };
}
