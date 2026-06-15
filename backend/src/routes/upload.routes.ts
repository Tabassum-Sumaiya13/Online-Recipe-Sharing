import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middlewares/auth.middleware'
import { uploadMiddleware } from '../middlewares/upload.middleware'
import * as uploadController from '../controllers/upload.controller'

const router = Router()

router.post(
  '/image',
  requireAuth,
  uploadMiddleware.single('image'),
  asyncHandler(uploadController.uploadImage),
)

router.post(
  '/images',
  requireAuth,
  uploadMiddleware.array('images', 10),
  asyncHandler(uploadController.uploadImages),
)

export default router
