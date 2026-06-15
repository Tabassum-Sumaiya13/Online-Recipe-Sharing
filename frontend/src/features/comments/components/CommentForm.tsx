import { useRef, useState } from 'react'
import { Loader2, Star, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateComment } from '@/features/comments/api'
import { useAuth } from '@/providers/AuthProvider'
import api from '@/lib/axios'

interface CommentFormProps {
  recipeId: string
}

export function CommentForm({ recipeId }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useCreateComment(recipeId)

  if (!user) return null

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        '/upload/image',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (res.data.data?.url) setImageUrl(res.data.data.url)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    mutate({ content, rating: rating || undefined, imageUrl: imageUrl ?? undefined }, {
      onSuccess: () => {
        setContent('')
        setRating(0)
        setImageUrl(null)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setRating(v === rating ? 0 : v)}
            className="focus-visible:outline-none"
          >
            <Star
              className={`h-5 w-5 transition-colors ${v <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your thoughts…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="Comment attachment" className="max-h-32 rounded-lg object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-5 w-5"
            onClick={() => setImageUrl(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Add photo'}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f) }}
      />

      <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
        {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        Post Comment
      </Button>
    </form>
  )
}
