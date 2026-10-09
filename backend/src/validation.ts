import { z } from 'zod';
import { ARTWORK_TYPES } from './artwork.js';

export const TITLE_MAX = 99;
export const ARTIST_MAX = 50;

/** Body schema shared by POST and PUT. Unknown fields (e.g. `id`) are rejected. */
export const artworkInputSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' })
      .trim()
      .min(1, 'Title is required')
      .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`),
    artist: z
      .string({ required_error: 'Artist is required', invalid_type_error: 'Artist must be a string' })
      .trim()
      .min(1, 'Artist is required')
      .max(ARTIST_MAX, `Artist must be at most ${ARTIST_MAX} characters`),
    type: z.enum(ARTWORK_TYPES, {
      errorMap: () => ({ message: `Type must be one of: ${ARTWORK_TYPES.join(', ')}` }),
    }),
    price: z
      .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
      .finite('Price must be a finite number')
      .gt(0, 'Price must be greater than 0'),
    availability: z
      .boolean({ invalid_type_error: 'Availability must be a boolean' })
      .optional()
      .default(true),
  })
  .strict();

export const artworkQuerySchema = z
  .object({
    price: z
      .enum(['asc', 'desc'], { errorMap: () => ({ message: 'price must be "asc" or "desc"' }) })
      .optional(),
    artist: z.string().trim().min(1).optional(),
    type: z
      .enum(ARTWORK_TYPES, {
        errorMap: () => ({ message: `type must be one of: ${ARTWORK_TYPES.join(', ')}` }),
      })
      .optional(),
  })
  .strict();

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || (issue.code === 'unrecognized_keys' ? issue.keys.join(', ') : ''),
    message: issue.message,
  }));
}
