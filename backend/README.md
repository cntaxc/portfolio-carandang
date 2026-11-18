# Backend

Recommendations API: Node.js 20 + Express, with a JSON file store.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service status |
| `GET` | `/api/recommendations` | Published recommendations, newest first |
| `POST` | `/api/recommendations` | Validate, profanity-check and publish (`201`); profanity returns `422` |

- Submissions are limited to 5 per 15 minutes per IP.
- [`lib/profanity-filter.js`](lib/profanity-filter.js) checks English, Tagalog/Filipino and Spanish words, including leetspeak (`f4ck`, `t4ng1n4`), masked and spaced-out letters, and words glued together.
- [`lib/recommendation-store.js`](lib/recommendation-store.js) writes atomically, serializes writes, and re-reads the file when it changes on disk.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Start the API (port `PORT`, default 8000) |
| `npm run dev` | Start with auto-restart on file changes |
| `npm test` | Run the test suite (`node:test`) |
| `npm run recommendations -- <command>` | Moderation: `list`, `delete <id> [...]`, `clear --yes` |

## Configuration

| Variable | Default | |
|----------|---------|---|
| `PORT` | `8000` | |
| `NODE_ENV` | — | `development` enables CORS for `localhost:3xxx` |
| `RECOMMENDATIONS_DATA_FILE` | `./data/recommendations.json` | Docker uses `/app/data/recommendations.json` on a volume |

## Moderation

```powershell
docker compose exec backend npm run recommendations -- list
docker compose exec backend npm run recommendations -- delete <id>
```

You can also edit the JSON file directly, for example in Docker Desktop: Containers, then `portfolio-backend-dev`, then Files, then `/app/data`. The running server notices the change and serves the new data immediately. If an edit leaves invalid JSON, it keeps serving the last good data and logs an error.
