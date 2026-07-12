# Project Plan — The Universe of Computer Science

A single-page interactive map (`index.html`) that renders `data.json` as a night sky:
every research area is a star, every big category is a sun with its own constellation,
and every connection is a line of light between them. The first impression must be
*"wow — computer science is a universe"*, and the second impression must be that the
map is precise: positions, colors, and links come straight from the data.

---

## 1. Vision & mood

- **Metaphor:** deep space. A near-black indigo sky, a faint starfield, soft nebula
  washes behind each category's region, glowing dots for areas.
- **Emotional target:** vastness first (the map fills the viewport, edges fade into
  darkness), then intimacy on hover (one star brightens, its constellation lights up,
  and a panel tells its story).
- **Restraint is the style.** The data is the only loud thing on the page. Chrome
  (axes, legend, labels) stays recessive: hairlines, muted grays, generous padding.
  No heavy borders, no decoration that isn't data.

## 2. Data contract (from `data.json` — follow exactly)

- `areas[]` — 36 entries: 30 areas (`is_big_category: false`) and 6 big categories
  (`is_big_category: true`, ids 31–36).
- **Position:** `rating_abstract_to_concrete` → **x** (0 = abstract, left; 10 =
  concrete, right), `rating_machine_to_human` → **y** (0 = machine, **bottom**; 10 =
  human, **top** — invert the SVG y so "human" rises). Both ratings span 0–10.
- **Color:** `color_hex` is the category family color (7 distinct hues). Color
  follows the entity — it never changes on filter, hover, or dim; only opacity and
  glow change.
- **Hover content:** `name`, `introduction`, `top_journals`, `introductory_book`.
- `connections[]` — 45 links by id. Two kinds, styled differently:
  - **Membership links** (source is a big category, ids 31–36): the category's
    "spokes" to its children. Faint, in the category hue at low opacity — structure,
    not story.
  - **Cross-area links** (both endpoints are areas): the interesting bridges
    (e.g. Cryptography ↔ Cybersecurity). Slightly brighter, so the eye reads the
    web between fields.
- The dataset is loaded with `fetch('data.json')` — no data is duplicated into the
  HTML. (Consequence: the page needs an HTTP server; see §9.)

## 3. Visual design

### Surface & atmosphere
- Sky: near-black indigo (target `#0a0e1a`, radial-gradient slightly lighter at
  center so the map region feels lit).
- Starfield: ~200 tiny background stars (1px, low-opacity white) drawn once on a
  `<canvas>` or as SVG circles behind the plot — random but seeded so it's stable.
  A very slow, subtle twinkle on a handful of them; **disabled under
  `prefers-reduced-motion`**.
- Nebulae: one very soft radial-gradient wash per big category, centered on the
  category's position, in its hue at ~4–6% opacity, large blur radius. This visually
  groups each constellation without drawing a border.

### Marks
- **Area dot:** filled circle, r ≈ 5–6px (≥ 8px diameter per mark spec), in
  `color_hex`, with a 2px surface-color ring so overlapping dots stay legible, plus
  a soft outer glow (SVG `feGaussianBlur` halo in the same hue, low opacity).
- **Big category:** a clearly different mark — a larger core (r ≈ 11–13px) with a
  4-point star/diaphragm flare (two crossed, tapered lines through the core, like a
  lens flare on a bright star) and a wider halo. Reads instantly as "a sun, not a
  planet".
- **Connections:** 1.5–2px lines with round caps. Membership spokes at ~15–20%
  opacity in the category hue; cross-area links at ~35% in a neutral starlight
  color. Lines render *under* dots.
- **Labels:** every star gets its name — this is a map, names are the point.
  - Area labels: small (11–12px), **muted text token** (gray, never the series
    color), positioned by a simple collision pass (try below, then above, then
    right); at narrow viewports drop to "hover only" rather than overlapping.
  - Category labels: slightly larger, letterspaced small-caps, still a text token.
    A colored mark beside text carries identity — text itself never wears the hue.

### Palette — validate, don't eyeball
The 7 category hues from `data.json`: `#9b59b6 #d35400 #2ecc71 #e84393 #00cec9
#ff7675 #f1c40f`. Before shipping, run the dataviz palette validator **in-browser**
(no Node.js on this machine): temporarily add the validator as a
`<script type="module">` with `data-palette` on `<body>`, mode dark, surface
`#0a0e1a`, and read the `console.table` report.
- If a hue fails contrast or adjacent-pair CVD separation on the dark surface,
  **snap lightness only** (keep the hue family so it still matches `data.json`'s
  intent) and use the adjusted value consistently for dot, glow, nebula, and legend.
- The 2px surface ring on every dot is the secondary separation channel where dots
  from different families sit close together.

### Typography
- One sans throughout (system stack: `Inter, -apple-system, Segoe UI, Roboto,
  sans-serif` — no CDN dependency, works offline).
- Page title as a quiet hero: "The Universe of Computer Science", large but thin
  weight, letterspaced, with a one-line subtitle explaining the two axes. Title sits
  in a corner overlay, not a banner — the sky owns the viewport.
- All text in three ink tokens (primary ~`#e8ecf4`, secondary ~`#9aa4b8`, muted
  ~`#5c6575` → pick exact values at build time and check contrast on the sky).

