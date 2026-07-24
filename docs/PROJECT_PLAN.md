# PROJECT_PLAN.md

## Project: The Universe of Computer Science

**Status:** Implementation-ready plan  
**Primary data source:** `computer_science_universe_v2.json`  
**Target:** Responsive, accessible, static web application  
**Recommended implementation:** React + TypeScript + Vite + SVG/D3 utilities

---

## 1. Executive summary

The website will be an interactive academic atlas of computer science. It will use the supplied JSON file as its content and configuration source, while presenting the same knowledge through three complementary views:

1. **Landscape** — a fixed conceptual map using the horizontal abstract-to-concrete axis and the vertical machine-centered-to-human-centered axis.
2. **Connections** — a focus-centered network for examining intellectual relationships around one selected field.
3. **Taxonomy** — a structured, searchable list of domains, fields, bridge fields, and cross-cutting constellations.

The redesign deliberately avoids showing a full network graph on top of the conceptual coordinate map. The Landscape view answers “where does this field sit conceptually?”; the Connections view answers “how does this field relate to others?”; the Taxonomy view answers “what fields exist and how are they organized?”

The JSON remains the single source of truth for:

- 10 broad domains;
- 63 research fields;
- ordinary versus multi-domain bridge fields;
- 11 cross-cutting constellations;
- 206 typed relationships;
- coordinates, region geometry, labels, colors, summaries, topics, venues, books, and visual behavior.

No field, book, venue, connection, coordinate, or domain color should be duplicated manually in React components.

---

## 2. Product goals

### 2.1 Primary goals

The finished website should let a visitor:

- understand the broad organization of computer science;
- see where a field lies on the two conceptual axes;
- discover fields that span several domains;
- understand why a constellation is not an ordinary child of one category;
- inspect summaries, representative topics, journals, conferences, and books;
- explore typed relationships without visual clutter;
- search by field name, alias, topic, venue, or book;
- share a direct URL to a selected field or constellation;
- use the site with keyboard navigation, a screen reader, reduced motion, or a small screen.

### 2.2 Secondary goals

- Make the taxonomy editable through JSON rather than source-code changes.
- Make the website fast enough to deploy as a static site.
- Make the visualization deterministic: revisiting the same node should not produce a completely different graph layout.
- Preserve a restrained “universe” visual metaphor without allowing decoration to compete with information.
- Clearly communicate that coordinates, field boundaries, and representative resources are editorial approximations rather than objective rankings.

### 2.3 Non-goals for version 1

- No user accounts or collaborative editing.
- No server-side database.
- No live citation or venue-ranking service.
- No automatic inference of new edges.
- No attempt to display every specialty within every research field.
- No global force-directed graph containing all nodes and all edges at once.
- No heavy, continuously animated starfield.

---

## 3. Source data and its role

### 3.1 Source-of-truth policy

Copy `computer_science_universe_v2.json` into:

```text
public/data/computer_science_universe_v2.json
```

Load it at runtime so that content updates do not require editing React components. The application may generate derived indexes in memory, but must not alter the original loaded data.

### 3.2 Top-level JSON sections

The file contains:

```text
schema_version
metadata
visual_design
relation_types
domains
fields
constellations
relations
```

Each section has a distinct responsibility:

- `metadata`: title, subtitle, editorial notice, taxonomy principles, and coordinate definitions.
- `visual_design`: view definitions, node styles, semantic zoom thresholds, interactions, detail-panel configuration, filters, and search fields.
- `relation_types`: semantics and default styles for every edge type.
- `domains`: broad category regions, colors, descriptions, display order, and field memberships.
- `fields`: ordinary and bridge research fields.
- `constellations`: cross-cutting umbrellas, hybrid methodologies, ecosystems, application themes, and other non-ordinary children.
- `relations`: taxonomy and conceptual connections between IDs.

### 3.3 Data-derived counts

The implementation should derive counts from the file rather than hardcode them. In the current version, these are:

- 10 domains;
- 63 fields;
- 15 `ordinary_field` nodes;
- 48 `bridge_field` nodes;
- 11 constellations;
- 206 relations.

These counts may change in later JSON revisions.

### 3.4 Important semantic distinctions

#### Domain

A broad navigation region. Domains are not mutually exclusive departments and should be rendered as soft conceptual regions rather than giant selectable parent stars.

#### Ordinary field

A field with one primary domain and an ordinary parent-child relationship. It is represented by a standard circular node.

#### Bridge field

A field belonging to multiple domains. It remains a full research field, but its border is segmented using the colors of all associated domains.

A bridge field is different from a constellation:

- A bridge field is itself an established field.
- A constellation is defined by combining or connecting several fields.

#### Constellation

A cross-cutting concept that is explicitly marked `ordinary_child: false`. It is not displayed as a normal child inside one domain. Examples include Data Science, Neuro-Symbolic AI, Human–AI Interaction, Trustworthy AI, and Internet of Things.

Constellations are hidden by default in the Landscape view and appear when:

- searched for directly;
- a related component field is selected;
- the user enables the “Show constellations” filter;
- the active view is Connections or Taxonomy and the current context calls for them.

The `why_not_ordinary_child` text must be visible in the detail panel and in the Taxonomy view.

### 3.5 Runtime validation

Use **Zod** to validate the JSON before rendering. The application must fail gracefully when the file does not conform.

Create schemas for:

- metadata;
- coordinate axes;
- visual design;
- domain;
- field;
- constellation;
- relation type;
- relation;
- complete universe data.

Validation should check both shape and references:

1. IDs are unique across domains, fields, and constellations.
2. Every `domain_id` exists.
3. Every `primary_domain_id` is included in the field’s `domain_ids`.
4. Every `component_field_id` exists and references a field.
5. Every relation source and target exists.
6. Every relation type exists.
7. Coordinates are in `[0, 100]`.
8. Domain region radii are positive.
9. Colors are valid CSS hex colors.
10. `ordinary_field` nodes have `ordinary_child: true`.
11. Constellations have `ordinary_child: false`.
12. Book authors and venue lists are arrays, not comma-separated strings.
13. `schema_version` is supported.

In development, validation errors should include the full property path. In production, show a friendly “Map data could not be loaded” page with a collapsible technical detail section.

---

## 4. Recommended technology stack

### 4.1 Core

- **Vite** — development server and static build.
- **React** — application and component model.
- **TypeScript** — strongly typed data and state.
- **SVG** — primary visualization surface.
- **D3 utility packages** — scales, zoom/pan behavior, path generation, and force simulation; React remains responsible for DOM rendering.

Recommended D3 packages:

```text
d3-scale
d3-zoom
d3-selection
d3-force
d3-shape
d3-ease
d3-interpolate
```

Do not let D3 independently create or remove React-owned DOM nodes. D3 should calculate transforms, scales, paths, and force positions; React should render the resulting data.

### 4.2 State and utilities

- **Zustand** — small global interaction store.
- **Zod** — runtime validation.
- **Fuse.js** — fuzzy search over the generated search index.
- **React Router** — URL-addressable views and selections.
- **CSS Modules** plus CSS custom properties — component styles and theme tokens.
- **clsx** — conditional class names.

### 4.3 Testing

