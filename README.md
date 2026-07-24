# The Universe of Computer Science

An interactive academic atlas of computer science — domains, research fields, cross-cutting
constellations, and the relationships between them — built as a static React + TypeScript app.
See `docs/PROJECT_PLAN.md` for the full design/implementation plan.

## Running locally

Requires [Node.js](https://nodejs.org/) (v20+).

```bash
npm install
npm run dev
```

Then open the URL it prints (defaults to `http://localhost:5173`).

## Other scripts

```bash
npm run build          # validate data, type-check, and produce a static build in dist/
npm run preview        # serve the production build locally
npm run validate:data  # check public/data/computer_science_universe_v2.json against the schema
npm run lint           # oxlint
```

`npm run build` outputs a fully static site in `dist/` — once built, no Node.js is required to
host it; any static file server works.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the site and publishes
`dist/` to GitHub Pages at `https://<owner>.github.io/cs-map/`. This requires the repo's
**Settings → Pages → Source** to be set to "GitHub Actions" once (see the workflow file for
details). You can also trigger a deploy manually from the Actions tab (`workflow_dispatch`).

## Data

The map's entire content — domains, fields, constellations, and relations — lives in
`public/data/computer_science_universe_v2.json`, loaded and validated at runtime with Zod. Edit
the JSON, run `npm run validate:data`, and reload to see changes; no component code needs to
change for ordinary content edits.
