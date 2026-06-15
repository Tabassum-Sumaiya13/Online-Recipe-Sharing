import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'

export interface Comment {
  id: string
  content: string
  rating: number | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export const commentKeys = {
  byRecipe: (recipeId: string) => ['comments', 'recipe', recipeId] as const,
}

export function useComments(recipeId: string) {
  return useQuery({
    queryKey: commentKeys.byRecipe(recipeId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Comment[]>>(`/comments/recipe/${recipeId}`)
      return res.data.data
    },
    enabled: !!recipeId,
  })
}

export function useCreateComment(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { content: string; rating?: number; imageUrl?: string }) => {
      const res = await api.post<ApiResponse<Comment>>(`/comments/recipe/${recipeId}`, data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byRecipe(recipeId) })
    },
  })
}

export function useDeleteComment(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byRecipe(recipeId) })
    },
  })
}
