import { Star, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useComments, useDeleteComment } from '@/features/comments/api'
import { useAuth } from '@/providers/AuthProvider'

interface CommentListProps {
  recipeId: string
}

export function CommentList({ recipeId }: CommentListProps) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(recipeId)
  const { mutate: deleteComment } = useDeleteComment(recipeId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!comments?.length) {
    return <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={comment.user.avatarUrl ?? undefined} />
            <AvatarFallback>{(comment.user.displayName ?? 'U')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.user.displayName ?? 'Anonymous'}</span>
              {comment.rating && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {comment.rating}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{comment.content}</p>
            {comment.imageUrl && (
              <a href={comment.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                <img
                  src={comment.imageUrl}
                  alt="Comment attachment"
                  className="max-h-48 rounded-lg object-cover border"
                />
              </a>
            )}
          </div>
          {user?.id === comment.user.id && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => deleteComment(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
