import { Request, Response } from 'express'
import * as commentService from '../services/comment.service'

export async function getByRecipe(req: Request, res: Response): Promise<void> {
  const comments = await commentService.getCommentsByRecipe(req.params.id)
  res.json({ success: true, data: comments })
}

export async function create(req: Request, res: Response): Promise<void> {
  const comment = await commentService.createComment({
    recipeId: req.params.id,
    userId: req.user!.userId,
    content: req.body.content,
    rating: req.body.rating,
    imageUrl: req.body.imageUrl,
  })
  res.status(201).json({ success: true, data: comment })
}

export async function update(req: Request, res: Response): Promise<void> {
  const comment = await commentService.updateComment(req.params.id, req.user!.userId, req.body)
  res.json({ success: true, data: comment })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await commentService.deleteComment(req.params.id, req.user!.userId)
  res.json({ success: true, data: null })
}
