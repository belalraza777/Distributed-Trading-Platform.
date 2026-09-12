"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#dbe7ff] border-t-[#2457d6]" />
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Loading
        </span>
      </div>
    </div>
  )
}