import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'
import type { Recipe, RecipeFilters } from './types'

export const recipeKeys = {
  all: ['recipes'] as const,
  popular: () => [...recipeKeys.all, 'popular'] as const,
  mine: () => [...recipeKeys.all, 'mine'] as const,
  list: (f: RecipeFilters) => [...recipeKeys.all, 'list', f] as const,
  detail: (id: string) => [...recipeKeys.all, 'detail', id] as const,
}

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe[]> & { meta: PaginationMeta }>('/recipes', { params: filters })
      return res.data
    },
  })
}

export function usePopularRecipes() {
  return useQuery({
    queryKey: recipeKeys.popular(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe[]>>('/recipes/popular')
      return res.data.data
    },
  })
}

export function useMyRecipes() {
  return useQuery({
    queryKey: recipeKeys.mine(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe[]>>('/recipes/mine')
      return res.data.data
    },
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe>>(`/recipes/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export interface RecipeInput {
  title: string
  description?: string | null
  imageUrl?: string | null
  prepTime?: string | null
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category?: string | null
  servings: number
  calories: number
  youtubeId?: string | null
  popular?: boolean
  ingredients: { item: string; position: number }[]
  instructions: { step: string; position: number; mediaUrl?: string; mediaType?: string }[]
  nutrition?: { label: string; value: string }[]
  tags?: string[]
  images?: { url: string; position: number }[]
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: RecipeInput) => {
      const res = await api.post<ApiResponse<Recipe>>('/recipes', data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}

export function useUpdateRecipe(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Recipe>) => {
      const res = await api.patch<ApiResponse<Recipe>>(`/recipes/${id}`, data)
      return res.data.data
    },
    onSuccess: (updated) => {
      qc.setQueryData(recipeKeys.detail(id), updated)
      qc.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recipes/${id}`)
      return id
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: recipeKeys.mine() })
      const previous = qc.getQueryData<Recipe[]>(recipeKeys.mine())
      qc.setQueryData<Recipe[]>(recipeKeys.mine(), (old) => old?.filter((r) => r.id !== id) ?? [])
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(recipeKeys.mine(), context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}
