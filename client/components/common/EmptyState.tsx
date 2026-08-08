"use client"

interface Props {
  message: string
}

export default function EmptyState({ message }: Props) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}