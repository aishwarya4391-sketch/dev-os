import { runCopy } from '@/lib/copy'

// Rendered as plain text only: never as HTML or markdown (the agent output is untrusted).
export function AgentExplanation({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-primary p-4">
      <p className="text-caption text-text-secondary">{runCopy.explanationLabel}</p>
      <p className="whitespace-pre-wrap text-body text-text-primary">{text}</p>
    </div>
  )
}
