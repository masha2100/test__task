import type { ArtworkType } from '../types';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatPrice = (price: number) => currency.format(price);

export const typeLabel = (type: ArtworkType) => type.charAt(0).toUpperCase() + type.slice(1);

/** Deterministic hue per artwork so each card gets its own placeholder artwork. */
export function hueFromString(value: string) {
  let hash = 0;
  for (const ch of value) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}
