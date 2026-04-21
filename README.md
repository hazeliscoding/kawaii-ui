# @hazeliscoding/kawaii-ui

> A kawaii / Y2K web component library. Gel buttons, pastel gradients, glossy surfaces — built on [Lit](https://lit.dev), works **everywhere**.

[![npm version](https://img.shields.io/npm/v/@hazeliscoding/kawaii-ui.svg)](https://www.npmjs.com/package/@hazeliscoding/kawaii-ui)
[![license](https://img.shields.io/npm/l/@hazeliscoding/kawaii-ui.svg)](./LICENSE)

Because every component is a standards-based **Web Component**, you can drop `<bloom-button>` into:

- Plain HTML / vanilla JS
- Angular
- React, Vue, Svelte, Solid
- HTMX / Hotwire / Alpine
- Any static site generator or server-rendered page

## Install

```bash
npm install @hazeliscoding/kawaii-ui
```

Or load from a CDN with no build step:

```html
<script type="module" src="https://unpkg.com/@hazeliscoding/kawaii-ui"></script>
```

## Quickstart

### Vanilla HTML

```html
<!doctype html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@hazeliscoding/kawaii-ui/dist/styles/tokens.css"
    />
    <script type="module" src="https://unpkg.com/@hazeliscoding/kawaii-ui"></script>
  </head>
  <body>
    <bloom-button variant="primary">Click me</bloom-button>

    <script>
      document.querySelector('bloom-button').addEventListener('bloom-click', (e) => {
        console.log('clicked', e.detail.originalEvent);
      });
    </script>
  </body>
</html>
```

### Angular

1. Import the component bundle and tokens once (e.g. `main.ts`):

```ts
import '@hazeliscoding/kawaii-ui';
import '@hazeliscoding/kawaii-ui/styles/tokens.css';
```

2. Tell Angular it's fine to see unknown elements by adding `CUSTOM_ELEMENTS_SCHEMA` to your standalone components (or root module):

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <bloom-button variant="primary" (bloom-click)="onClick($event)"> Click me </bloom-button>
  `,
})
export class MyComponent {
  onClick(e: CustomEvent<{ originalEvent: MouseEvent }>) {
    console.log(e.detail.originalEvent);
  }
}
```

> Because attribute bindings are strings, use `variant="primary"` literally. For dynamic values, use `[attr.variant]="someSignal()"`.

### HTMX

No extra setup — just include the script and tokens, and custom elements auto-upgrade whenever HTMX swaps HTML into the DOM.

```html
<link rel="stylesheet" href="https://unpkg.com/@hazeliscoding/kawaii-ui/dist/styles/tokens.css" />
<script type="module" src="https://unpkg.com/@hazeliscoding/kawaii-ui"></script>
<script src="https://unpkg.com/htmx.org"></script>

<bloom-button variant="primary" hx-get="/fragment" hx-target="#out"> Load more </bloom-button>
<div id="out"></div>
```

### React

```tsx
import '@hazeliscoding/kawaii-ui';
import '@hazeliscoding/kawaii-ui/styles/tokens.css';

export function App() {
  return (
    <bloom-button variant="primary" onClick={(e) => console.log('clicked', e)}>
      Click me
    </bloom-button>
  );
}
```

## Components

| Tag                  | Status                       |
| -------------------- | ---------------------------- |
| `bloom-button`       | ✅ Phase 0                   |
| `bloom-badge`        | ✅ Phase 2                   |
| `bloom-avatar`       | ✅ Phase 2                   |
| `bloom-avatar-stack` | ✅ Phase 2                   |
| `bloom-card`         | ✅ Phase 2                   |
| `bloom-input`        | ✅ Phase 2 (form-associated) |
| `bloom-theme-toggle` | ✅ Phase 2                   |
| `bloom-modal`        | ✅ Phase 3                   |
| `bloom-compat-ring`  | ✅ Phase 3                   |

## Theming

All components read from CSS custom properties defined in `tokens.css`. Override any token at any scope:

```css
:root {
  --bloom-primary: #ff4081; /* stronger pink */
}

.my-section {
  --bloom-radius-xl: 0.5rem; /* squarer buttons in this scope */
}
```

**Dark mode:** add `data-theme="dark"` to any ancestor (typically `<html>`):

```html
<html data-theme="dark">
  ...
</html>
```

## Optional stylesheets

```ts
import '@hazeliscoding/kawaii-ui/styles/tokens.css'; // required — palette + spacing + type scale
import '@hazeliscoding/kawaii-ui/styles/base.css'; // modern reset + element defaults
import '@hazeliscoding/kawaii-ui/styles/animations.css'; // bloom-animate-* utility classes
import '@hazeliscoding/kawaii-ui/styles/utilities.css'; // bloom-flex, bloom-gap-*, bloom-text-*, etc.

// Or load them all in one shot:
import '@hazeliscoding/kawaii-ui/styles/all.css';
```

## Local development

```bash
git clone https://github.com/hazeliscoding/kawaii-ui
cd kawaii-ui
npm install

npm run dev          # component showcase at http://localhost:4321
npm test             # Vitest (jsdom)
npm run build        # produces dist/ with JS, CSS, .d.ts, and custom-elements.json
npm run lint
npm run format
```

## License

MIT © [hazeliscoding](https://github.com/hazeliscoding)
