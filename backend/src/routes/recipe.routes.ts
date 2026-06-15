import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { validate } from '../middlewares/validate.middleware'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  createRecipeSchema,
  duplicateRecipeCheckSchema,
  updateRecipeSchema,
  recipeQuerySchema,
  recipeParamSchema,
} from '../schemas/recipe.schema'
import * as recipeController from '../controllers/recipe.controller'

const router = Router()

router.get('/', validate(recipeQuerySchema), asyncHandler(recipeController.list))
router.get('/popular', asyncHandler(recipeController.popular))
router.get('/mine', requireAuth, asyncHandler(recipeController.mine))
router.post('/check-duplicates', requireAuth, validate(duplicateRecipeCheckSchema), asyncHandler(recipeController.checkDuplicates))
router.get('/:id', validate(recipeParamSchema), asyncHandler(recipeController.detail))
router.post('/', requireAuth, validate(createRecipeSchema), asyncHandler(recipeController.create))
router.patch('/:id', requireAuth, validate(updateRecipeSchema), asyncHandler(recipeController.update))
router.delete('/:id', requireAuth, validate(recipeParamSchema), asyncHandler(recipeController.remove))

export default router