- **Vitest** — unit and data validation tests.
- **React Testing Library** — component behavior.
- **Playwright** — end-to-end interaction and responsive tests.
- **axe-core / @axe-core/playwright** — automated accessibility checks.

### 4.4 Optional development support

- **ESLint** with TypeScript and React rules.
- **Prettier** for code and JSON formatting.
- **Husky/lint-staged** for pre-commit checks.
- **GitHub Actions** for test and deployment workflows.

### 4.5 Why SVG instead of Canvas for version 1

The current dataset is small enough for SVG. SVG provides:

- direct DOM focus targets;
- semantic labels and ARIA attributes;
- CSS styling and transitions;
- crisp typography and vector graphics;
- simple hit testing;
- easier debugging;
- accessible keyboard interaction.

Canvas would become useful only if the map grows to hundreds or thousands of simultaneously visible nodes.

---

## 5. Repository structure

Use a structure similar to:

```text
computer-science-universe/
├── public/
│   └── data/
│       └── computer_science_universe_v2.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── AppHeader/
│   │   ├── SearchBox/
│   │   ├── FilterPanel/
│   │   ├── DetailPanel/
│   │   ├── DomainChips/
│   │   ├── VenueList/
│   │   ├── BookList/
│   │   ├── EmptyState/
│   │   ├── ErrorBoundary/
│   │   └── HelpDialog/
│   ├── views/
│   │   ├── LandscapeView/
│   │   │   ├── LandscapeView.tsx
│   │   │   ├── LandscapeCanvas.tsx
│   │   │   ├── AxesLayer.tsx
│   │   │   ├── DomainRegionLayer.tsx
│   │   │   ├── RelationLayer.tsx
│   │   │   ├── NodeLayer.tsx
│   │   │   ├── LabelLayer.tsx
│   │   │   └── landscapeLayout.ts
│   │   ├── ConnectionsView/
│   │   │   ├── ConnectionsView.tsx
│   │   │   ├── ConnectionsCanvas.tsx
│   │   │   ├── ConnectionControls.tsx
│   │   │   └── connectionLayout.ts
│   │   └── TaxonomyView/
│   │       ├── TaxonomyView.tsx
│   │       ├── DomainSection.tsx
│   │       ├── FieldRow.tsx
│   │       └── ConstellationSection.tsx
│   ├── visualization/
│   │   ├── NodeGlyph.tsx
│   │   ├── OrdinaryFieldGlyph.tsx
│   │   ├── BridgeFieldGlyph.tsx
│   │   ├── ConstellationGlyph.tsx
│   │   ├── RelationPath.tsx
│   │   ├── markers.tsx
│   │   ├── labelPlacement.ts
│   │   ├── coordinateScales.ts
│   │   └── zoomController.ts
│   ├── data/
│   │   ├── schema.ts
│   │   ├── loadUniverseData.ts
│   │   ├── buildIndexes.ts
│   │   ├── selectors.ts
│   │   ├── searchIndex.ts
│   │   └── validateReferences.ts
│   ├── state/
│   │   ├── universeStore.ts
│   │   ├── urlState.ts
│   │   └── types.ts
│   ├── hooks/
│   │   ├── useUniverseData.ts
│   │   ├── useResponsiveLayout.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useKeyboardNavigation.ts
│   │   └── useVisibleRelations.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── themes.css
│   ├── types/
│   │   └── universe.ts
│   ├── test/
│   │   ├── fixtures/
│   │   └── setup.ts
│   └── main.tsx
├── scripts/
│   ├── validate-data.ts
│   ├── print-data-summary.ts
│   └── check-links.ts
├── tests/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 6. TypeScript data model

Generate TypeScript types from or alongside the Zod schemas. Important types include:

```ts
type NodeId = string;
type DomainId = string;
type FieldId = string;
type ConstellationId = string;

type NodeClass = "ordinary_field" | "bridge_field";

type UniverseNode = FieldNode | ConstellationNode;

type FieldNode = {
  id: FieldId;
  name: string;
  kind: "field";
  node_class: NodeClass;
  ordinary_child: boolean;
  domain_ids: DomainId[];
  primary_domain_id: DomainId;
  aliases: string[];
  position: ConceptualPosition;
  summary: string;
  representative_topics: string[];
  representative_venues: VenueSet;
  books: Book[];
  display: FieldDisplayConfig;
};

