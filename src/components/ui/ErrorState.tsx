import { Button } from './Button'

export function ErrorState({
  message,
  requestId,
  onRetry,
}: {
  message: string
  requestId?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-danger bg-danger-bg px-6 py-12 text-center"
    >
      <p className="text-body text-danger-text">{message}</p>
      {requestId && <p className="text-caption text-text-secondary">Reference: {requestId}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
