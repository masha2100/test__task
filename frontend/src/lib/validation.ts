import { ARTWORK_TYPES, type ArtworkInput, type ArtworkType } from '../types';

export const TITLE_MAX = 99;
export const ARTIST_MAX = 50;

/** Raw form state: every input value is a string until validated. */
export interface ArtworkFormValues {
  title: string;
  artist: string;
  type: string;
  price: string;
  availability: boolean;
}

export type ArtworkFormErrors = Partial<Record<keyof ArtworkFormValues, string>>;

export const EMPTY_FORM: ArtworkFormValues = {
  title: '',
  artist: '',
  type: '',
  price: '',
  availability: true,
};

// plain decimal number: optional minus, digits, optional fraction (no exponents, commas, spaces)
const NUMERIC = /^-?\d+(\.\d+)?$/;

export function validateArtwork(
  values: ArtworkFormValues,
): { ok: true; data: ArtworkInput } | { ok: false; errors: ArtworkFormErrors } {
  const errors: ArtworkFormErrors = {};
  const title = values.title.trim();
  const artist = values.artist.trim();
  const price = values.price.trim();

  if (!title) errors.title = 'Title cannot be empty';
  else if (title.length > TITLE_MAX) errors.title = `Title must be at most ${TITLE_MAX} characters`;

  if (!artist) errors.artist = 'Artist cannot be empty';
  else if (artist.length > ARTIST_MAX) errors.artist = `Artist must be at most ${ARTIST_MAX} characters`;

  if (!(ARTWORK_TYPES as readonly string[]).includes(values.type)) errors.type = 'Select a type';

  if (!price) errors.price = 'Price is required';
  else if (!NUMERIC.test(price)) errors.price = 'Price must be a number';
  else if (Number(price) <= 0) errors.price = 'Price must be greater than 0';

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      title,
      artist,
      type: values.type as ArtworkType,
      price: Number(price),
      availability: values.availability,
    },
  };
}
