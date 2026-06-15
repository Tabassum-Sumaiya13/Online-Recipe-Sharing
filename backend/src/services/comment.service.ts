import prisma from '../prisma/client'
import { AppError } from '../utils/AppError'

export async function getCommentsByRecipe(recipeId: string) {
  return prisma.comment.findMany({
    where: { recipeId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      rating: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
  })
}

interface CreateCommentInput {
  recipeId: string
  userId: string
  content: string
  rating?: number
  imageUrl?: string
}

export async function createComment(input: CreateCommentInput) {
  const recipe = await prisma.recipe.findUnique({ where: { id: input.recipeId } })
  if (!recipe) throw new AppError('Recipe not found', 404, 'NOT_FOUND')

  const comment = await prisma.$transaction(async (tx: Omit<any, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">) => {
    const created = await tx.comment.create({
      data: {
        recipeId: input.recipeId,
        userId: input.userId,
        content: input.content,
        rating: input.rating,
        imageUrl: input.imageUrl,
      },
      select: {
        id: true,
        content: true,
        rating: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    })

    await recalculateRecipeStats(tx, input.recipeId)
    return created
  })

  return comment
}

export async function updateComment(
  id: string,
  userId: string,
  data: { content?: string; rating?: number },
) {
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) throw new AppError('Comment not found', 404, 'NOT_FOUND')
  if (comment.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')

  return prisma.$transaction(async (tx: Omit<any, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">) => {
    const updated = await tx.comment.update({
      where: { id },
      data,
      select: {
        id: true,
        content: true,
        rating: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    })
    await recalculateRecipeStats(tx, comment.recipeId)
    return updated
  })
}

export async function deleteComment(id: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) throw new AppError('Comment not found', 404, 'NOT_FOUND')
  if (comment.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')

  await prisma.$transaction(async (tx: Omit<any, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">) => {
    await tx.comment.delete({ where: { id } })
    await recalculateRecipeStats(tx, comment.recipeId)
  })
}

async function recalculateRecipeStats(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  recipeId: string,
) {
  const comments = await tx.comment.findMany({
    where: { recipeId, rating: { not: null } },
    select: { rating: true },
  })

  const count = await tx.comment.count({ where: { recipeId } })
  const ratingSum = comments.reduce((sum: any, c: { rating: any }) => sum + (c.rating ?? 0), 0)
  const avgRating = comments.length > 0 ? ratingSum / comments.length : 0

  await tx.recipe.update({
    where: { id: recipeId },
    data: {
      reviewsCount: count,
      rating: parseFloat(avgRating.toFixed(1)),
    },
  })
}
