"use client"

interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorMessage({ message = "Something went wrong", onRetry }: Props) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
      <p className="text-red-500 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-blue-600 hover:underline">
          Try again
        </button>
      )}
    </div>
  )
}