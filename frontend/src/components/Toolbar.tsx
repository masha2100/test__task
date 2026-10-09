import { ARTWORK_TYPES, type ArtworkQuery, type ArtworkType, type PriceSort } from '../types';
import { typeLabel } from '../lib/format';

interface Props {
  query: ArtworkQuery;
  onChange: (query: ArtworkQuery) => void;
}

export function Toolbar({ query, onChange }: Props) {
  const hasFilters = query.artist || query.type || query.price;

  return (
    <div className="toolbar" role="search">
      <label className="field field--grow">
        <span className="visually-hidden">Filter by artist</span>
        <input
          type="search"
          placeholder="Search by artist…"
          value={query.artist}
          onChange={(e) => onChange({ ...query, artist: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="visually-hidden">Filter by type</span>
        <select
          value={query.type}
          onChange={(e) => onChange({ ...query, type: e.target.value as '' | ArtworkType })}
        >
          <option value="">All types</option>
          {ARTWORK_TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="visually-hidden">Sort by price</span>
        <select
          value={query.price}
          onChange={(e) => onChange({ ...query, price: e.target.value as PriceSort })}
        >
          <option value="">Sort by</option>
          <option value="asc">Price: low to high</option>
          <option value="desc">Price: high to low</option>
        </select>
      </label>

      {hasFilters && (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onChange({ artist: '', type: '', price: '' })}
        >
          Reset
        </button>
      )}
    </div>
  );
}
