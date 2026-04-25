# Splan Platform (Full-Stack)

## Run locally

```bash
cd /Users/ramakrishna/Documents/Personal/splan-platform
npm install
npm run dev
```

Open: `http://localhost:3000`

## Pages

- `/`
- `/enterprise-ai`
- `/workspace`
- `/visitor-intelligence`
- `/oracle-cloud`
- `/resources`
- `/contact`
- `/about`
- `/industries`
- `/why-splan`

## API

- `GET /api/health`
- `POST /api/leads`
- `POST /api/newsletter`
- `GET /api/leads` (requires `ADMIN_KEY` env and `x-admin-key` header)

## Data persistence

- Stored in `data/store.json`
