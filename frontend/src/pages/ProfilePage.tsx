import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, Pencil, ChefHat, Heart, BookOpen, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { RecipeCard } from '@/components/shared/RecipeCard'
import { ProfileForm } from '@/features/profile/components/ProfileForm'
import { useMyRecipes } from '@/features/recipes/api'
import { useFavorites, useFavoriteRecipes, useToggleFavorite } from '@/features/favorites/api'
import { useAuth } from '@/providers/AuthProvider'
import { PageLoader } from '@/components/shared/PageLoader'
import { CATEGORIES } from '@/lib/constants'

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: myRecipes, isLoading: recipesLoading } = useMyRecipes()
  const { data: favoriteIds } = useFavorites()
  const { data: favoriteRecipes, isLoading: favRecipesLoading } = useFavoriteRecipes()
  const { mutate: toggleFavorite } = useToggleFavorite()

  if (loading) return <PageLoader />
  if (!user) return null

  const displayName = user.displayName ?? user.fullName ?? user.email.split('@')[0]
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })

  // Categories from user's recipes; fall back to all categories
  const userCategories = Array.from(
    new Set((myRecipes ?? []).map((r) => r.category).filter(Boolean) as string[])
  )
  const cuisines = userCategories.length > 0 ? userCategories : [...CATEGORIES]

  const shownRecipes = (myRecipes ?? []).slice(0, 3)
  const shownFavourites = (favoriteRecipes ?? []).slice(0, 3)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-10">

        {/* Profile Header Card */}
        <div className="rounded-2xl bg-background shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl font-bold text-foreground">{displayName}</h1>
                  {/* <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified Chef
                  </span> */}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  @{displayName.toLowerCase().replace(/\s+/g, '')} · Member {memberSince}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>

          {user.bio && (
            <p className="text-sm text-foreground mb-3">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.email}</span>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="flex divide-x divide-border">
            <div className="flex-1 text-center px-4">
              <p className="text-xl font-bold text-foreground">{myRecipes?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Shared</p>
            </div>
            <div className="flex-1 text-center px-4">
              <p className="text-xl font-bold text-foreground">{favoriteIds?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Favourites</p>
            </div>
            <div className="flex-1 text-center px-4">
              <p className="text-xl font-bold text-foreground">
                {(myRecipes ?? []).reduce((sum, r) => sum + (r.likesCount ?? 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Likes</p>
            </div>
          </div>
        </div>

        {/* Shared Recipes */}
        <div className="rounded-2xl bg-background shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" /> Shared Recipes
            </h2>
            <Link to="/my-recipes" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {recipesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : shownRecipes.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground text-sm mb-3">You haven't shared any recipes yet.</p>
              <Button onClick={() => navigate('/post-recipe')}>Share your first recipe</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shownRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorited={favoriteIds?.includes(recipe.id)}
                  onToggleFavorite={(id, cur) => toggleFavorite({ recipeId: id, isFavorited: cur })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Saved Recipes */}
        <div className="rounded-2xl bg-background shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Saved Recipes
            </h2>
            {(favoriteRecipes?.length ?? 0) > 3 && (
              <Link to="/saved-recipes" className="text-sm text-primary hover:underline">
                View All ({favoriteRecipes!.length})
              </Link>
            )}
          </div>

          {favRecipesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : shownFavourites.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground text-sm mb-3">No saved recipes yet.</p>
              <Button variant="outline" onClick={() => navigate('/recipes')}>Browse Recipes</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shownFavourites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorited={true}
                  onToggleFavorite={(id, cur) => toggleFavorite({ recipeId: id, isFavorited: cur })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Favourite Cuisines */}
        <div className="rounded-2xl bg-background shadow-sm p-6 mb-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" /> Favourite Cuisines
          </h2>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <Badge
                key={cuisine}
                variant="secondary"
                className="text-sm px-3 py-1 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => navigate(`/recipes?category=${encodeURIComponent(cuisine)}`)}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold">Edit Profile</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ProfileForm
                user={user}
                onSuccess={async () => {
                  await refreshUser()
                  setEditOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

