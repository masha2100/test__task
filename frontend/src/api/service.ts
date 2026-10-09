import type { Artwork, ArtworkInput, ArtworkQuery } from '../types';

/** Storage-agnostic data access; the UI only talks to this interface. */
export interface ArtworkService {
  readonly mode: 'api' | 'localStorage';
  list(query: ArtworkQuery): Promise<Artwork[]>;
  create(input: ArtworkInput): Promise<Artwork>;
  remove(id: string): Promise<void>;
}
