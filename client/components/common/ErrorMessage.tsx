"use client"

interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorMessage({ message = "Something went wrong", onRetry }: Props) {
  return (
    <div className="panel-shadow flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-500">!</div>
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-[#2457d6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d47b2]">
          Try again
        </button>
      )}
    </div>
  )
}