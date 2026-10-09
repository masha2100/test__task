import { ApiArtworkService } from './apiService';
import { LocalStorageArtworkService } from './localStorageService';
import type { ArtworkService } from './service';

const apiUrl = import.meta.env.VITE_API_URL?.trim();

/** Uses the real API when VITE_API_URL is set, otherwise LocalStorage. */
export const artworkService: ArtworkService = apiUrl
  ? new ApiArtworkService(apiUrl)
  : new LocalStorageArtworkService();

export type { ArtworkService };
