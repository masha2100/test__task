import type { Artwork, ArtworkQuery } from '../types';

/** Client-side equivalent of the API's sorting/filtering, used in LocalStorage mode. */
export function applyQuery(artworks: Artwork[], query: ArtworkQuery): Artwork[] {
  const artist = query.artist.trim().toLowerCase();

  const result = artworks.filter(
    (a) =>
      (!artist || a.artist.toLowerCase().includes(artist)) && (!query.type || a.type === query.type),
  );

  if (query.price) {
    const dir = query.price === 'asc' ? 1 : -1;
    // copy + stable sort keeps the original order for equal prices
    return [...result].sort((a, b) => (a.price - b.price) * dir);
  }
  return result;
}