type ConstellationNode = {
  id: ConstellationId;
  name: string;
  kind: "constellation";
  ordinary_child: false;
  constellation_type: string;
  domain_ids: DomainId[];
  component_field_ids: FieldId[];
  position: ConceptualPosition;
  summary: string;
  why_not_ordinary_child: string;
  representative_topics: string[];
  representative_venues: VenueSet;
  books: Book[];
  display: ConstellationDisplayConfig;
};
```

Do not use a generic untyped object for data access. Components should receive narrow typed props.

---

## 7. Derived indexes

After validation, construct an immutable `UniverseIndex` once:

```ts
type UniverseIndex = {
  domainById: Map<DomainId, Domain>;
  fieldById: Map<FieldId, FieldNode>;
  constellationById: Map<ConstellationId, ConstellationNode>;
  nodeById: Map<NodeId, UniverseNode | Domain>;
  fieldsByDomain: Map<DomainId, FieldNode[]>;
  constellationsByDomain: Map<DomainId, ConstellationNode[]>;
  constellationsByComponent: Map<FieldId, ConstellationNode[]>;
  incomingRelations: Map<NodeId, Relation[]>;
  outgoingRelations: Map<NodeId, Relation[]>;
  undirectedAdjacency: Map<NodeId, Relation[]>;
  relationTypeById: Map<string, RelationType>;
};
```

### 7.1 Index-building rules

- Sort domains by `display_order`.
- Sort field lists first by `display.priority`, then alphabetically.
- Preserve `primary_domain_id` for canonical placement in the Taxonomy view.
- Treat `part_of` relations separately from conceptual edges.
- For undirected relations, add one adjacency entry for each endpoint.
- For directed relations, retain direction but still make the relation discoverable from both endpoints.
- Record every constellation that names a field in `component_field_ids`.

### 7.2 Data selectors

Implement pure selectors for:

- active node;
- visible nodes after filtering;
- direct conceptual relations;
- taxonomy membership;
- one-hop and two-hop neighborhoods;
- constellations revealed by a field;
- domain membership chips;
- related fields grouped by relation type;
- search documents;
- current visible label priority.

Pure selectors make behavior testable and prevent visualization components from knowing the full schema.

---

## 8. Application state

Use a small Zustand store. Suggested state:

```ts
type AppState = {
  view: "landscape" | "connections" | "taxonomy";
  selectedNodeId: NodeId | null;
  hoveredNodeId: NodeId | null;
  keyboardFocusedNodeId: NodeId | null;
  searchQuery: string;
  filters: {
    domainIds: Set<DomainId>;
    nodeClasses: Set<"ordinary_field" | "bridge_field" | "constellation">;
    xRange: [number, number];
    yRange: [number, number];
    relationshipTypes: Set<string>;
    showConstellations: boolean;
  };
  landscapeCamera: { x: number; y: number; k: number };
  connectionDepth: 1 | 2;
  connectionLayoutMode: "domain_sectors" | "radial";
  detailsPanelOpen: boolean;
  filtersOpen: boolean;
  helpOpen: boolean;
};
```

### 8.1 Persistent versus temporary state

Persist in the URL:

- active view;
- selected node;
- connection depth;
- optionally enabled domains and constellation visibility.

Keep temporary UI state outside the URL:

- hover;
- current panel animation;
- search-box focus;
- preview tooltip;
- temporary keyboard focus.

### 8.2 URL format

Use query parameters so the static application can be hosted without special route rewriting:

```text
/?view=landscape
/?view=landscape&node=computational-learning-theory
/?view=connections&node=machine-learning&depth=2
/?view=taxonomy&node=data-science
```

On initial load:

1. Parse URL state.
2. Validate the node ID and view.
3. Fall back to `landscape` if invalid.
4. If Connections has no valid selected node, show a selection/search empty state instead of an unrooted network.

Use `history.replaceState` for high-frequency updates such as filter sliders; use `pushState` for meaningful navigation such as selecting a node or changing view.

---

## 9. Overall page structure

### 9.1 Desktop shell

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Universe of Computer Science  [Search…]  Landscape Connections Taxonomy    │
├──────────────┬───────────────────────────────────────────┬──────────────────┤
│ Filters      │                                           │ Field details    │
│              │             active view                   │ (when selected)  │
│              │                                           │                  │
├──────────────┴───────────────────────────────────────────┴──────────────────┤
│ status / selected field / reset view / visible-result count                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Header

The header contains:

- compact project title;
- global search;
- tab-like view switcher;
- filters button on narrower screens;
- “How to read this map” button;
- optional theme control.

The long introductory paragraph should not permanently occupy the visualization. Put it in the Help dialog and show a one-time compact onboarding hint.

### 9.3 Left filter panel

Desktop width: approximately `260px`.  
Collapsible to a `44–48px` icon rail.  
Hidden behind a sheet on tablet/mobile.

Sections:

1. Domains with colored markers and counts.
2. Node type: ordinary fields, bridge fields, constellations.
3. Abstract-to-concrete range.
4. Machine-to-human range.
5. Relationship types, relevant mainly to Connections.
6. Reset filters.

The domain controls double as the color legend, eliminating the old legend that covered the map.

### 9.4 Main content area

The visualization must know its usable width after accounting for:

- filter panel;
- detail panel;
- header;
- status bar;
- safe padding for labels.

Use `ResizeObserver` to recompute scales whenever a panel opens, closes, or changes width.

### 9.5 Detail panel

Desktop width comes from JSON: `420px`. The panel should participate in layout rather than cover nodes. When it opens:

1. Main visualization width shrinks.
2. Camera transforms are adjusted to keep the selected node visible.
3. The panel receives focus only when opened explicitly by keyboard; pointer selection should not steal focus unexpectedly.

### 9.6 Status bar

Show concise context such as:

```text
Machine Learning · bridge field · 3 domains · 12 direct relations
```

Also include:

- reset camera;
- clear selection;
- result count after filters;
- small keyboard shortcut hint on desktop.

---

## 10. Design system

### 10.1 Theme

Keep the dark astronomical identity, but make it subordinate to the data.

Suggested CSS tokens:

```css
:root {
  --background: #0b1020;
  --surface-1: #11182a;
  --surface-2: #172136;
  --surface-elevated: #1d2941;
  --text-primary: #f2f5fa;
  --text-secondary: #a8b0c0;
  --text-muted: #778197;
  --border-subtle: rgb(255 255 255 / 0.09);
  --grid-line: rgb(255 255 255 / 0.05);
  --edge-muted: rgb(220 228 242 / 0.10);
  --edge-active: rgb(239 244 252 / 0.62);
  --focus-ring: #ffffff;
  --panel-width: 420px;
}
```

Domain colors are supplied by JSON and should be exposed as generated CSS variables:

```css
--domain-theory-algorithms: #A56DE2;
```

### 10.2 Background

Use:

- solid near-black navy;
- extremely sparse static stars at low opacity;
- a subtle coordinate grid in Landscape only;
- soft domain-region fills derived from the JSON colors.

Do not use large permanent clouds, breathing halos, animated particles, or high-contrast star noise.

### 10.3 Typography

Use a readable sans-serif typeface available through normal web delivery. Do not depend on users having a special local font.

Recommended hierarchy:

- site title: `24–28px`, medium;
- domain label: `16–18px`, semibold;
- selected node title: `22px`, semibold;
- visible field label: `12–14px`, medium;
- metadata: `12–13px`;
- axis labels: `11–12px`, uppercase or small caps;
- body text: `14–16px`, line-height `1.5–1.65`.

Do not render long domain names in all caps with wide letter spacing.

### 10.4 Motion

Default transitions: `150–250ms`.

Allow motion only when it helps preserve context:

- camera centers on search result;
- detail panel opens and closes;
- selected node pulses once;
- connection graph settles from cached initial positions.

Respect `prefers-reduced-motion`:

- disable pulse;
- jump rather than animate camera transforms;
- substantially shorten or disable graph transitions.

---

## 11. Landscape view implementation

### 11.1 Purpose

The Landscape view answers:

> Where does a field lie conceptually?

It is a scatterplot-like conceptual atlas, not a global network graph.

### 11.2 Coordinate mapping

Create linear scales:

```ts
xScale = scaleLinear()
  .domain([0, 100])
  .range([leftPadding, viewportWidth - rightPadding]);

yScale = scaleLinear()
  .domain([0, 100])
  .range([viewportHeight - bottomPadding, topPadding]);
