"use client"

interface Props {
  message: string
}

export default function EmptyState({ message }: Props) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
      <div className="text-center">
        <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-slate-200" />
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}