### Axes — as geography, not chart chrome
The two ratings are the map's coordinates, so present them as compass directions,
not a gridded scatterplot:
- Edge captions in muted small-caps: left "ABSTRACT", right "CONCRETE",
  bottom "MACHINE", top "HUMAN", each with a subtle arrow glyph.
- No gridlines, no ticks, no axis rules — the empty sky is the grid. (A faint
  center crosshair is allowed only if it reads as atmosphere; default to none.)

## 4. Layout

- Full-viewport map (`100vh`), plot area inset ~8–10% on each side so no star or
  label touches the edge.
- Overlays (all absolutely positioned over the sky):
  - top-left: title + subtitle;
  - bottom-left: **legend** — the 6 big categories, colored dot + name, always
    visible (≥ 2 series ⇒ legend is mandatory); legend rows are also hover targets
    that light up their whole constellation;
  - right side: the **info panel** (see §5), hidden until first hover, then docked.
- Responsive: the map is a scaled SVG `viewBox`, so it works at any size. Below
  ~700px width: hide per-area labels (keep category labels), move the info panel to
  a bottom sheet, and make dots' hit areas finger-sized.

## 5. Interaction

- **Hover / focus on an area (or category):**
  1. The star brightens (glow intensifies, slight radius ease — ~150ms).
  2. Its direct connections light up to full opacity; connected stars brighten.
  3. Everything else dims to ~25% opacity (the constellation pops out of the sky).
  4. The **docked info panel** fills in: name (with its category dot), the
     `introduction` paragraph, "Top venues" (`top_journals`), and "Start here"
     (`introductory_book`). A docked panel, not a cursor tooltip — the content is
     multi-line prose and must not jitter under the pointer.
- **Hit targets:** never the painted dot alone. Each star gets a transparent hit
  circle ≥ 24px; since the sky is sparse, a nearest-point layer (pointer within
  ~40px snaps to the closest star) makes the whole sky feel responsive.
- **Keyboard parity:** every star is focusable (`tabindex`, sensible order:
  categories first, then areas by id); focus triggers exactly the hover state;
  `Esc` clears. Panel content is in a `aria-live="polite"` region.
- **Tooltips enhance, never gate:** a collapsible **"View as list"** table below
  the map (or behind a toggle) lists every area — name, category, both ratings,
  journals, book — so all content is reachable without a pointer. This is also the
  screen-reader path.
- **Text is untrusted data:** all strings from `data.json` enter the DOM via
  `textContent`, never `innerHTML` concatenation.
- **Entrance:** on load, stars fade/scale in with a tiny stagger (~600ms total),
  connections draw in after. Once. Skipped entirely under `prefers-reduced-motion`.

## 6. Accessibility checklist

- Legend always present; identity = colored mark beside a text label, never color
  alone (the shape difference area-vs-category is a second channel).
- Full keyboard operability with visible focus ring (surface-color ring + white).
- Table view as the WCAG-clean twin of the map.
- `prefers-reduced-motion` kills twinkle, entrance stagger, and hover easing.
- Ink tokens checked for contrast against the sky; data hues validated (§3).

## 7. Architecture (single file, no build step)

Everything in `index.html` — one `<style>`, one `<script>`, vanilla JS + SVG.
No frameworks, no CDN. Internal structure of the script:

1. `fetch('data.json')` → parse → index areas by id; classify connections.
2. Scales: rating → viewBox coordinates (x direct, y inverted), with inset padding.
3. Render order (SVG groups): starfield → nebulae → membership links →
   cross-area links → area dots → category marks → labels → hit layer.
4. State machine: `null | hoveredId` — one function applies/removes the
   highlight classes; CSS transitions do the animation.
5. Overlay DOM (title, legend, panel, table) is plain HTML outside the SVG.

## 8. Build order

1. Skeleton: sky, fetch + parse, scales, plain dots at correct positions. Verify
   every area lands where its ratings say.
2. Connections (two styles), category marks, labels + collision pass.
3. Atmosphere: starfield, nebulae, glow filters, typography, edge captions.
4. Interaction: hit layer, hover/focus state, dimming, info panel, legend hover.
5. Table view, keyboard pass, reduced-motion pass.
6. Palette validation in-browser (§3); adjust hues if any check fails.
7. Polish pass against the anti-pattern list, then **render and look**: open in a
   real browser at 1440px, 1024px, and a phone width; screenshot; check label
   collisions, glow overdraw, and that the "wow" is actually there.

## 9. How to run & verify

- Serve locally (fetch won't work from `file://`):
  `python3 -m http.server 8000` → `http://localhost:8000`.
- Verification: all 36 marks present; 45 lines present; hover on "Cryptography"
  highlights Algorithms & Data Structures and Cybersecurity & Digital Forensics and
  shows Journal of Cryptology in the panel; tab through stars with the keyboard;
  toggle the list view; check `prefers-reduced-motion` via devtools emulation.

## 10. Explicit non-goals

- No pan/zoom in v1 (the whole universe fits one viewport; zoom adds complexity
  without adding wonder at this node count).
- No physics/force layout — positions are the ratings, exactly as the data says.
- No external libraries, fonts, or network calls beyond `data.json`.
