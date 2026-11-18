# Frontend

React 18 single-page app (Create React App) with Three.js 3D viewers.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Dev server on http://localhost:3000; `/api` is proxied to the backend |
| `npm run build` | Production build into `build/` |
| `npm run models` | Regenerates the 3D model list (runs automatically before `start` and `build`) |
| `npm test` | Jest (Create React App) |

## Structure

```
src/
├── assets/images/        Project backgrounds, logos, profile images
├── components/           Shared UI (navigation, footer, 3D viewer, project logo, ...)
│   └── sections/         Page sections: hero, about, projects, portfolio hub, 3D models, ...
├── context/              RecommendationsContext: shared recommendations state
├── data/
│   ├── portfolio.js      All site content: nav, projects, hub cards, 3D model overrides
│   └── models.generated.json   Generated from public/models (don't edit by hand)
├── hooks/                useActiveSection, useScrollReveal
├── styles/               theme (tokens), layout, sections, portfolio, background-profile
└── setupProxy.js         Dev-server /api proxy
public/models/            3D models (.glb)
scripts/                  generate-model-manifest.js
```

## Common edits

- **Content** (projects, nav, hub cards): [`src/data/portfolio.js`](src/data/portfolio.js).
- **Add a 3D model:** drop a `.glb` into `public/models/` named `Name_Category.glb`, where the category is `Character`, `Props`, `Environment` or `Vehicle`, then restart. Rename it or isolate one object from a multi-object file with `modelOverrides` in `portfolio.js`.
- **Theme:** colour, surface and typography tokens live in [`src/styles/theme.css`](src/styles/theme.css).

## Environment

Copy `.env.example` to `.env.local`:

```env
REACT_APP_WEB3FORMS_ACCESS_KEY=your-web3forms-access-key
```

The key is embedded at build time and is public by design.

## Production image

[`Dockerfile`](Dockerfile) builds the app and serves it with Nginx ([`nginx.conf`](nginx.conf)). Nginx serves on port 8080, proxies `/api/` to the `backend` service, and adds gzip, caching and security headers.
