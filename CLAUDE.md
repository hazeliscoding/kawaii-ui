# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite demo server at http://localhost:4321 (loads src/ directly, no build)
npm run build        # tsc --noEmit → vite lib build → tsc -p tsconfig.build.json (d.ts) → cem analyze
npm run build:manifest  # Regenerate dist/custom-elements.json only
npm run demo:build   # Build the demo site to docs/ (GitHub Pages output)
npm test             # Vitest (jsdom) — single run
npm run test:watch
npm run lint         # eslint 'src/**/*.ts'
npm run typecheck    # tsc --noEmit
npm run format       # prettier write over src/**/*.{ts,css} and root *.{json,md}
```

Run a single test file: `npx vitest run src/components/button/bloom-button.test.ts`
Run a single test by name: `npx vitest run -t "dispatches bloom-click"`

## Architecture

This is a **Lit-based Web Component library** published as `@hazeliscoding/kawaii-ui`. Components are framework-agnostic custom elements (prefix `bloom-`) intended to work in vanilla HTML, Angular, React, HTMX, etc.

### Dual Vite build modes (`vite.config.ts`)

One config serves two purposes based on `--mode`:

- **Library mode** (default): builds `src/index.ts` + a per-component entry (`src/components/<name>/index.ts`) into `dist/` as ES modules. `preserveModules: true` keeps the source tree shape in `dist/` so `package.json` subpath exports (`./button`, `./modal`, …) resolve cleanly. Lit is marked **external** — bundles import the bare specifier `"lit"`, so CDN users need an import map (esm.sh handles this automatically; unpkg does not — see README).
- **Demo mode** (`--mode demo` or `DEMO=1`): root becomes `demo/`, builds to `docs/` for GitHub Pages.

A custom `kawaii-ui:copy-styles` plugin copies `src/styles/*.css` into `dist/styles/` and writes a concatenated `dist/styles/all.css` at `closeBundle`.

### Component structure

Each component lives in `src/components/<name>/` as a quartet:
- `bloom-<name>.ts` — the `LitElement` class, decorated with `@customElement('bloom-<name>')`
- `bloom-<name>.css` — imported with `?inline` and injected via `css\`${unsafeCSS(styles)}\``
- `bloom-<name>.test.ts` — Vitest + jsdom, manipulates real DOM via `document.body` (see below)
- `index.ts` — re-exports the class and public types

`src/index.ts` is the barrel that re-exports every component; importing it has the **side effect** of registering every custom element. `sideEffects` in `package.json` preserves these registrations through bundler tree-shaking.

**Important:** in the demo entry (`demo/main.ts`), components are imported from their `bloom-<name>.ts` source files directly (not via the barrel). This is intentional — Rollup otherwise tree-shakes the `@customElement` side effects out of the demo bundle. See commit `6f79d68`.

### Component conventions

- Tag name always `bloom-<thing>`; class name `Bloom<Thing>`.
- Properties use `@property({ reflect: true })` when they should be readable as HTML attributes (e.g. for CSS selector targeting). Boolean attributes use kebab-case via `attribute: 'full-width'`.
- Interactions emit `bloom-*` CustomEvents with `bubbles: true, composed: true` and a `detail` payload (see `bloom-button` → `bloom-click`). The original DOM event goes in `detail.originalEvent`.
- Form-participating components set `static formAssociated = true` and use `attachInternals()` to integrate with native `<form>` (submit/reset behavior). `bloom-button` and `bloom-input` do this.
- Augment `HTMLElementTagNameMap` and `HTMLElementEventMap` via `declare global` so TS consumers get typed `querySelector` and `addEventListener`.
- Expose styling hooks via CSS `part="..."` attributes and CSS custom properties (`--bloom-*`); never rely on deep shadow piercing.

### Design tokens

`src/styles/tokens.css` is the single source of truth for colors, spacing, radii, shadows. Every component reads CSS custom properties from it — never hard-code colors in a component CSS file. Dark mode is activated by `data-theme="dark"` on any ancestor. The four standalone stylesheets (`tokens.css`, `base.css`, `animations.css`, `utilities.css`) are independently importable; `dist/styles/all.css` is the concatenated bundle produced at build time.

### Testing

Vitest runs in jsdom with globals enabled. Tests mount elements by setting `container.innerHTML` and awaiting `el.updateComplete` before assertions. jsdom's form-associated custom element support is incomplete — tests that rely on `ElementInternals.form` should guard with `if (el.form !== form) return;` rather than fail (real-browser behavior is covered by the demo). See `bloom-button.test.ts:115` for the pattern.

### Package exports

`package.json` exposes both a root entry (registers everything) and per-component subpath exports so consumers can import just `@hazeliscoding/kawaii-ui/button`. When adding a new component, update **three** places: `src/index.ts` barrel, `vite.config.ts` `lib.entry`, and the `exports` map in `package.json`.
