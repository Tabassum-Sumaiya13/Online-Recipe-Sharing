export interface Ingredient {
  id: number
  recipeId: string
  item: string
  position: number
}

export interface Instruction {
  id: number
  recipeId: string
  step: string
  position: number
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | null
}

export interface RecipeImage {
  id: number
  recipeId: string
  url: string
  position: number
}

export interface NutritionItem {
  id: number
  recipeId: string
  label: string
  value: string
}

export interface Tag {
  id: number
  recipeId: string
  tag: string
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  authorId: string | null
  authorName: string
  authorAvatar: string | null
  prepTime: string | null
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string | null
  rating: number
  reviewsCount: number
  likesCount: number
  servings: number
  calories: number
  youtubeId: string | null
  popular: boolean
  createdAt: string
  updatedAt: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  nutrition: NutritionItem[]
  tags: Tag[]
  images: RecipeImage[]
}

export interface RecipeFilters {
  search?: string
  category?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  sort?: 'newest' | 'popular' | 'rating'
  authorId?: string
  page?: number
  limit?: number
}
