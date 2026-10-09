import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api/apiService';
import { typeLabel } from '../lib/format';
import {
  ARTIST_MAX,
  EMPTY_FORM,
  TITLE_MAX,
  validateArtwork,
  type ArtworkFormErrors,
  type ArtworkFormValues,
} from '../lib/validation';
import { ARTWORK_TYPES, type ArtworkInput } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (input: ArtworkInput) => Promise<void>;
}

export function AddArtworkModal({ onClose, onSubmit }: Props) {
  const [values, setValues] = useState<ArtworkFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<ArtworkFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInput.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof ArtworkFormValues>(key: K, value: ArtworkFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateArtwork(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(result.data);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.details.length) {
        // map server-side validation errors back onto the fields
        const serverErrors: ArtworkFormErrors = {};
        err.details.forEach((d) => {
          if (d.field in EMPTY_FORM) serverErrors[d.field as keyof ArtworkFormValues] = d.message;
        });
        setErrors(serverErrors);
      }
      setSubmitError(err instanceof Error ? err.message : 'Could not save the artwork');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-artwork-title">
        <div className="modal__head">
          <h2 id="add-artwork-title">Add New Artwork</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="form">
          <label className="form__field">
            <span>Title</span>
            <input
              ref={firstInput}
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={TITLE_MAX + 20}
              aria-invalid={!!errors.title}
              placeholder="e.g. Sunset Over the Ocean"
            />
            <small className="form__hint">
              {errors.title ? (
                <span className="form__error">{errors.title}</span>
              ) : (
                `${values.title.trim().length}/${TITLE_MAX}`
              )}
            </small>
          </label>

          <label className="form__field">
            <span>Artist</span>
            <input
              value={values.artist}
              onChange={(e) => set('artist', e.target.value)}
              aria-invalid={!!errors.artist}
              placeholder="e.g. Claude Monet"
            />
            <small className="form__hint">
              {errors.artist ? (
                <span className="form__error">{errors.artist}</span>
              ) : (
                `${values.artist.trim().length}/${ARTIST_MAX}`
              )}
            </small>
          </label>

          <div className="form__row">
            <label className="form__field">
              <span>Type</span>
              <select value={values.type} onChange={(e) => set('type', e.target.value)} aria-invalid={!!errors.type}>
                <option value="" disabled>
                  Select type
                </option>
                {ARTWORK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
              {errors.type && <small className="form__error">{errors.type}</small>}
            </label>

            <label className="form__field">
              <span>Price, $</span>
              <input
                inputMode="decimal"
                value={values.price}
                onChange={(e) => set('price', e.target.value)}
                aria-invalid={!!errors.price}
                placeholder="4500"
              />
              {errors.price && <small className="form__error">{errors.price}</small>}
            </label>
          </div>

          <label className="form__check">
            <input
              type="checkbox"
              checked={values.availability}
              onChange={(e) => set('availability', e.target.checked)}
            />
            <span>
              Available for sale
              <small> — uncheck if the piece is for exhibition only</small>
            </span>
          </label>

          {submitError && <p className="form__submit-error">{submitError}</p>}

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Artwork'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
