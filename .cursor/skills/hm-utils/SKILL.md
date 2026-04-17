---
name: hm-utils-project
description: >-
  Domain knowledge and conventions for the hm-utils project — a Vite + React 19
  + TypeScript SPA with React Compiler and ESLint flat config. Use when working
  on hm-utils, asking about its stack, file structure, conventions, or build setup.
---
## What is this app?
The app contain several utilities for personal use, include
- Get a random topic (a tab in highest level of google doc file) from my personal google drive folder
---

## Tech Stack

| Layer | Library / Version |
|-------|-------------------|
| UI framework | React 19 (^19.2.4) |
| Build | Vite 8 |
| Language | TypeScript ~6 |
| React Compiler | Enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` |
| Linting | ESLint 9 (flat config) + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |
| Styling | MUI (`@mui/material`) with Emotion (`@emotion/react`, `@emotion/styled`); prefer raw MUI styling — `sx` prop, `styled()` API, and theme tokens |

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
    main.tsx            createRoot + StrictMode + ThemeProvider (MUI) + CssBaseline + App
    App.tsx             Root component; renders RandomTopicWidget
    index.css           CSS variables (light/dark via prefers-color-scheme), #root layout
    components/
      RandomTopicWidget.tsx
  public/
    favicon.svg
    icons.svg           SVG sprite (reference as /icons.svg#icon-name)
```
