# Plan — Loosen the Sky (Scrollable Map) + Gentle Node Drift

Two changes to `index.html` (no changes to `data.json`, no new files, still no
frameworks or build step):

1. **Loosen the layout.** The 36 nodes are too dense in one viewport. Spread them
   out by making the sky *bigger than the screen* and letting the user scroll in
   both directions. All overlays and interactions must keep working smoothly.
2. **Idle drift.** Each star sways slowly within a small radius of its dedicated
   point — like the graph nodes on csacademy.com — with its links following it.

This supersedes §10 of `project-plan.md` ("no pan/zoom") for scrolling only:
we add native *scrolling*, not zoom. Positions still come straight from the
ratings — no force layout deciding where things live; drift is cosmetic wobble
around the true anchor.

---

## 1. Loosen the layout — a scrollable sky

### Approach: grow the world, not shrink the dots

Keep the rating → coordinate mapping exactly as is, but scale the coordinate
space up so the same relative positions occupy far more pixels.

- Raise the viewBox from `1200 × 840` to about `2600 × 1950` (~2.2× linear).
  Tune the exact numbers once rendered; the goal is that the densest cluster
  (the theory constellation around x≈0.5–1.5) has clear water between stars
  and labels no longer need the widening-ring collision escalation to 4.8×.
- Recompute margins proportionally (`MX`, `MY_TOP`, `MY_BOTTOM`). The oversized
  bottom margin that dodges the legend can shrink back toward symmetric, because
  the legend becomes a fixed overlay over a scrollable sky (see below) and the
  user can simply scroll content out from under it.
- Mark sizes, label font sizes, link widths, halos, starfield density, and
  nebula radii **stay at their current pixel values** — the point is more empty
  space between same-sized stars, not a magnified copy of the same crowding.
  Starfield star *count* scales with area (≈ 220 × areaRatio) so the sky doesn't
  look thinner; keep the seeded PRNG so it stays deterministic.

### Scroll container

- `.stage` keeps `position:relative` but becomes the scroll container:
  `overflow:auto`, still `height:100vh`.
- The SVG gets an explicit pixel size equal to the viewBox (`width:2600px;
  height:1950px`) instead of `100%/100%`. Native scrolling in both axes falls
  out for free; momentum/touch/keyboard scrolling all behave natively — this is
  the "moves nicely" requirement with zero custom scroll code.
- On load, scroll to center the map (`stage.scrollLeft/scrollTop` set from the
  size difference) so the first impression is the middle of the universe, not
  the top-left corner. Do this before the entrance animation is visible (it
  already has a delay budget) so there's no visible jump.
- Optional nicety, cheap to add: grab-to-pan (pointerdown on empty sky + drag
  adjusts `scrollLeft/scrollTop`, threshold ~5px so it doesn't eat clicks on
  stars). If it complicates the click-to-lock logic, drop it — scrollbars,
  wheel, and touch are sufficient.

### Overlays must not scroll away

All four overlays (`.hero-title`, `.listbtn`, `.legend`, `.panel`) are
absolutely positioned children of `.stage`; once `.stage` scrolls they would
drift off with the content. Fix by making them viewport-pinned:

- Simplest robust option: move the overlays *out* of `.stage` into a sibling
  `position:fixed` layer (or make each `position:fixed` directly). They keep
  their current corner coordinates. Keep `pointer-events:none` on containers /
  `auto` on interactive children exactly as today.
- The panel's slide-in/out transition is unaffected by this change.
- Note: the map section sits above the table section on one page, so `fixed`
  overlays must hide when the user scrolls down to the table. Cheapest fix: an
  `IntersectionObserver` on `.stage` toggles a class that fades overlays out
  when the stage is mostly out of view. (The `.stage` itself still scrolls
  internally; page scroll only happens between map and table.)

### Coordinate math and interaction updates

- `svgPoint()` currently compensates for "meet" letterboxing. With the SVG at
  its natural viewBox size there is no letterboxing: the function reduces to
  `(clientX - rect.left) / (rect.width / vb.width)`. `getBoundingClientRect()`
  already accounts for scroll position, so nearest-node snapping keeps working
  while scrolled — verify this specific path once in the browser.
- `SNAP` radius (46 viewBox units) can stay; with looser spacing it will feel
  *more* accurate, not less.
- Keyboard focus (`tab` between stars) must scroll the star into view:
  add a `focusin` handler calling `scrollIntoView({block:'center',
  inline:'center'})` on the node (respect `prefers-reduced-motion` for the
  `behavior`).
- Label planner: keep the algorithm, but with ~4.8× the area the multipliers
  `[1, 1.8, 2.6, 3.6, 4.8]` should rarely go past the first ring. Don't rewrite
  it; just confirm no forced overlaps remain at the new scale.
- Axis captions: with the map bigger than the viewport, corner captions may sit
  off-screen initially. Either accept that (they're discovered by scrolling —
  fits the "explore a universe" metaphor) or repeat the caption pair at the
  center edges. Default: accept it; the hero subtitle already explains the axes.

