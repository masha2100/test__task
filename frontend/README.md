# Art Gallery SPA

React 18 + TypeScript + Vite.

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build
```

**Storage mode**
- No `.env` → data is kept in **LocalStorage** (seeded with 4 artworks on first launch).
- `cp .env.example .env` → uses the API at `VITE_API_URL` (default `http://localhost:8000`). Start the backend first.
