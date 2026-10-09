# Art Gallery Management System

Full-stack test task: a virtual gallery where users browse, sort and filter artworks, and admins add or remove them.

Both parts are implemented:

| Part | Stack | Folder |
| --- | --- | --- |
| **Backend** (Web API) | TypeScript, Express, SQLite (`better-sqlite3`), Zod | [`backend/`](backend) |
| **Frontend** (SPA) | TypeScript, React 18, Vite | [`frontend/`](frontend) |

The frontend works **on its own with LocalStorage** or **against the real API**, switched by one env variable.

## Quick start

Requirements: Node.js 18+ (tested on 22).

```bash
# 1) API on http://localhost:8000
cd backend
npm install
npm run dev

# 2) SPA on http://localhost:5173 (in a second terminal)
cd frontend
npm install
cp .env.example .env      # connects the SPA to the API; skip this step to use LocalStorage
npm run dev
```

The badge in the header shows which storage is active: **Connected to API** or **Saved in this browser**.

## Tests

```bash
cd backend && npm test    # 30 API tests (supertest, in-memory SQLite)
cd frontend && npm test   # 23 tests: form validation + LocalStorage persistence/sorting/filtering
```

## Features checklist

**Frontend**
- [x] List of artworks with title, artist, type, price and availability
- [x] Sort by price (low → high, high → low)
- [x] Filter by artist (partial, case-insensitive) and by type; filters and sorting combine
- [x] "Add New Artwork" form with validation: title required and ≤ 99 chars, artist required (≤ 50, same as the API), type from a predefined list, price numeric and > 0, availability checkbox (for sale / exhibition only)
- [x] Delete button on every card, with inline confirmation
- [x] 4 artworks shown on first launch; all changes survive a page reload (LocalStorage or API)
- [x] Loading, empty, error and "no results" states; responsive layout; keyboard-accessible modal (Esc to close)

**Backend**
- [x] `GET /artworks` with `price=asc|desc`, `artist`, `type` query params
- [x] `GET /artworks/{id}`
- [x] `POST /artworks` with validation → `400` + field-level details on invalid body
- [x] `DELETE /artworks/{id}`
- [x] `PUT /artworks/{id}` (optional feature) with the same validation as POST
- [x] `404` for unknown ids/routes, `400` for malformed JSON or invalid query params

See [`backend/README.md`](backend/README.md) for the full API reference.

## Project structure

```
backend/
  src/
    app.ts            Express app: routes, error handling
    validation.ts     Zod schemas for body and query
    repository.ts     SQL access (parameterised queries)
    db.ts             schema + seed data
    server.ts         entry point
  tests/              API tests
frontend/
  src/
    api/              ArtworkService interface + API and LocalStorage implementations
    components/       Toolbar, ArtworkCard, AddArtworkModal
    lib/              validation, client-side sorting/filtering, formatting
    App.tsx
  tests/
```

## Design decisions

- **One data interface, two implementations.** The UI depends only on `ArtworkService`; `ApiArtworkService` and `LocalStorageArtworkService` are swapped by `VITE_API_URL`, so the frontend meets the "LocalStorage *or* real API" requirement without code changes.
- **Validation on both sides.** The SPA validates for instant feedback; the API is the source of truth and its field errors are mapped back onto the form.
- **Predefined types** (`painting`, `sculpture`, `photography`, `drawing`, `print`, `digital`) are shared by both parts and also exposed at `GET /artwork-types`.
- **SQLite** keeps setup to `npm install`, with no database server needed. The DB file is created and seeded automatically on first run.
- The artwork model has no image field, so each card renders a generated placeholder picture that depends on the artwork's type.
