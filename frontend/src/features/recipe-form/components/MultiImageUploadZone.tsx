import { useRef, useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import api from '@/lib/axios'

interface MultiImageUploadZoneProps {
  /** Array of image URLs already added */
  values: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function MultiImageUploadZone({ values, onChange, maxImages = 8 }: MultiImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    const remaining = maxImages - values.length
    const toUpload = Array.from(files).slice(0, remaining)

    try {
      const formData = new FormData()
      toUpload.forEach((f) => formData.append('images', f))
      const res = await api.post<{ success: boolean; data: { urls: string[] } }>(
        '/upload/images',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (res.data.data?.urls) onChange([...values, ...res.data.data.urls])
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const canAdd = values.length < maxImages && !uploading

  return (
    <div className="space-y-2">
      <Label>Recipe Photos</Label>
      <p className="text-xs text-muted-foreground">
        Add up to {maxImages} photos. The first photo is used as the cover image.
      </p>

      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={url + i} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
            <img src={url} alt={`Recipe photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                Cover
              </span>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-0.5 top-0.5 h-5 w-5"
              onClick={() => remove(i)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">Add photo</span>
          </button>
        )}

        {uploading && (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-muted/20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
