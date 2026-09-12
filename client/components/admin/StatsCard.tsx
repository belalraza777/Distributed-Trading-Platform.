"use client"

interface Props {
  label: string
  value: string | number
}

export default function StatsCard({ label, value }: Props) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="display-font mt-2 text-2xl font-bold text-[#172033]">{value}</p>
    </div>
  )
}