```

The Y range is reversed because SVG coordinates increase downward.

Recommended base padding before zoom:

- top: `72px`;
- right: `72px`;
- bottom: `64px`;
- left: `72px`.

Increase the right padding when the detail panel is open only if the panel overlays rather than reflows. The preferred implementation is reflow.

### 11.3 Axis rendering

Always show the conceptual model directly in the map:

- horizontal center line with labels “Abstract” and “Concrete”;
- vertical center line with labels “Machine-centered” and “Human-centered”;
- subtle ticks at `0, 25, 50, 75, 100`;
- optional quadrant captions at very low opacity;
- a help icon opening the full definitions from `metadata.coordinate_system`.

Axes should remain visible but fade slightly during focused selection.

### 11.4 Domain regions

Render each domain as a soft SVG ellipse using:

```text
domain.region.center.x
domain.region.center.y
domain.region.radius_x
domain.region.radius_y
```

Convert the center and radii through the coordinate scales. The ellipse should have:

- fill color equal to domain color;
- fill opacity from `visual_design.domain_rendering.region_fill_opacity`;
- border color equal to domain color;
- border opacity from JSON;
- no centroid star;
- domain title positioned near a low-collision edge of the ellipse.

Domain regions may overlap. This is desirable because the taxonomy explicitly allows multi-domain fields.

Do not treat region geometry as a strict membership boundary. It is an editorial visual aid.

### 11.5 Layer order

Use the following SVG order:

1. static background decoration;
2. grid;
3. domain regions;
4. axes;
5. inactive relation paths;
6. active relation paths;
7. nodes;
8. labels;
9. focus rings and hover overlays;
10. transient tooltips.

This ensures edges never obscure node borders or labels.

### 11.6 Ordinary field glyph

Render `ordinary_field` as:

- SVG circle;
- radius from JSON, currently `7px` before zoom compensation;
- dark fill matching the surface/background;
- border using the primary domain color;
- `2px` border;
- no permanent glow.

To keep nodes usable at varying zoom levels, use a hybrid sizing rule:

- positions scale with zoom;
- visual radius is clamped between `6px` and `11px`;
- hit area is at least `24 × 24px` using an invisible circle.

### 11.7 Bridge field glyph

Render `bridge_field` as a circular node with a segmented outer ring.

Implementation:

1. Read `domain_ids` in their JSON order, with the primary domain first.
2. Divide 360 degrees into equal arc segments.
3. Draw one SVG arc per domain using that domain’s color.
4. Insert a `1–2px` angular gap between segments.
5. Use a dark inner circle.
6. Add an accessible label such as “Machine Learning, bridge field in Artificial Intelligence and Mathematical, Statistical & Optimization Foundations.”

Do not blend the domain colors into a single ambiguous color. Segmentation is the secondary category encoding required for multi-domain membership.

### 11.8 Constellation glyph

Render constellations as outlined stars or diamond-star hybrids, distinct from field circles.

Rules:

- hidden by default in Landscape;
- no filled center;
- border uses a segmented or gently blended domain treatment;
- visible only under explicit reveal conditions;
- label includes the word “constellation” in assistive text, not necessarily in the visible label;
- selecting one highlights its `component_field_ids` and all `synthesizes` relations.

### 11.9 Semantic zoom

Read semantic zoom thresholds from JSON rather than duplicating them in code.

At each threshold, determine which label classes and previews are visible. Use a small hysteresis interval such as `±0.03` around thresholds to prevent flickering when the user rests near a boundary.

Suggested behavior matching the JSON:

- zoom `< 0.55`: domain labels only;
- zoom `0.55–0.79`: priority-1 field labels;
- zoom `0.80–1.14`: all field nodes plus priority-1 labels;
- zoom `1.15–1.49`: all field labels and currently visible constellations;
- zoom `≥ 1.5`: optional topic preview on hover.

Selected, hovered, keyboard-focused, and search-result labels are always visible regardless of zoom.

### 11.10 Label placement

Implement a deterministic collision-aware label solver.

For every potentially visible label:

1. Measure text using canvas text metrics or a hidden SVG measurement layer.
2. Generate candidate placements: right, left, upper-right, upper-left, lower-right, lower-left, above, below.
3. Score candidates based on:
   - overlap with higher-priority labels;
   - overlap with node hit targets;
   - clipping outside viewport;
   - distance from its node;
   - crossing an active edge;
   - collision with axis labels or domain labels.
4. Place labels in priority order:
   - selected;
   - hovered/focused;
   - searched;
   - `display.priority = 1`;
   - ordinary visible labels;
   - constellations.
5. If no acceptable placement exists, hide the lower-priority label rather than allow overlap.
6. Recompute after resize, zoom-end, filter changes, and panel transitions—not on every pointer-move frame.

Long labels should use one or two controlled lines. Add a maximum width of approximately `220px`; do not truncate selected labels.

### 11.11 Pan and zoom

Use `d3-zoom` with:

- zoom range approximately `[0.55, 3.0]`;
- wheel zoom centered at pointer;
- drag-to-pan only from the empty canvas;
- double-click disabled or redefined as “center selected”;
- touch pinch zoom;
- a visible reset-camera control.

Prevent accidental panning when the pointer begins on a node, control, label link, or panel.

Use a camera clamp so the full data area cannot be lost completely off-screen. Leave some overscroll room so edge nodes can be centered.

### 11.12 Hover behavior

After a short delay of approximately `80–120ms`:

- slightly raise/enlarge node;
- ensure full label is visible;
- reveal direct conceptual relations;
- fade unrelated nodes to approximately 30–40% opacity;
- show a compact tooltip containing name, domain chips, node type, and the first sentence of summary.

Do not open the full detail panel on hover.

Cancel the hover preview immediately when the pointer moves rapidly across nodes to avoid tooltip flicker.

### 11.13 Selection behavior

Click or press Enter to:

1. set `selectedNodeId`;
2. open detail panel;
3. keep direct relation paths visible;
4. reveal constellations containing the selected field;
5. dim unrelated regions and nodes without making them disappear;
6. update URL;
7. reposition camera if the selected node would be hidden by the panel.

Clicking empty canvas clears selection only if the user has not begun a pan gesture.

### 11.14 Visible relations in Landscape

Do not show all edges by default.

When a node is selected, show:

- direct non-`part_of` relations;
- `synthesizes` relations if the node or its revealed constellation is involved;
- optionally at most the strongest 8 conceptual edges initially;
- a “Show all N relations” control if there are more.

Use relation strength for ordering, not opacity alone.

Taxonomic `part_of` edges should not appear in Landscape because domain regions already encode membership.

### 11.15 Edge paths

Use curved paths instead of straight lines when several edges share nearby endpoints.

- Single relation: quadratic Bézier with a small deterministic bend.
- Multiple relations between the same pair: offset curves.
- Directed relation: marker arrow at target.
- Undirected relation: no marker.
- Edge label appears near midpoint only on hover/focus.

Edge labels must use the human-readable `relation_type.label`, such as “Uses methods from,” rather than the internal ID.

---

## 12. Connections view implementation

### 12.1 Purpose

The Connections view answers:

> How is this field intellectually connected to other fields?

It does not preserve the Landscape coordinates.

### 12.2 Empty state

If no node is selected:

- display a central search field;
- show a small set of suggested major fields derived from `display.priority`;
- explain that the graph begins from one field rather than displaying the entire network.

### 12.3 Neighborhood extraction

For depth 1:

- selected root;
- all direct conceptual relations after active relationship filters;
- relevant constellations synthesized from the root;
- exclude `part_of` unless domain membership display is enabled.

For depth 2:

- include neighbors of depth-1 field nodes;
- cap total visible nodes, initially around `35–45`;
- rank by relation strength, display priority, and whether the node is a constellation component;
- display a clear notice when lower-ranked nodes are omitted.

Do not silently render hundreds of relationships if the dataset expands.

### 12.4 Layout model

Use a deterministic focus-centered layout:

- selected node fixed at center;
- depth-1 nodes attracted to radius `170–210px`;
- depth-2 nodes attracted to radius `300–360px`;
- collision force prevents overlap;
- domain-sector bias places nodes from the same primary domain in similar angular sectors;
- relation links add mild attraction;
- labels participate in collision approximation.

Use a seeded pseudorandom generator based on the selected node ID so the same graph opens in a stable arrangement.

Cache settled layouts in memory by:

```text
selectedNodeId + depth + relationshipFilterHash + viewportBucket
```

When revisiting a field, begin from the cached layout.

### 12.5 Domain-sector placement

Assign each domain a stable angle based on `display_order`. A node with multiple domains should use the circular average of its domain angles, weighted toward `primary_domain_id`.

This creates a repeatable mental model without forcing exact Landscape coordinates.

### 12.6 Relation styling

Read the style from `relation_types`:

- `part_of`: solid arrow, normally taxonomy only;
- `uses_methods_from`: solid directed;
- `theoretical_foundation_for`: solid directed;
- `systems_foundation_for`: solid directed;
- `overlaps_with`: dashed undirected;
- `applied_to`: dotted directed;
- `synthesizes`: double or paired undirected path.

Because several directed labels can be semantically confusing, every selected edge should support a readable sentence:

```text
Probability & Statistics is a theoretical foundation for Machine Learning.
```

Construct this sentence from source, relation label, and target. For incoming edges, do not reverse the relation’s meaning.

### 12.7 Interaction

- Hover node: highlight its edges within the current subgraph.
- Click node: make it the new root with a smooth center transition.
- Shift-click or dedicated compare control: pin a second node for comparison in a future enhancement; not required for version 1.
- Click edge: open a compact relationship popover with source, type, target, and direction.
- Breadcrumb: keep the last several roots so the user can move back through exploration history.

### 12.8 Controls

Provide:

- depth: 1 hop / 2 hops;
- relationship type checkboxes;
- include/exclude constellations;
- include taxonomy edges toggle, off by default;
- center root;
- return to Landscape at this node.

### 12.9 Transition to Landscape

A visible action should open the currently selected node at its fixed conceptual coordinate in Landscape. The URL and detail panel remain synchronized.

---

## 13. Taxonomy view implementation

### 13.1 Purpose

The Taxonomy view is a structured browsing mode and accessibility-equivalent representation of the data.

### 13.2 Domain sections

Render domains in `display_order`. Each section contains:

- domain color and name;
- domain summary;
- field count;
- expandable field list.

### 13.3 Placement of bridge fields

To avoid duplicate canonical DOM entries:

- render the full field row under its `primary_domain_id`;
- under secondary domains, show a compact cross-reference row such as:

```text
Machine Learning — primarily under Artificial Intelligence; also belongs here
```

Selecting either representation opens the same field.

Alternatively, the user may enable “Show full multi-domain membership,” but the default should avoid repeated long descriptions.

### 13.4 Field rows

Each row shows:

- field name;
- ordinary or bridge badge;
- domain chips;
- summary;
- representative topics preview;
- “Open details” action;
- “Show in Landscape” action;
- “Explore connections” action.

### 13.5 Constellation section

After domains, add a visually distinct section:

```text
Cross-cutting constellations
```

Group by `constellation_type`, with readable labels such as:

- Cross-cutting umbrellas
- Hybrid methodologies
- Cross-domain themes
- Application umbrellas
- Systems ecosystems
- Practice ecosystems
- Cross-domain fields

Each constellation entry must show:

- summary;
- component fields;
- domain chips;
- `why_not_ordinary_child`;
- links to details, Landscape, and Connections.

### 13.6 Search and filters

The global search and domain/type filters apply to Taxonomy. When filtering:

- retain a domain section if any child matches;
- show match counts;
- highlight matched terms;
- include constellation components in search relevance;
- preserve expanded/collapsed state where possible.

### 13.7 Accessibility

Use semantic HTML:

- `<main>`;
- `<section>` for domains;
- `<h2>` domain titles;
- `<ul>` / `<li>` field lists;
- buttons for expandable controls;
- links or buttons for node navigation.

The Taxonomy view must be fully functional without SVG interaction.

---

## 14. Global search

### 14.1 Search corpus

Index the paths specified by `visual_design.search_index_fields`:

- name;
- aliases;
- summary;
- representative topics;
- book titles;
- journal names;
- conference names.

Additionally index:

- domain names and short names;
- constellation component field names;
- `why_not_ordinary_child` for constellations;
- readable constellation type.

### 14.2 Search document

Generate one flattened search document per domain, field, and constellation:

```ts
type SearchDocument = {
  id: NodeId;
  kind: "domain" | "field" | "constellation";
  name: string;
  aliases: string[];
  summary: string;
  topics: string[];
  books: string[];
  venues: string[];
  domains: string[];
  components: string[];
};
```

### 14.3 Ranking

Weight fields approximately as follows:

1. exact name;
2. name prefix;
3. alias;
4. representative topic;
5. domain name;
6. summary;
7. book title;
8. venue.

Boost priority-1 fields only as a tie-breaker; do not allow popularity to defeat a much better textual match.

### 14.4 Search result presentation

Group results into:

- Fields
- Constellations
- Domains
- Books and venues that led to matching nodes

A result card should show:

- name;
- type badge;
- domain chips;
- match context;
- short summary.

Example for a topic match:

```text
Algorithms & Data Structures
Matched topic: locality-sensitive hashing
Theory & Algorithms
```

### 14.5 Search selection behavior

Selecting a result:

- closes the result popover;
- sets selection;
- opens the detail panel;
- in Landscape, centers and pulses the node;
- in Connections, makes the node the root;
- in Taxonomy, scrolls to and expands the relevant row;
- updates URL.

### 14.6 Keyboard behavior

- `/` focuses global search unless focus is inside an editable element.
- Up/down arrows navigate results.
- Enter selects.
- Escape clears or closes.
- Search results use a proper combobox/listbox pattern.

---

## 15. Detail panel

### 15.1 Shared panel architecture

Use one panel component for fields and constellations. Domains may use a simpler variant.

### 15.2 Field panel content

Order:

1. Name.
2. Node-type badge: ordinary field or bridge field.
3. Domain chips; mark the primary domain.
4. Summary.
5. Conceptual position explanation.
6. Representative topics.
7. Related fields grouped by relation type.
8. Representative venues separated into journals and conferences.
9. Books with authors, level, and coverage note.
10. Actions: Landscape, Connections, copy link, close.

### 15.3 Constellation panel content

Order:

1. Name.
2. “Cross-cutting constellation” badge plus readable subtype.
3. Domain chips.
4. Summary.
5. **Why this is not an ordinary child** using `why_not_ordinary_child`.
6. Component fields.
7. Representative topics.
8. Related relations.
9. Venues and books, if non-empty.
10. Actions: show components in Landscape, explore Connections, copy link.

The “not ordinary child” explanation must not be hidden behind an obscure tooltip. It is central to the taxonomy.

### 15.4 Empty metadata handling

Some nodes may have no books, journals, or conferences. Do not render empty headings. Use conditional sections.

If a book has an empty `coverage_note`, omit the note row.

### 15.5 Position explanation

Convert coordinates into readable language without presenting them as exact rankings. Example:

```text
Positioned toward the abstract and moderately human-centered side of the map.
Editorial confidence: medium.
```

Use broad buckets:

- 0–20: strongly abstract / strongly machine-centered;
- 21–40: abstract / machine-centered;
- 41–60: central or mixed;
- 61–80: concrete / human-centered;
- 81–100: strongly concrete / strongly human-centered.

Also provide the exact coordinate in a disclosure for transparency.

### 15.6 Related-field grouping

Group direct conceptual relations by readable type. For directed types, preserve direction:

```text
Theoretical foundations for this field
- Probability & Statistics
- Optimization

