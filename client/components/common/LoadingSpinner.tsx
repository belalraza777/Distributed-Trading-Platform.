"use client"

export default function LoadingSpinner() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}