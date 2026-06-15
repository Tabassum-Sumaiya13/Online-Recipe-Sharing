import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Heart, Share2, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { IngredientsList } from '@/features/recipes/components/RecipeDetail/IngredientsList'
import { StepsList } from '@/features/recipes/components/RecipeDetail/StepsList'
import { NutritionTable } from '@/features/recipes/components/RecipeDetail/NutritionTable'
import { YouTubeEmbed } from '@/features/recipes/components/RecipeDetail/YouTubeEmbed'
import { CommentList } from '@/features/comments/components/CommentList'
import { CommentForm } from '@/features/comments/components/CommentForm'
import { useRecipe } from '@/features/recipes/api'
import { useFavorites, useToggleFavorite } from '@/features/favorites/api'
import { useAuth } from '@/providers/AuthProvider'
import { resolveRecipeImage } from '@/lib/recipe-images'

function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rounded ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`}
        />
      ))}
    </span>
  )
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: recipe, isLoading } = useRecipe(id!)
  const { data: favoriteIds } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const [imgIndex, setImgIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const isFavorited = favoriteIds?.includes(id!) ?? false

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-5 w-32" />
        <div className="grid md:grid-cols-[5fr_7fr] gap-10">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-32 w-full mt-4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) return <div className="text-center py-16 text-muted-foreground">Recipe not found.</div>

  const images =
    recipe.images && recipe.images.length > 0
      ? recipe.images.map((img) => img.url)
      : [resolveRecipeImage(recipe.imageUrl)]
  const rating = Number(recipe.rating)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all recipes
      </button>

      {/* ── Hero: left = info panel, right = image + description ── */}
      <div className="grid md:grid-cols-[5fr_7fr] gap-10 mb-14 items-start">

        {/* LEFT — meta info */}
        <div className="flex flex-col gap-4">
          {recipe.category && (
            <div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs uppercase tracking-wide">
                {recipe.category}
              </Badge>
            </div>
          )}

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {recipe.title}
          </h1>

          <div className="text-sm text-muted-foreground leading-relaxed">
            <span>
              By{' '}
              <Link
                to={recipe.authorId ? `/profile/${recipe.authorId}` : '#'}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {recipe.authorName || 'Anonymous'}
              </Link>
            </span>
            {recipe.createdAt && (
              <span className="ml-2">
                Updated{' '}
                {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          <Separator />

          {/* Stats list */}
          <dl className="space-y-3 text-sm">
            {recipe.prepTime && (
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Ready In</dt>
                <dd className="font-medium text-foreground">{recipe.prepTime}</dd>
              </div>
            )}
            {recipe.servings != null && (
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Servings</dt>
                <dd className="font-medium text-foreground">{recipe.servings}</dd>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Difficulty</dt>
                <dd className="font-medium text-foreground">{recipe.difficulty}</dd>
              </div>
            )}
            {recipe.calories != null && recipe.calories > 0 && (
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Calories</dt>
                <dd className="font-medium text-foreground">{recipe.calories} kcal</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Rating</dt>
              <dd className="flex items-center gap-2">
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                <StarRating value={rating} />
                <span className="text-muted-foreground">({recipe.reviewsCount || 0})</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Comments</dt>
              <dd>
                <a href="#comments" className="text-primary hover:underline font-medium text-sm">
                  Read comments ↓
                </a>
              </dd>
            </div>
          </dl>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isFavorited ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                user
                  ? toggleFavorite({ recipeId: recipe.id, isFavorited })
                  : navigate('/auth')
              }
              className="gap-2 rounded-full px-5"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full px-5"
              onClick={() => navigator.share?.({ title: recipe.title, url: window.location.href })}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recipe.tags.map((t) => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  #{t.tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — image carousel + description */}
        <div className="space-y-5">
          {/* Image carousel */}
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] group">
            <img
              src={images[imgIndex]}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />

            {/* Expand to lightbox */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
              aria-label="View full size"
            >
              <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </button>

            {/* Prev/Next — only when multiple images exist */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIndex((p) => (p + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === imgIndex ? 'bg-white' : 'bg-white/45'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description fills space below the image naturally */}
          {recipe.description && (
            <p className="text-muted-foreground leading-relaxed text-base">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Body: Ingredients (left 1/3) + Instructions/Video (right 2/3) ── */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-muted/40 rounded-xl p-6">
            <h2 className="font-serif text-2xl font-bold mb-4">Ingredients</h2>
            <IngredientsList ingredients={recipe.ingredients} servings={recipe.servings} />
          </div>

          {recipe.nutrition && recipe.nutrition.length > 0 && (
            <div className="bg-muted/40 rounded-xl p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">Nutrition Facts</h2>
              <NutritionTable nutrition={recipe.nutrition} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">Preparation</h2>
            <StepsList instructions={recipe.instructions} />
          </div>

          {recipe.youtubeId && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Video Tutorial</h2>
              <YouTubeEmbed youtubeId={recipe.youtubeId} />
            </div>
          )}
        </div>
      </div>

      {/* ── Comments ── */}
      <section id="comments" className="mt-12 pt-8 border-t border-border">
        <h2 className="font-serif text-2xl font-bold mb-6">
          Comments{' '}
          <span className="text-muted-foreground text-lg font-normal">({recipe.reviewsCount || 0})</span>
        </h2>
        <CommentForm recipeId={recipe.id} />
        <div className="mt-8">
          <CommentList recipeId={recipe.id} />
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[imgIndex]}
            alt={recipe.title}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-5 text-white/70 hover:text-white text-4xl leading-none font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </main>
  )
}
