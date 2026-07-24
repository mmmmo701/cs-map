import Fuse, { type IFuseOptions } from "fuse.js";
import type { UniverseIndex } from "./buildIndexes";
import type { NodeId } from "../types/universe";

export type SearchDocumentKind = "domain" | "field" | "constellation";

export interface SearchDocument {
  id: NodeId;
  kind: SearchDocumentKind;
  name: string;
  aliases: string[];
  summary: string;
  topics: string[];
  books: string[];
  venues: string[];
  domains: string[];
  components: string[];
}

export function buildSearchDocuments(index: UniverseIndex): SearchDocument[] {
  const docs: SearchDocument[] = [];

  for (const domain of index.data.domains) {
    docs.push({
      id: domain.id,
      kind: "domain",
      name: domain.name,
      aliases: [domain.short_name],
      summary: domain.summary,
      topics: [],
      books: [],
      venues: [],
      domains: [domain.name],
      components: [],
    });
  }

  for (const field of index.data.fields) {
    docs.push({
      id: field.id,
      kind: "field",
      name: field.name,
      aliases: field.aliases,
      summary: field.summary,
      topics: field.representative_topics,
      books: field.books.map((b) => b.title),
      venues: [...field.representative_venues.journals, ...field.representative_venues.conferences],
      domains: field.domain_ids.map((id) => index.domainById.get(id)?.name ?? id),
      components: [],
    });
  }

  for (const constellation of index.data.constellations) {
    docs.push({
      id: constellation.id,
      kind: "constellation",
      name: constellation.name,
      aliases: [],
      summary: `${constellation.summary} ${constellation.why_not_ordinary_child}`,
      topics: constellation.representative_topics,
      books: constellation.books.map((b) => b.title),
      venues: [
        ...constellation.representative_venues.journals,
        ...constellation.representative_venues.conferences,
      ],
      domains: constellation.domain_ids.map((id) => index.domainById.get(id)?.name ?? id),
      components: constellation.component_field_ids.map(
        (id) => index.fieldById.get(id)?.name ?? id,
      ),
    });
  }

  return docs;
}

const FUSE_OPTIONS: IFuseOptions<SearchDocument> = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.32,
  ignoreLocation: true,
  keys: [
    { name: "name", weight: 0.35 },
    { name: "aliases", weight: 0.2 },
    { name: "topics", weight: 0.15 },
    { name: "domains", weight: 0.1 },
    { name: "summary", weight: 0.08 },
    { name: "books", weight: 0.06 },
    { name: "venues", weight: 0.04 },
    { name: "components", weight: 0.02 },
  ],
};

export function createSearchEngine(documents: SearchDocument[]): Fuse<SearchDocument> {
  return new Fuse(documents, FUSE_OPTIONS);
}

export interface SearchResult {
  document: SearchDocument;
  matchContext?: string;
}

export function search(engine: Fuse<SearchDocument>, query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];
  const results = engine.search(query, { limit });
  return results.map((result) => {
    const bestMatch = result.matches?.find((m) => m.key !== "name");
    const matchContext = bestMatch?.value ? `Matched ${bestMatch.key}: ${bestMatch.value}` : undefined;
    return { document: result.item, matchContext };
  });
}
