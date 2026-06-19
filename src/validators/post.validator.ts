import { z } from 'zod';

const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((tags) => {
    if (Array.isArray(tags)) {
      return tags.map((tag) => tag.trim()).filter(Boolean);
    }
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  })
  .refine((tags) => tags.length > 0, { message: 'At least one tag is required' });

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().trim().min(1, 'Content is required'),
  tags: tagsSchema,
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).optional(),
    tags: tagsSchema.optional(),
  })
  .refine((data) => data.title || data.content || data.tags, {
    message: 'Provide title, content, or tags to update',
  });

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required').max(1000),
});

export const updateCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required').max(1000),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
