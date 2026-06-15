import { Request, Response } from 'express'
import * as recipeService from '../services/recipe.service'

export async function list(req: Request, res: Response): Promise<void> {
  const q = req.query as {
    search?: string
    category?: string
    difficulty?: 'Easy' | 'Medium' | 'Hard'
    sort?: 'newest' | 'popular' | 'rating'
    page?: number
    limit?: number
  }

  const result = await recipeService.listRecipes({
    search: q.search,
    category: q.category,
    difficulty: q.difficulty,
    sort: q.sort,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 12),
  })

  res.json({
    success: true,
    data: result.recipes,
    meta: { page: result.page, limit: result.limit, total: result.total },
  })
}

export async function popular(_req: Request, res: Response): Promise<void> {
  const recipes = await recipeService.getPopularRecipes()
  res.json({ success: true, data: recipes })
}

export async function mine(req: Request, res: Response): Promise<void> {
  const recipes = await recipeService.getMyRecipes(req.user!.userId)
  res.json({ success: true, data: recipes })
}

export async function detail(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.getRecipeById(req.params.id)
  res.json({ success: true, data: recipe })
}

export async function checkDuplicates(req: Request, res: Response): Promise<void> {
  const matches = await recipeService.findDuplicateRecipeCandidates(req.body)
  res.json({ success: true, data: matches })
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user!
  const recipe = await recipeService.createRecipe({
    ...req.body,
    authorId: user.userId,
    authorName: req.body.authorName ?? user.email,
  })
  res.status(201).json({ success: true, data: recipe })
}

export async function update(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.updateRecipe(req.params.id, req.user!.userId, req.body)
  res.json({ success: true, data: recipe })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await recipeService.deleteRecipe(req.params.id, req.user!.userId)
  res.json({ success: true, data: null })
}
