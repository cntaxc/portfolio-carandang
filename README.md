# Christian Carandang — Portfolio

A React single-page portfolio with a small Node.js backend for recommendations,
run with Docker Compose.

| Part | Folder | Stack | Dev URL |
|------|--------|-------|---------|
| Frontend | [`frontend/`](frontend) | React 18 (Create React App), Three.js | http://localhost:3000 |
| Backend | [`backend/`](backend) | Node.js 20, Express | http://localhost:8000 |

## Quick start

```powershell
# Development (hot reload)
.\start-dev.ps1                 # or: docker compose up -d --build

# Production (Nginx on :8080, backend internal)
.\start-prod.ps1                # or: docker compose -f docker-compose.prod.yml up -d --build
```

The first development start runs `npm install` inside the frontend container,
so allow a minute before http://localhost:3000 responds.

Development and production use separate Compose project names, so they can run
at the same time without affecting each other.

## Project structure

```
.
├── frontend/                 React app (own package.json, Dockerfile, nginx.conf)
│   ├── public/               index.html, resume PDF, 3D models (models/*.glb)
│   ├── src/
│   │   ├── assets/images/    projects/ (backgrounds), logos/, profile/
│   │   ├── components/       UI components and section components (sections/)
│   │   ├── context/          RecommendationsContext (shared recommendations state)
│   │   ├── data/portfolio.js All site content: nav, projects, hub, 3D models, ...
│   │   ├── hooks/            useActiveSection, useScrollReveal
│   │   ├── styles/           theme, layout, sections, portfolio, background-profile
│   │   └── setupProxy.js     Dev server: forwards /api to the backend
│   ├── Dockerfile            Production image: build, then serve with Nginx
│   └── nginx.conf            Serves the SPA and proxies /api/ to the backend
├── backend/                  Recommendation API (own package.json, Dockerfile)
│   ├── lib/                  recommendation-store.js, profanity-filter.js
│   ├── test/                 node:test suites
│   └── server.js             Entry point
├── docker-compose.yml        Development stack
├── docker-compose.prod.yml   Production stack
├── start-dev.ps1
└── start-prod.ps1
```

## Configuration

### Frontend — `frontend/.env.local`

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
REACT_APP_WEB3FORMS_ACCESS_KEY=your-web3forms-access-key
```

The Contact form posts directly from the browser to
[Web3Forms](https://web3forms.com/). Create the key for
`carandangchristianra@gmail.com`. Create React App reads the key when the app
starts or is built, so after changing it:

```powershell
docker compose restart frontend                                   # development
docker compose -f docker-compose.prod.yml up -d --build frontend  # production
```

### Backend

The backend needs no secrets. Docker Compose sets `PORT`, `NODE_ENV` and
`RECOMMENDATIONS_DATA_FILE`. See `backend/.env.example` for running it outside
Docker.

## Backend API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service status |
| `GET` | `/api/recommendations` | Published recommendations, newest first |
| `POST` | `/api/recommendations` | Validate, profanity-check and publish a recommendation |

- Recommendations publish immediately; there is no review step.
- Submissions containing profanity (English, Tagalog/Filipino, Spanish,
  including leetspeak) are rejected with `422` and never stored.
- Rate limit: 5 submissions per 15 minutes per IP.
- Data is stored in the `recommendation-data-dev` / `recommendation-data-prod`
  Docker volumes. `docker compose down -v` deletes it.

### Moderating recommendations

All recommendations live in one JSON file inside the backend container:
`/app/data/recommendations.json` (Docker volume
`docker-react-portfolio_recommendation-data-dev` in development,
`docker-react-portfolio-prod_recommendation-data-prod` in production; when
running the backend outside Docker: `backend/data/recommendations.json`).

```powershell
# List everything (shows each id)
docker compose exec backend npm run recommendations -- list

# Delete one or more by id
docker compose exec backend npm run recommendations -- delete <id>

# Delete everything
docker compose exec backend npm run recommendations -- clear --yes

# Production: add -f docker-compose.prod.yml, e.g.
docker compose -f docker-compose.prod.yml exec backend npm run recommendations -- list
```

You can also edit the file by hand (for example in Docker Desktop:
Containers, then `portfolio-backend-dev`, then Files, then `/app/data`). The
running backend notices the change and serves the new data on its next
request; open browser tabs update within a minute or on refresh. If an edit
leaves invalid JSON, the backend keeps serving the last good data and logs an
error until the file is fixed.

## Common commands

```powershell
# Logs
docker compose logs -f frontend backend

# Install a frontend dependency
docker compose exec frontend npm install some-package

# Backend tests (run on the host)
npm --prefix backend install
npm --prefix backend test

# Frontend production build check (run on the host)
npm --prefix frontend install
npm --prefix frontend run build
```

## Content

Most content lives in [`frontend/src/data/portfolio.js`](frontend/src/data/portfolio.js):

- `showcaseProjects`: projects shown on the home page and in Developed Software.
- `portfolioHub`: the three Portfolio hub cards. Set `image` to replace a
  placeholder. Developed Software cycles through project background images.
- `modelShowcase`: 3D models. Set `model` to a `.glb` in
  `frontend/public/models/`, or `placeholder` for a stand-in shape.

## Troubleshooting

- **Port 3000 / 8000 / 8080 in use**: change the host port in the Compose file.
- **Hot reload not working on Windows**: `CHOKIDAR_USEPOLLING` and
  `WATCHPACK_POLLING` are already set. Restart the `frontend` service.
- **Contact form fails with a missing-key error in the console**: add
  `REACT_APP_WEB3FORMS_ACCESS_KEY` to `frontend/.env.local` and restart the
  `frontend` service.
- **Recommendations missing after recreating containers**: don't use
  `down -v`, which deletes the data volume.
