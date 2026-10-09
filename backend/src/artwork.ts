export const ARTWORK_TYPES = [
  'painting',
  'sculpture',
  'photography',
  'drawing',
  'print',
  'digital',
] as const;

export type ArtworkType = (typeof ARTWORK_TYPES)[number];

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  type: ArtworkType;
  price: number;
  availability: boolean;
}

export type ArtworkInput = Omit<Artwork, 'id'>;

export type PriceSort = 'asc' | 'desc';

export interface ArtworkFilters {
  price?: PriceSort;
  artist?: string;
  type?: ArtworkType;
}