This field is applied to
- Natural Language & Speech
- Computer Vision & Perception
```

Use the actual edge direction rather than assuming every adjacent relation means the same thing.

### 15.7 Focus management

- Panel has an accessible heading.
- Close button is first or last in logical tab order.
- Escape closes the panel.
- Closing returns keyboard focus to the selected node or taxonomy row.
- On mobile, treat the bottom sheet as a modal only when it covers most of the viewport; otherwise preserve map interaction carefully.

---

## 16. Filters

### 16.1 Domain filter

Each domain row contains:

- color marker;
- name;
- visible field count;
- checkbox.

Behavior:

- a field is visible if any selected domain matches its `domain_ids`;
- selecting no domains means “all domains,” or prevent the final selected domain from being unchecked; choose one behavior and state it clearly;
- constellation visibility depends on both the constellation filter and domain match.

Recommended behavior: an empty domain set means all domains, simplifying reset and URL state.

### 16.2 Node-class filter

Options:

- ordinary fields;
- bridge fields;
- constellations.

Constellations should still be revealable through search even when their general filter is off. In that case show a temporary notice:

```text
This constellation is visible because it is selected. Enable “Show constellations” to keep all relevant constellations visible.
```

### 16.3 Coordinate filters

Use dual-thumb sliders for X and Y ranges. Requirements:

- numeric accessible inputs paired with sliders;
- labels from metadata, not hardcoded;
- debounce visual recomputation by roughly `50–100ms`;
- selected node remains visible even if outside filter, with a clear exception badge, or selection is cleared. Prefer keeping it visible and explaining the exception.

### 16.4 Relationship filter

Primarily affects Connections and selected edges in Landscape.

Use labels and descriptions from `relation_types`. Do not expose internal IDs.

### 16.5 Reset behavior

One Reset action restores:

- all domains;
- ordinary and bridge fields visible;
- constellations hidden by default;
- full coordinate ranges;
- all conceptual relationship types;
- depth 1;
- default camera.

Selection may either remain or clear; use two controls:

- “Reset filters” preserves selection.
- “Reset entire view” clears selection and camera.

---

## 17. “Not ordinary children” behavior

This is a major product feature, not only a data detail.

### 17.1 Visual grammar

- Ordinary field: one-color circular border.
- Bridge field: segmented circular border.
- Constellation: outlined star marker.
- Domain: soft region, not a node.

This makes the distinction visible before the user reads a description.

### 17.2 Reveal rules

A constellation appears when any condition is true:

```ts
const visible =
  filters.showConstellations ||
  selectedNodeId === constellation.id ||
  searchResultIds.has(constellation.id) ||
  constellation.component_field_ids.includes(selectedNodeId) ||
  activeConnectionNeighborhood.has(constellation.id);