### Mobile

- The `@media (max-width:700px)` aspect-ratio hack (`height:auto;
  aspect-ratio:1200/840`) exists to defeat letterboxing; with a scrollable
  fixed-size SVG there is no letterboxing, so **delete that rule** and let
  mobile scroll the same oversized sky (stage stays `100vh`, now `100dvh`).
  Two-finger / one-finger panning is native. Keep the label-hiding and
  bottom-sheet panel rules.

---

## 2. Idle drift — stars sway around their anchors

### Motion model

- Each node `i` gets a deterministic drift offset from seeded randoms
  (reuse `mulberry32`, one seeded stream, params drawn per node at build time):

  ```
  dx(t) = A * sin(w1*t + p1) + (A/2) * sin(w3*t + p3)
  dy(t) = A * sin(w2*t + p2) + (A/2) * sin(w4*t + p4)
  ```

  with amplitude `A ≈ 5–8` viewBox px (categories slightly less, ~4, so the
  "suns" feel heavier), angular speeds `w ≈ 0.1–0.35 rad/s` (periods of
  ~20–60s — slow, ambient, never distracting), random phases. Two summed sines
  per axis gives organic non-circular wander like csacademy, without running an
  actual physics sim. Max drift stays well under the snap radius and typical
  label offsets, so nothing needs re-planning per frame.

### What updates per frame

One `requestAnimationFrame` loop:

- **Node position:** set the *outer* `.node` group's `transform` attribute to
  `translate(x0+dx, y0+dy)`. Never touch `.node-inner` — the entrance-animation
  comment in the CSS explains why CSS transforms on the outer group are
  forbidden; the attribute update composes fine with the inner CSS animation.
- **Link endpoints:** links must follow their stars (this is the visible magic
  of the csacademy effect). At build time, store for each `<line>` its two node
  references; each frame set `x1/y1/x2/y2` from the nodes' current
  (anchor + drift) positions. 45 lines × 4 attrs per frame is trivial.
- **Not updated:** nebulae, starfield, labels-relative-to-node (labels are
  children of the node group so they ride along automatically), and the
  `pts` array used for pointer snapping — snapping against static anchors is
  imperceptibly different at ≤8px drift and keeps hover selection stable
  (a star can't wander out from under a hovering cursor).

### Performance & lifecycle

- Cache per node: the `<g>` element, anchor x/y, and the 8 drift params in a
  plain array; per frame do arithmetic + `setAttribute` only. No DOM reads in
  the loop. 36 nodes + 45 lines is far below any frame budget.
- Drive time from the rAF timestamp (seconds), not frame counts, so speed is
  refresh-rate independent.
- Start the loop only after the entrance animation completes (~1.2s), fading
  drift amplitude in over ~2s (`min(1, (t-t0)/2)` multiplier) so stars don't
  pop sideways.
- **`prefers-reduced-motion: reduce` ⇒ no drift loop at all** (don't start it;
  also react to live changes of the media query by stopping/starting).
- `document.visibilitychange`: rAF auto-pauses in background tabs; on resume,
  re-base the time so stars don't teleport (they won't — the functions are
  absolute in `t`, which is actually the desirable property: no re-base needed,
  positions are pure functions of time. Just confirm no first-frame jump).
- While a node is `.lit` (hovered/locked), keep drifting — freezing on hover
  causes a visible stutter, and the panel content doesn't move anyway. The
  focus ring and halo are children of the group, so they drift together.

---

## 3. Order of work

1. ViewBox/margin scale-up + fixed-size SVG + scrollable stage + centered
   initial scroll.
2. Overlay re-parenting to fixed layer + hide-on-table-scroll observer.
3. `svgPoint()` simplification; focus `scrollIntoView`; delete mobile
   aspect-ratio rule.
4. Starfield count scaling; re-check label planner output at new scale.
5. Drift: params at build time, rAF loop for nodes + link endpoints,
   reduced-motion + start-fade gates.
6. One quick visual check (see §4), then done.

## 4. Verification — deliberately light

**Do not do heavy smoke testing. Repeated screenshot-and-stare or
click-everything smoke passes are inefficient for machines to perform — most
of this change is verifiable by reading the code (pure coordinate math,
deterministic seeded params).** Verify by reasoning through the math at review
time, plus exactly one lightweight browser pass:

- Serve (`python3 -m http.server`), open once, and check only the four things
  that genuinely need eyes:
  1. Map centers on load and scrolls smoothly in both axes; overlays stay
     pinned and hide when scrolled down to the table.
  2. Hover-snapping still selects the right star while the stage is scrolled
     (the one real risk in the coordinate change).
  3. Stars visibly drift and their links follow with no detachment.
  4. Devtools reduced-motion emulation: no drift, no entrance animation.
- Skip: multi-viewport screenshot matrices, per-node hover sweeps, repeated
  reload cycles. If those four pass, the rest follows from the code.
