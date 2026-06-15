import { useRef, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2, GripVertical, ImagePlus, Video, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import api from '@/lib/axios'
import type { RecipeFormValues } from '../schemas'

function StepMediaPanel({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<RecipeFormValues>()
  const mediaUrl = watch(`instructions.${index}.mediaUrl`) ?? ''
  const mediaType = watch(`instructions.${index}.mediaType`)
  const [mode, setMode] = useState<'image' | 'video' | null>(
    mediaType ?? (mediaUrl ? 'image' : null),
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        '/upload/image',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (res.data.data?.url) {
        setValue(`instructions.${index}.mediaUrl`, res.data.data.url)
        setValue(`instructions.${index}.mediaType`, 'image')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    setValue(`instructions.${index}.mediaUrl`, '')
    setValue(`instructions.${index}.mediaType`, undefined)
    setMode(null)
  }

  if (mode === 'image') {
    return (
      <div className="mt-2 space-y-1.5">
        {mediaUrl ? (
          <div className="relative inline-block">
            <img src={mediaUrl} alt="Step media" className="max-h-32 rounded-lg object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-5 w-5" onClick={clear}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground hover:border-primary/50"
            onClick={() => !uploading && inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <span>{uploading ? 'Uploading…' : 'Click to upload step photo'}</span>
            <Button type="button" variant="ghost" size="icon" className="ml-auto h-5 w-5" onClick={(e) => { e.stopPropagation(); clear() }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
      </div>
    )
  }

  if (mode === 'video') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          placeholder="Paste video URL (YouTube, etc.)"
          className="flex-1 text-sm"
          value={mediaUrl}
          onChange={(e) => {
            setValue(`instructions.${index}.mediaUrl`, e.target.value)
            setValue(`instructions.${index}.mediaType`, 'video')
          }}
        />
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={clear}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-1.5 flex gap-1.5">
      <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={() => setMode('image')}>
        <ImagePlus className="h-3.5 w-3.5" /> Add photo
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={() => setMode('video')}>
        <Video className="h-3.5 w-3.5" /> Add video
      </Button>
    </div>
  )
}

export function StepByStepBuilder() {
  const { register, control, formState: { errors } } = useFormContext<RecipeFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'instructions' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Steps</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ step: '', position: fields.length })}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Step
        </Button>
      </div>

      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border bg-card p-3">
          <div className="flex items-start gap-2">
            <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <Textarea
              placeholder={`Step ${i + 1}…`}
              rows={2}
              className="flex-1"
              {...register(`instructions.${i}.step`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-1 h-9 w-9 shrink-0 text-destructive"
              onClick={() => remove(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="ml-12">
            <StepMediaPanel index={i} />
          </div>
        </div>
      ))}

      {(errors.instructions as unknown as { message?: string })?.message && (
        <p className="text-xs text-destructive">{(errors.instructions as unknown as { message?: string }).message}</p>
      )}
    </div>
  )
}
