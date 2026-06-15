import { Request, Response } from 'express'
import { handleImageUpload, handleMultipleImageUploads } from '../services/storage.service'
import { env } from '../config/env'

export async function uploadImage(req: Request, res: Response): Promise<void> {
  const baseUrl = `${req.protocol}://${req.get('host')}`
  const result = await handleImageUpload(req.file, baseUrl)
  res.status(201).json({ success: true, data: result })
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  const baseUrl = `${req.protocol}://${req.get('host')}`
  const files = req.files as Express.Multer.File[] | undefined
  const result = await handleMultipleImageUploads(files, baseUrl)
  res.status(201).json({ success: true, data: result })
}
