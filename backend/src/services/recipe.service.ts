import { Prisma } from '@prisma/client'
import prisma from '../prisma/client'
import { AppError } from '../utils/AppError'
import { PAGINATION_MAX_LIMIT } from '../config/constants'

interface RecipeFilters {
  search?: string
  category?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  sort?: 'newest' | 'popular' | 'rating'
  authorId?: string
  page: number
  limit: number
}

interface CreateRecipeInput {
  title: string
  description?: string
  imageUrl?: string
  prepTime?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  category?: string
  servings?: number
  calories?: number
  youtubeId?: string
  popular?: boolean
  ingredients: { item: string; position: number }[]
  instructions: { step: string; position: number; mediaUrl?: string; mediaType?: string }[]
  nutrition: { label: string; value: string }[]
  tags: string[]
  images: { url: string; position: number }[]
  authorId: string
  authorName: string
  authorAvatar?: string
}

export const recipeSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  authorId: true,
  authorName: true,
  authorAvatar: true,
  prepTime: true,
  difficulty: true,
  category: true,
  rating: true,
  reviewsCount: true,
  likesCount: true,
  servings: true,
  calories: true,
  youtubeId: true,
  popular: true,
  createdAt: true,
  updatedAt: true,
  ingredients: { orderBy: { position: 'asc' as const } },
  instructions: { orderBy: { position: 'asc' as const } },
  nutrition: true,
  tags: true,
  images: { orderBy: { position: 'asc' as const } },
}

export async function listRecipes(filters: RecipeFilters) {
  const take = Math.min(filters.limit, PAGINATION_MAX_LIMIT)
  const skip = (filters.page - 1) * take

  const where: Prisma.RecipeWhereInput = {}

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ]
  }
  if (filters.category) where.category = { equals: filters.category }
  if (filters.difficulty) where.difficulty = filters.difficulty
  if (filters.authorId) where.authorId = filters.authorId

  const orderBy: Prisma.RecipeOrderByWithRelationInput =
    filters.sort === 'popular'
      ? { likesCount: 'desc' }
      : filters.sort === 'rating'
      ? { rating: 'desc' }
      : { createdAt: 'desc' }

  const [recipes, total] = await prisma.$transaction([
    prisma.recipe.findMany({ where, orderBy, skip, take, select: recipeSelect }),
    //select from recipe table with the where, orderBy, skip and take options, the result is stored in recipes variable, the total count of recipes matching the where condition is stored in total variable
    prisma.recipe.count({ where }),
  ])

  return { recipes, total, page: filters.page, limit: take }
}

export async function getPopularRecipes() {
  return prisma.recipe.findMany({
    where: { popular: true },
    orderBy: { rating: 'desc' },
    take: 8,
    select: recipeSelect,
  })
}

export async function getMyRecipes(userId: string) {
  return prisma.recipe.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    select: recipeSelect,
  })
}

export async function getRecipeById(id: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id }, select: recipeSelect })
  if (!recipe) throw new AppError('Recipe not found', 404, 'NOT_FOUND')
  return recipe
}

export async function createRecipe(input: CreateRecipeInput) {
  return prisma.recipe.create({
    data: {
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      authorId: input.authorId,
      authorName: input.authorName,
      authorAvatar: input.authorAvatar,
      prepTime: input.prepTime,
      difficulty: input.difficulty ?? 'Easy',
      category: input.category,
      servings: input.servings ?? 1,
      calories: input.calories ?? 0,
      youtubeId: input.youtubeId,
      popular: input.popular ?? false,
      ingredients: { create: input.ingredients },
      instructions: { create: input.instructions },
      nutrition: { create: input.nutrition },
      tags: { create: input.tags.map((tag) => ({ tag })) },
      images: { create: input.images },
    },
    select: recipeSelect,
  })
}

export async function updateRecipe(
  id: string,
  userId: string,
  input: Partial<CreateRecipeInput>,
) {
  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) throw new AppError('Recipe not found', 404, 'NOT_FOUND')
  if (recipe.authorId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')

  return prisma.$transaction(async (tx) => {
    if (input.ingredients) {
      await tx.ingredient.deleteMany({ where: { recipeId: id } })
    }
    if (input.instructions) {
      await tx.instruction.deleteMany({ where: { recipeId: id } })
    }
    if (input.nutrition) {
      await tx.nutrition.deleteMany({ where: { recipeId: id } })
    }
    if (input.tags) {
      await tx.tag.deleteMany({ where: { recipeId: id } })
    }
    if (input.images) {
      await tx.recipeImage.deleteMany({ where: { recipeId: id } })
    }

    return tx.recipe.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.prepTime !== undefined && { prepTime: input.prepTime }),
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.servings !== undefined && { servings: input.servings }),
        ...(input.calories !== undefined && { calories: input.calories }),
        ...(input.youtubeId !== undefined && { youtubeId: input.youtubeId }),
        ...(input.popular !== undefined && { popular: input.popular }),
        ...(input.ingredients && { ingredients: { create: input.ingredients } }),
        ...(input.instructions && { instructions: { create: input.instructions } }),
        ...(input.nutrition && { nutrition: { create: input.nutrition } }),
        ...(input.tags && { tags: { create: input.tags.map((tag) => ({ tag })) } }),
        ...(input.images && { images: { create: input.images } }),
      },
      select: recipeSelect,
    })
  })
}

export async function deleteRecipe(id: string, userId: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) throw new AppError('Recipe not found', 404, 'NOT_FOUND')
  if (recipe.authorId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  await prisma.recipe.delete({ where: { id } })
}