```

Hovering a component may show a faint preview marker, but selection should be required before all synthesis edges appear.

### 17.3 Component highlighting

When a constellation is selected:

- highlight all component field nodes;
- show `synthesizes` edges;
- fade unrelated nodes;
- display component field names in the panel;
- provide a “Fit all components” camera action.

### 17.4 Explanatory copy

Every constellation detail panel and taxonomy entry contains a subsection titled:

```text
Why this is a constellation
```

Use `why_not_ordinary_child` verbatim as editorial content.

### 17.5 Search semantics

Searching for “Data Science” should return the Data Science constellation itself before individual component fields. The result should say:

```text
Cross-cutting constellation · 5 component fields
```

### 17.6 Connections semantics

In Connections view, constellation synthesis edges should be visually distinct from ordinary field-to-field relationships. A constellation may be the root. In that case, its component fields form the first ring.

### 17.7 Taxonomy semantics

Do not nest a constellation under its first domain. Place it in the dedicated constellation section and list all associated domains.

---

## 18. Responsive design

### 18.1 Breakpoints

Suggested layout breakpoints:

- desktop: `≥ 1200px`;
- compact desktop/tablet landscape: `800–1199px`;
- mobile: `< 800px`.

Use content behavior rather than assuming fixed device classes.

### 18.2 Desktop

- persistent header;
- optional persistent filter rail;
- right detail panel;
- full Landscape and Connections canvas;
- status bar.

### 18.3 Tablet

- filter panel becomes a modal side sheet;
- detail panel overlays from right or becomes a resizable sheet;
- reduce default label density;
- keep view tabs visible;
- use touch-friendly hit targets.

### 18.4 Mobile

Default first visit to Taxonomy or a mobile-specific browse screen, while retaining all three view options.

Landscape mobile behavior:

- map is pannable and pinch-zoomable;
- domain labels and selected label only at initial zoom;
- no default edge labels;
- detail panel opens as bottom sheet;
- provide “Center selected” floating button;
- filters open in full-height sheet.

Connections mobile behavior:

- default to depth 1;
- cap nodes more aggressively;
- edge labels appear in an accessible list below the graph rather than all on-canvas;
- tapping a relation in the list highlights the edge.

Taxonomy mobile behavior:

- accordion domains;
- sticky search;
- field rows use compact domain chips;
- actions move into an overflow menu.

### 18.5 Safe areas

Respect mobile safe-area insets with `env(safe-area-inset-*)` for bottom sheets and floating controls.

---

## 19. Accessibility

### 19.1 General target

Aim for WCAG 2.2 AA behavior and contrast.

### 19.2 Color independence

Color cannot be the sole category signal:

- bridge fields use segmented rings;
- constellations use a star shape;
- node type appears in text;
- domain names appear in chips and accessible labels;
- selected state includes border/halo changes, not only color.

### 19.3 SVG semantics

The visualization container should include:

- an accessible title;
- a description explaining the axes and current view;
- each interactive node as a focusable SVG group or transparent button overlay;
- `aria-label` containing node name, type, domains, and conceptual position;
- relationships available in the detail panel and Connections relation list, not only through visual lines.

### 19.4 Keyboard navigation

Required:

- Tab reaches main controls and selected/visible nodes.
- Enter or Space selects a focused node.
- Escape closes tooltip, panel, or dialog in that order.
- Arrow keys move to a nearby node in Landscape.
- `/` focuses search.
- Home resets camera when canvas has focus.

For arrow navigation, choose the nearest visible node in the requested geometric direction using projected distance.

### 19.5 Screen-reader alternative

The Taxonomy view is the full semantic alternative. Additionally provide a “View selected relationships as list” section in Connections.

Do not attempt to communicate a complex graph solely through SVG path descriptions.

### 19.6 Focus appearance

Use a high-contrast focus ring of at least `2px` with sufficient offset. Never remove the browser focus indicator without replacement.

### 19.7 Reduced motion and contrast

Support:

- `prefers-reduced-motion`;
- `prefers-contrast: more` where available;
- browser zoom to at least 200% without loss of functionality.

### 19.8 Text and controls

- Minimum touch target: approximately `44 × 44px` for standalone controls.
- Tooltips must not contain the only route to information.
- All icon buttons need accessible names.
- Range sliders need visible labels and numeric values.

---

## 20. Performance

### 20.1 Data loading

The JSON is modest in size. Load once at application start and cache the parsed data in memory.

Optional:

- use `fetch` with immutable cache headers on deployment;
- precompress JSON with Brotli/Gzip through the host;
- show the shell immediately while data loads.

### 20.2 Rendering

With roughly 74 field/constellation nodes and a small selected edge set, SVG should remain fast.

Optimize by:

- memoizing glyphs and labels;
- rendering no default conceptual edges;
- recomputing labels only after meaningful state changes;
- using `requestAnimationFrame` for camera updates;
- throttling pointermove handlers;
- using CSS transforms sparingly and avoiding expensive filters;
- caching search documents and indexes;
- stopping force simulations after settling.

### 20.3 Avoid expensive glow filters

Large SVG Gaussian blurs are expensive and recreate the visual problem of the original site. Use a small translucent circle for selected halo instead.

### 20.4 Bundle size

Import individual D3 modules rather than the entire package. Lazy-load the Connections view and possibly the Taxonomy view if the initial bundle becomes large.

---

## 21. Loading, empty, and error states

### 21.1 Loading

Show:

- header skeleton;
- simple central loading indicator;
- no fake node layout.

Because loading should be quick, avoid elaborate animations.

### 21.2 Data error

Display:

```text
The map data could not be loaded.
```

Provide:

- retry button;
- schema version if available;
- development-only details;
- link or instruction to inspect the JSON during local development.

### 21.3 No filter results

Show a central message with:

- active filters summary;
- reset filters button;
- selected node exception if applicable.

### 21.4 Missing selected ID

If a shared URL references an unknown node:

- remove invalid selection from URL;
- keep the requested view;
- show a dismissible notice;
- offer search.

### 21.5 Connections with no conceptual edges

Show the selected node, domain membership, and a message that no matching relations remain under current filters. Offer reset relationships.

---

## 22. Testing strategy

### 22.1 Data tests

Run in CI:

- JSON parses;
- Zod schema passes;
- reference validation passes;
- all IDs unique;
- all relation endpoints valid;
- all relation types valid;
- all coordinates in range;
- no constellation marked ordinary;
- no bridge field with fewer than two domains;
- primary domain included in domain list;
- domain `field_ids` agree with field memberships;
- no exact duplicate relations unless intentionally allowed;
- search index contains every node.

### 22.2 Unit tests

Test:

- coordinate scale conversion;
- domain ellipse conversion;
- relation direction sentences;
- visible-node filtering;
- constellation reveal rules;
- neighborhood extraction at depth 1 and 2;
- URL parse/serialize;
- coordinate verbalization;
- label candidate scoring;
- search ranking.

### 22.3 Component tests

Test:

- ordinary glyph uses primary domain color;
- bridge glyph renders one segment per domain;
- constellation glyph has distinct shape;
- empty venue and book sections are omitted;
- constellation panel displays `why_not_ordinary_child`;
- detail panel restores focus on close;
- filter panel updates result count;
- keyboard selection opens details.

### 22.4 End-to-end scenarios

At minimum:

1. Load default Landscape and see axes, regions, and priority labels.
2. Search “Machine Learning,” select result, center node, and open panel.
3. Verify bridge-domain ring and multiple domain chips.
4. Select Data Science and see “Why this is a constellation.”
5. Select a component field and see related constellation reveal.
6. Switch to Connections with selection preserved.
7. Change depth from 1 to 2.
8. Filter to one relationship type.
9. Switch to Taxonomy and locate selected row.
10. Copy/share URL, reload, and restore state.
11. Navigate with keyboard only.
12. Run mobile viewport and open bottom-sheet details.
13. Enable reduced motion and verify animations are suppressed.
14. Filter to no results and reset.

### 22.5 Visual regression tests

Capture screenshots for:

- desktop Landscape default;
- selected ordinary field;
- selected bridge field;
- selected constellation;
- Connections depth 1;
- Taxonomy desktop;
- mobile Landscape;
- mobile detail sheet;
- high-contrast or light theme if supported.

Use stable seeded layouts to keep screenshots deterministic.

### 22.6 Accessibility tests

Automated axe checks plus manual review for:

- search combobox;
- dialogs and sheets;
- focus order;
- keyboard map navigation;
- contrast of every domain color against background;
- screen-reader reading order;
- 200% zoom;
- touch targets.

---

## 23. Editorial and data-maintenance workflow

### 23.1 Editing process

1. Edit the JSON source.
2. Run `npm run validate:data`.
3. Run `npm run summary:data` to review counts and membership changes.
4. Run unit tests.
5. Open a local preview and inspect affected nodes in all three views.
6. Review label collisions and region placement.
7. Commit JSON and any schema changes together.

### 23.2 Schema versioning

Use semantic schema versions:

- patch: editorial content changes without structural changes;
- minor: optional properties added;
- major: breaking structure or changed semantics.

The loader should explicitly support known major versions and reject unsupported ones with a clear message.

### 23.3 Content review

Because the JSON labels itself `curated_draft`, establish a recurring review for:

- book editions and coverage notes;
- venue names and scope;
- field titles;
- domain membership;
- relation direction;
- constellation status;
- coordinates and confidence;
- taxonomy balance.

### 23.4 Optional future source fields

The website can work without these, but future JSON versions may add:

```json
{
  "central_questions": [],
  "external_links": [],
  "citations": [],
  "historical_notes": "",
  "prerequisites": [],
  "career_examples": [],
  "last_reviewed": "YYYY-MM-DD",
  "editorial_notes": ""
}
```

The UI should ignore unknown fields so minor forward-compatible additions do not break it.

---

## 24. Build and deployment

### 24.1 Scripts

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run validate:data && tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
    "validate:data": "tsx scripts/validate-data.ts",
    "summary:data": "tsx scripts/print-data-summary.ts"
  }
}
```

