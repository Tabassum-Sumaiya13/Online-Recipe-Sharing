import { z } from 'zod'

const ingredientSchema = z.object({
  item: z.string().min(1),
  position: z.number().int().default(0),
})

const instructionSchema = z.object({
  step: z.string().min(1),
  position: z.number().int().default(0),
  mediaUrl: z.string().url().max(500).optional(),
  mediaType: z.enum(['image', 'video']).optional(),
})

const nutritionSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
})

export const createRecipeSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    imageUrl: z.string().url().max(500).optional(),
    prepTime: z.string().max(50).optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
    category: z.string().max(100).optional(),
    servings: z.number().int().min(1).max(100).default(1),
    calories: z.number().int().min(0).default(0),
    youtubeId: z.string().max(200).optional(),
    popular: z.boolean().default(false),
    ingredients: z.array(ingredientSchema).min(1),
    instructions: z.array(instructionSchema).min(1),
    nutrition: z.array(nutritionSchema).optional().default([]),
    tags: z.array(z.string().max(100)).optional().default([]),
    images: z.array(z.object({ url: z.string().url().max(500), position: z.number().int().default(0) })).optional().default([]),
  }),
})

export const updateRecipeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createRecipeSchema.shape.body.partial(),
})

export const recipeQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    sort: z.enum(['newest', 'popular', 'rating']).optional(),
    authorId: z.string().uuid().optional(),
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('12').transform(Number),
  }),
})

export const recipeParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
})
