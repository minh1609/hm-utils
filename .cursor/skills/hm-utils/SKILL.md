---
name: hm-utils-project
description: >-
  Domain knowledge and conventions for the hm-utils project — a Vite + React 19
  + TypeScript SPA with React Compiler and ESLint flat config. Use when working
  on hm-utils, asking about its stack, file structure, conventions, or build setup.
---
## What is this app?
The app in exploring mode, do not focus in building the UI for now, I want to explore GoogleDrive and Google Doc API
---

## Tech Stack

| Layer | Library / Version |
|-------|-------------------|
| UI framework | React 19 (^19.2.4) |
| Build | Vite 8 |
| Language | TypeScript ~6 |
| React Compiler | Enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` |
| Linting | ESLint 9 (flat config) + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |
| Styling | Plain CSS with custom properties and nesting; no CSS-in-JS |

---

## Project Layout

```
hm-utils/
  index.html            Vite entry; title "hm-utils"; loads /src/main.tsx
  vite.config.ts        react() plugin + babel reactCompilerPreset
  tsconfig.json         Solution references → tsconfig.app.json + tsconfig.node.json
  tsconfig.app.json     Strict, bundler-mode, includes src/; allowImportingTsExtensions
  tsconfig.node.json    Tooling TS config for vite.config.ts
  eslint.config.js      Flat config; ignores dist; browser globals
  src/
    main.tsx            createRoot + StrictMode + App
    App.tsx             Root component (hero UI, counter state)
    index.css           CSS variables (light/dark via prefers-color-scheme), #root layout
    App.css             Component styles: counter, hero, .ticks
    assets/
      react.svg
      vite.svg
  public/
    favicon.svg
    icons.svg           SVG sprite (reference as /icons.svg#icon-name)
```