### 24.2 Static hosting

Suitable targets:

- GitHub Pages;
- Cloudflare Pages;
- Netlify;
- Vercel static deployment.

Because query parameters are used rather than nested path routes, the site works even where SPA fallback configuration is inconvenient.

### 24.3 Caching

- HTML: short cache or revalidation.
- hashed JS/CSS assets: long immutable cache.
- versioned JSON filename: long cache; update filename or query version when content changes.

A practical production path is:

```text
/data/computer_science_universe_v2.json?v=2.0.0
```

### 24.4 Continuous integration

On pull request:

1. install dependencies;
2. validate JSON;
3. typecheck;
4. lint;
5. run unit/component tests;
6. build;
7. run a small Playwright smoke suite.

On main branch:

- run full tests;
- deploy static build;
- optionally post a preview URL.

---

## 25. Implementation phases

### Phase 0 — Project setup

Deliverables:

- Vite React TypeScript project;
- linting and formatting;
- CSS tokens;
- JSON copied into `public/data`;
- CI skeleton.

Acceptance:

- application builds and deploys a blank shell;
- tests run in CI.

### Phase 1 — Data layer

Tasks:

- define Zod schemas;
- implement loader;
- implement reference validation;
- build indexes and selectors;
- add data summary script;
- unit-test all derived structures.

Acceptance:

- current JSON validates;
- every domain, field, constellation, and relation is indexed;
- invalid fixtures produce readable errors.

### Phase 2 — Application shell

Tasks:

- header;
- view switcher;
- responsive main layout;
- placeholder filter and details panels;
- URL state;
- loading/error boundaries.

Acceptance:

- selected view survives reload;
- desktop and mobile shells work.

### Phase 3 — Taxonomy view first

Implement Taxonomy before the graphics-heavy views because it validates the information architecture and supplies an accessible baseline.

Tasks:

- domain sections;
- primary/secondary membership treatment;
- constellation section;
- field and constellation details;
- search and simple filters.

