import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
import { useCreateRecipe, useDuplicateRecipeCheck, type DuplicateRecipeMatch, type RecipeInput } from '@/features/recipes/api'
import { CATEGORIES } from '@/lib/constants'

export default function PostRecipePage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateRecipe()
  const duplicateCheck = useDuplicateRecipeCheck()
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateRecipeMatch[]>([])
  const [pendingPayload, setPendingPayload] = useState<RecipeInput | null>(null)

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

  const buildPayload = (values: RecipeFormValues): RecipeInput => {
    const imageUrls = (values.images ?? []).filter(Boolean)
    return {
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
  }

  const publishRecipe = (payload: RecipeInput) => {
    mutate(payload, {
      onSuccess: (recipe) => navigate(`/recipes/${recipe.id}`),
    })
  }

  const onSubmit = async (values: RecipeFormValues) => {
    const payload = buildPayload(values)
    const matches = await duplicateCheck.mutateAsync({
      title: payload.title,
      prepTime: payload.prepTime ?? undefined,
      category: payload.category ?? undefined,
      ingredients: payload.ingredients,
    })

    if (matches.length > 0) {
      setDuplicateMatches(matches)
      setPendingPayload(payload)
      return
    }

    publishRecipe(payload)
  }

  const publishDespiteDuplicates = () => {
    if (!pendingPayload) return
    setDuplicateMatches([])
    publishRecipe(pendingPayload)
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

          {duplicateMatches.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold">Possible duplicate recipes found</h2>
                    <p className="mt-1 text-sm text-amber-900">
                      These recipes look similar. You can review them or publish your version anyway.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {duplicateMatches.map((match) => (
                      <div key={match.id} className="rounded-md border border-amber-200 bg-background/80 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/recipes/${match.id}`)}
                              className="text-left text-sm font-medium text-foreground hover:text-primary"
                            >
                              {match.title}
                            </button>
                            <p className="mt-1 text-xs text-muted-foreground">
                              by {match.authorName}
                              {match.category ? ` - ${match.category}` : ''}
                              {match.prepTime ? ` - ${match.prepTime}` : ''}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                            {Math.round(match.score)}%
                          </span>
                        </div>
                        {match.reasons.length > 0 && (
                          <p className="mt-2 text-xs text-amber-800">
                            Match: {match.reasons.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => setDuplicateMatches([])}>
                      Review my recipe
                    </Button>
                    <Button type="button" onClick={publishDespiteDuplicates} disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Publish anyway
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <IngredientListBuilder />
          <StepByStepBuilder />
          <VideoTutorialInput />

          <Button type="submit" size="lg" className="w-full" disabled={isPending || duplicateCheck.isPending}>
            {(isPending || duplicateCheck.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Recipe
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}
