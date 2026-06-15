import type { Instruction } from '@/features/recipes/types'

interface StepsListProps {
  instructions: Instruction[]
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function StepsList({ instructions }: StepsListProps) {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-semibold">Instructions</h3>
      <ol className="space-y-5">
        {instructions
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((ins, i) => (
            <li key={ins.id} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex-1 space-y-2 pt-0.5">
                <p className="text-sm leading-relaxed">{ins.step}</p>
                {ins.mediaUrl && ins.mediaType === 'image' && (
                  <img
                    src={ins.mediaUrl}
                    alt={`Step ${i + 1}`}
                    className="max-h-48 rounded-lg object-cover border"
                  />
                )}
                {ins.mediaUrl && ins.mediaType === 'video' && isYouTubeUrl(ins.mediaUrl) && (
                  <div className="aspect-video max-w-sm overflow-hidden rounded-lg border">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(ins.mediaUrl)}`}
                      title={`Step ${i + 1} video`}
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                )}
                {ins.mediaUrl && ins.mediaType === 'video' && !isYouTubeUrl(ins.mediaUrl) && (
                  <video src={ins.mediaUrl} controls className="max-h-48 rounded-lg border" />
                )}
              </div>
            </li>
          ))}
      </ol>
    </div>
  )
}
