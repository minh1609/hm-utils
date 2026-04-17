# hm-utils

Personal utilities — currently featuring a **Random Topic** picker that reads top-level tabs from Google Docs files in a designated Google Drive folder.

## Features

- **Random Topic** — sign in with Google, click a button, get a random tab from your Drive docs as a clickable MUI chip.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Google Cloud project

You need a Google Cloud project with the Drive and Docs APIs enabled, and an OAuth 2.0 Client ID.

#### a. Enable APIs

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services → Library**
3. Enable **Google Drive API**
4. Enable **Google Docs API**

#### b. Create an OAuth 2.0 Client ID

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Under **Authorized JavaScript origins**, add your dev URL:
   - `http://localhost:5173` (Vite default)
   - Add your production domain when deploying
4. Copy the generated **Client ID**

#### c. OAuth consent screen

If your app is in *Testing* mode, add your Google account as a **test user**:

1. Go to **APIs & Services → OAuth consent screen**
2. Scroll to **Test users → Add users**
3. Add your personal Google email

### 3. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from step 2b |
| `VITE_GOOGLE_FOLDER_ID` | Google Drive folder ID — the long alphanumeric string in the folder's URL: `https://drive.google.com/drive/folders/<FOLDER_ID>` |

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Authentication flow

The app uses **Google OAuth2 in the browser** (no server required). On first use, click **Sign in with Google** — a popup opens, you approve the Drive/Docs read-only scopes, and the app fetches your tabs. The access token is stored in `localStorage` and reused until it expires (~1 hour), so you won't be asked to sign in on every visit.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run test:google` | Node.js smoke-test for the Google Drive/Docs utilities (requires `service-account.json`) |

---

## Stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Build | Vite 8 |
| Language | TypeScript ~6 |
| UI components | MUI (`@mui/material`) |
| Google auth | `@react-oauth/google` |

---

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
