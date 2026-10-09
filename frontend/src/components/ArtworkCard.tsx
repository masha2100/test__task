import type { CSSProperties } from 'react';
import { useState } from 'react';
import { formatPrice, hueFromString, typeLabel } from '../lib/format';
import type { Artwork } from '../types';

interface Props {
  artwork: Artwork;
  onDelete: (id: string) => Promise<void>;
}

export function ArtworkCard({ artwork, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hue = hueFromString(artwork.id + artwork.title);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(artwork.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <article className={`card ${artwork.availability ? 'card--sale' : 'card--exhibit'}`}>
      <div
        className={`card__art card__art--${artwork.type}`}
        style={{ '--h': hue } as CSSProperties}
        aria-hidden="true"
      />

      <div className="card__body">
        <div className="card__row">
          <h3 className="card__title" title={artwork.title}>
            {artwork.title}
          </h3>
          <span className="card__price">{formatPrice(artwork.price)}</span>
        </div>
        <p className="card__artist">By: {artwork.artist}</p>

        <div className="card__meta">
          <span className="badge">{typeLabel(artwork.type)}</span>
          <span className={`badge ${artwork.availability ? 'badge--sale' : 'badge--exhibit'}`}>
            {artwork.availability ? 'For sale' : 'Exhibition only'}
          </span>
        </div>

        <div className="card__actions">
          {confirming ? (
            <>
              <span className="card__confirm">Remove this artwork?</span>
              <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Yes, remove'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${artwork.title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
