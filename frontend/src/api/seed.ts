import type { Artwork } from '../types';

/** The first 4 artworks shown on first launch (same as the backend seed). */
export const SEED_ARTWORKS: Artwork[] = [
  { id: '1', title: 'Abstract Vibrance', artist: 'Alex Johnson', type: 'painting', price: 5500, availability: true },
  { id: '2', title: 'Tranquil Lake', artist: 'Maria Gonzales', type: 'painting', price: 3500, availability: true },
  { id: '3', title: 'Geometric Harmony', artist: 'Liam Smith', type: 'sculpture', price: 11000, availability: false },
  { id: '4', title: 'Silent Streets', artist: 'Yuki Tanaka', type: 'photography', price: 1800, availability: true },
];