Acceptance:

- all content in JSON can be reached without the map;
- constellation explanation is visible;
- keyboard and screen-reader structure is sound.

### Phase 4 — Detail panel and search

Tasks:

- global search index;
- result popover;
- field panel;
- constellation panel;
- related relation groups;
- deep links and copy-link action.

Acceptance:

- search by name, topic, book, and venue works;
- URL restores selected node;
- empty metadata sections are handled.

### Phase 5 — Landscape foundation

Tasks:

- SVG canvas;
- scales;
- axes;
- grid;
- domain regions;
- pan/zoom;
- ordinary field nodes;
- resize behavior.

Acceptance:

- all visible fields appear at correct conceptual coordinates;
- domains render from JSON region geometry;
- map stays usable when panels open.

### Phase 6 — Advanced Landscape interaction

Tasks:

- bridge segmented glyphs;
- constellation glyphs and reveal rules;
- semantic zoom;
- label placement/collision;
- hover tooltip;
- selection and camera centering;
- on-demand relation paths.

Acceptance:

- labels do not visibly overlap at standard desktop sizes;
- no all-edge hairball;
- selecting a component reveals its constellations;
- selected content remains visible near viewport edges.

### Phase 7 — Connections view

Tasks:

- neighborhood extraction;
- deterministic force/radial layout;
- edge styles and markers;
- depth controls;
- relation list;
- graph breadcrumbs;
- layout cache.

Acceptance:

- same root produces stable layout;
- relation direction is correctly communicated;
- depth 2 remains readable and bounded.

### Phase 8 — Responsive and accessibility pass

Tasks:

- tablet sheets;
- mobile bottom sheet;
- mobile graph caps;
- keyboard spatial navigation;
- screen-reader labels;
- reduced motion;
- contrast audit;
- touch-target audit.

Acceptance:

- core flows pass keyboard-only testing;
- mobile has no clipped critical controls;
- axe reports no serious violations.

### Phase 9 — Testing, polish, and launch

Tasks:

- full E2E suite;
- visual regression;
- performance profiling;
- content QA;
- onboarding/help text;
- metadata and social preview image;
- production deployment.

Acceptance:

- all Definition of Done items pass.

---

## 26. Detailed acceptance criteria

### Landscape

- Axes and definitions are visible without memorizing intro text.
- Domain regions are subtle and sourced from JSON.
- Ordinary, bridge, and constellation nodes are visually distinguishable without color alone.
- Full conceptual edges are absent by default.
- Hover and selection reveal only relevant edges.
- Labels do not overlap at reference viewports or are intentionally suppressed by priority.
- No label is clipped outside the usable viewport when selected.
- Search can center any field or constellation.

### Connections

- Requires or requests a root node.
- Shows typed and directed relationships correctly.
- Supports 1-hop and bounded 2-hop exploration.
- Uses a stable deterministic layout.
- Provides a text list of current relationships.
- Supports returning to the selected node in Landscape.

### Taxonomy

- Displays all domains in configured order.
- Avoids confusing duplicate canonical entries for bridge fields.
- Has a dedicated cross-cutting constellation section.
- Displays `why_not_ordinary_child` for each constellation.
- Remains fully usable without SVG or pointer interaction.

### Details

- Displays summaries, topics, domain membership, venues, and books from JSON.
- Separates journals from conferences.
- Displays book level and coverage note where present.
- Omits empty sections.
- Groups related fields by relation type and direction.
- Provides a shareable URL.

### Responsive and accessibility

- Desktop, tablet, and mobile layouts are intentional.
- Keyboard users can search, select, inspect, and change views.
- Screen-reader users can access all content through Taxonomy and detail lists.
- Motion is reduced when requested.
- Category meaning is not color-only.

### Data integrity

- Production build fails on invalid JSON.
- All references are checked.
- No display content is manually duplicated from the JSON.
- Unsupported schema versions produce a clear error.

---

## 27. Risks and mitigations

### Risk: Coordinates create misleading precision

Mitigation:

- use soft axes and broad verbal descriptions;
- show editorial confidence;
- include the metadata disclaimer;
- avoid ranks or numeric scores in the default interface.

### Risk: Too many bridge fields make segmented rings visually busy

The current dataset has many bridge fields.

Mitigation:

- limit visible ring segments to primary plus up to three secondary domains;
- if a field ever has more than four domains, show three segments plus a neutral “additional domains” segment;
- always list complete membership in the panel.

### Risk: Region ellipses overlap excessively

Mitigation:

- keep opacity low;
- test region labels independently of centers;
- allow region geometry to be revised in JSON;
- do not use region boundaries as clickable containment areas.

### Risk: Label collision becomes unstable

Mitigation:

- deterministic candidate ordering;
- priority-based suppression;
- recalculate only at stable interaction points;
- include screenshot regression tests.

### Risk: Connections layout jumps

Mitigation:

- seeded layout;
- cached settled coordinates;
- preserve old positions for nodes that remain in the new neighborhood;
- animate only changed nodes.

### Risk: Relation directions confuse users

Mitigation:

- readable sentence in details and relation popover;
- arrow markers;
- incoming and outgoing groups;
- never reverse source and target for grammar convenience.

### Risk: Editorial data becomes stale

Mitigation:

- `last_reviewed` field in a future schema;
- recurring content review;
- validate external links if added;
- label venues and books “representative,” not “best.”

### Risk: Space decoration reduces readability again

Mitigation:

- static low-opacity background only;
- no permanent glows;
- contrast checks with all region overlaps;
- information layers always render above decoration.

---

## 28. Future enhancements after version 1

Potential later additions:

- compare two fields side by side;
- educational paths such as “from algorithms to learning theory”;
- prerequisites and suggested courses;
- citations and official field links;
- time/history layer showing when fields emerged;
- user-selectable alternative coordinate models;
- editorial mode for dragging coordinates and exporting JSON patches;
- related-specialty expansion beneath a field;
- printable posters or exportable static maps;
- multilingual content;
- light theme;
- data provenance and reviewer notes;
- shareable filtered views;
- guided tours for theory, systems, AI, and interdisciplinary computing.

These should not delay a coherent version 1.

---

## 29. Definition of Done

The project is complete for version 1 when:

- the supplied JSON is the sole content source and validates at build time;
- Landscape, Connections, and Taxonomy are all implemented;
- the conceptual axes are visible and understandable;
- domain regions replace giant category stars;
- ordinary fields, bridge fields, and constellations have distinct visual grammars;
- constellations are hidden/revealed according to their JSON behavior;
- every field and constellation has a functional detail panel;
- journals, conferences, books, topics, summaries, and constellation explanations render correctly;
- search works across names, aliases, topics, books, and venues;
- edges appear on demand and correctly express relation type and direction;
- URLs restore view and selected node;
- desktop, tablet, and mobile layouts are usable;
- keyboard, screen-reader, reduced-motion, and contrast requirements pass;
- data, unit, component, E2E, visual, and accessibility tests pass in CI;
- a production static build deploys successfully;
- no critical content is clipped, obscured by a legend, or hidden behind decoration;
- the result feels like an interactive academic atlas with an astronomical visual language, rather than a network graph placed over a galaxy wallpaper.
