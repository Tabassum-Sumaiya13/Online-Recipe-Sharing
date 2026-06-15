import { z } from 'zod'

const ingredientSchema = z.object({
  item: z.string().min(1, 'Ingredient cannot be empty'),
  position: z.number().int().default(0),
})

const instructionSchema = z.object({
  step: z.string().min(1, 'Step cannot be empty'),
  position: z.number().int().default(0),
  mediaUrl: z.string().optional().or(z.literal('')),
  mediaType: z.enum(['image', 'video']).optional(),
})

const nutritionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

export const recipeFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
  prepTime: z.string().max(50).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
  category: z.string().max(100).optional(),
  servings: z.number().int().min(1).max(100).default(1),
  calories: z.number().int().min(0).default(0),
  youtubeId: z.string().max(200).optional(),
  popular: z.boolean().default(false),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(instructionSchema).min(1, 'At least one step is required'),
  nutrition: z.array(nutritionSchema).default([]),
  tags: z.array(z.string().max(100)).default([]),
  images: z.array(z.string()).default([]),
})

export type RecipeFormValues = z.infer<typeof recipeFormSchema>
