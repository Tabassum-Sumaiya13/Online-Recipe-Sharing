import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiImageUploadZone } from '@/features/recipe-form/components/MultiImageUploadZone'
import { IngredientListBuilder } from '@/features/recipe-form/components/IngredientListBuilder'
import { StepByStepBuilder } from '@/features/recipe-form/components/StepByStepBuilder'
import { VideoTutorialInput } from '@/features/recipe-form/components/VideoTutorialInput'
import { recipeFormSchema, type RecipeFormValues } from '@/features/recipe-form/schemas'
import { useCreateRecipe, type RecipeInput } from '@/features/recipes/api'
import { CATEGORIES } from '@/lib/constants'

export default function PostRecipePage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateRecipe()

  const methods = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      difficulty: 'Easy',
      servings: 2,
      calories: 0,
      popular: false,
      ingredients: [{ item: '', position: 0 }],
      instructions: [{ step: '', position: 0 }],
      nutrition: [],
      tags: [],
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods

  const onSubmit = (values: RecipeFormValues) => {
    const imageUrls = (values.images ?? []).filter(Boolean)
    const payload: RecipeInput = {
      title: values.title,
      description: values.description,
      imageUrl: imageUrls[0] ?? values.imageUrl ?? null,
      prepTime: values.prepTime,
      difficulty: values.difficulty,
      category: values.category,
      servings: values.servings,
      calories: values.calories,
      youtubeId: values.youtubeId,
      popular: values.popular,
      ingredients: values.ingredients,
      instructions: values.instructions.map((ins) => ({
        ...ins,
        mediaUrl: ins.mediaUrl || undefined,
        mediaType: ins.mediaType || undefined,
      })),
      nutrition: values.nutrition,
      tags: values.tags,
      images: imageUrls.map((url, i) => ({ url, position: i })),
    }
    mutate(payload, {
      onSuccess: (recipe) => navigate(`/recipes/${recipe.id}`),
    })
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Share a Recipe</h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Give your recipe a name" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="Tell us about your recipe…" {...register('description')} />
          </div>

          <MultiImageUploadZone
            values={watch('images') ?? []}
            onChange={(urls) => {
              setValue('images', urls)
              setValue('imageUrl', urls[0] ?? '')
            }}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select defaultValue="Easy" onValueChange={(v) => setValue('difficulty', v as RecipeFormValues['difficulty'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prepTime">Prep Time</Label>
              <Input id="prepTime" placeholder="e.g. 30 min" {...register('prepTime')} />
            </div>
          </div>

          <IngredientListBuilder />
          <StepByStepBuilder />
          <VideoTutorialInput />

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Recipe
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}
