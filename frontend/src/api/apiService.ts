import type { Artwork, ArtworkInput, ArtworkQuery } from '../types';
import type { ArtworkService } from './service';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}

export class ApiArtworkService implements ArtworkService {
  readonly mode = 'api' as const;

  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      });
    } catch {
      throw new ApiError(`Cannot reach the API at ${this.baseUrl}. Is the backend running?`, 0);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.details);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  list(query: ArtworkQuery) {
    const params = new URLSearchParams();
    if (query.price) params.set('price', query.price);
    if (query.artist.trim()) params.set('artist', query.artist.trim());
    if (query.type) params.set('type', query.type);
    const qs = params.toString();
    return this.request<Artwork[]>(`/artworks${qs ? `?${qs}` : ''}`);
  }

  create(input: ArtworkInput) {
    return this.request<Artwork>('/artworks', { method: 'POST', body: JSON.stringify(input) });
  }

  remove(id: string) {
    return this.request<void>(`/artworks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
