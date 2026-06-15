import { z } from 'zod'

export const createCommentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1).max(2000),
    rating: z.number().int().min(1).max(5).optional(),
    imageUrl: z.string().url().max(500).optional(),
  }),
})

export const updateCommentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1).max(2000).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    imageUrl: z.string().url().max(500).optional(),
  }),
})
