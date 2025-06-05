import { z } from 'zod';

export const artTypes = ['music', 'book', 'movie', 'misc'] as const;

export const artSchema = z.object({
  type: z.enum(artTypes, {
    required_error: "Please select a type",
    invalid_type_error: "Please select a valid type",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  url: z.string().url({
    message: "Please enter a valid URL",
  }).nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  artist: z.array(z.string()).nullable().optional(),
  published_on: z.date().nullable().optional(),
});

export type ArtFormValues = z.infer<typeof artSchema>;
