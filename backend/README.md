# Art Gallery API

Express + TypeScript + SQLite. Runs on `http://localhost:8000` by default.

```bash
npm install
npm run dev                  # watch mode
npm test                     # API tests
npm run build && npm start   # production build
```

| Env var | Default | Description |
| --- | --- | --- |
| `PORT` | `8000` | HTTP port |
| `DB_PATH` | `data/gallery.db` | SQLite file (created and seeded with 4 artworks on first run) |

## Model

```ts
{
  id: string;
  title: string;          // required, 1–99 chars (trimmed)
  artist: string;         // required, 1–50 chars (trimmed)
  type: 'painting' | 'sculpture' | 'photography' | 'drawing' | 'print' | 'digital';
  price: number;          // required, > 0
  availability: boolean;  // optional, defaults to true
}
```

## Endpoints

### `GET /artworks`
Query params (all optional, combinable):

| Param | Values | Effect |
| --- | --- | --- |
| `price` | `asc` \| `desc` | sort by price |
| `artist` | text | partial, case-insensitive match |
| `type` | one of the types above | exact match |

```
GET /artworks?price=asc&artist=Picasso&type=painting
```
`200` → `Artwork[]` · `400` on unknown param or invalid value.

### `GET /artworks/{id}`
`200` → `Artwork` · `404` if not found.

### `POST /artworks`
```json
{ "title": "Sunset Over the Ocean", "artist": "Claude Monet", "type": "painting", "price": 4500, "availability": true }
```
`201` → created `Artwork` (+ `Location` header) · `400` on validation error:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "price", "message": "Price must be greater than 0" }]
}
```
Unknown fields (e.g. `id`) are rejected.

### `PUT /artworks/{id}` *(optional feature)*
Same body and validation as POST. `200` → updated `Artwork` · `400` · `404`.

### `DELETE /artworks/{id}`
`204` · `404` if not found.

### Extras
- `GET /artwork-types` → list of allowed types
- `GET /health` → `{ "status": "ok" }`
