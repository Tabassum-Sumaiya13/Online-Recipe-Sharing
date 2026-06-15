import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Bookmark, Clock, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/providers/ToastProvider'
import { useAuth } from '@/providers/AuthProvider'
import type { Recipe } from '@/features/recipes/types'

interface RecipeCardProps {
  recipe: Recipe
  isFavorited?: boolean
  onToggleFavorite?: (id: string, current: boolean) => void
  className?: string
}

export function RecipeCard({ recipe, isFavorited, onToggleFavorite, className }: RecipeCardProps) {
  const reduce = useReducedMotion()
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [burst, setBurst] = useState(false)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: 'Sign in to save recipes',
        description: 'Create a free account to build your personal cookbook.',
        variant: 'info',
      })
      return
    }
    if (!onToggleFavorite) return
    if (!isFavorited) {
      setBurst(true)
      setTimeout(() => setBurst(false), 600)
    }
    onToggleFavorite(recipe.id, isFavorited ?? false)
  }

  return (
    <motion.div
      whileHover={reduce ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border border-border/60 shadow-sm transition-shadow hover:shadow-md bg-card">
        <Link to={`/recipes/${recipe.id}`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
            )}

            {/* Category badge */}
            {recipe.category && (
              <Badge className="absolute left-2 top-2 bg-primary/90 text-primary-foreground text-[11px]">
                {recipe.category}
              </Badge>
            )}

            {/* Save button — always visible, top-right */}
            <motion.button
              aria-label={isFavorited ? 'Remove from saved' : 'Save recipe'}
              onClick={handleSave}
              className={cn(
                'absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm transition-colors',
                isFavorited
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/85 text-foreground hover:bg-primary hover:text-primary-foreground'
              )}
              whileTap={reduce ? {} : { scale: 0.88 }}
            >
              <Bookmark
                className={cn(
                  'h-3.5 w-3.5 transition-all duration-200',
                  isFavorited ? 'fill-current' : ''
                )}
              />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>

              {/* Burst particles on save */}
              <AnimatePresence>
                {burst && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-primary"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos((i / 6) * Math.PI * 2) * 18,
                          y: Math.sin((i / 6) * Math.PI * 2) * 18,
                          opacity: 0,
                          scale: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          {/* if click on card title, it takes you to the RecipeDetailPage */}
        </Link>
        <CardContent className="p-3">
          <Link to={`/recipes/${recipe.id}`}>
            <h3 className="line-clamp-2 font-semibold leading-snug hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {recipe.prepTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(recipe.rating).toFixed(1)}
            </span>
            <Badge variant="outline" className="py-0 text-[10px]">
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Author line */}
          {recipe.authorName && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                navigate(`/recipes?author=${recipe.authorId}`)
              }}
              className="mt-2 text-[11px] text-muted-foreground hover:text-primary transition-colors truncate block max-w-full text-left"
            >
              by {recipe.authorName}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
