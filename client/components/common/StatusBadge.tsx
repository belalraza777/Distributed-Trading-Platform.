"use client"

type Status = "PENDING" | "EXECUTED" | "CANCELLED" | "COMPLETED" | "FAILED" | "BUY" | "SELL"

interface Props {
  status: Status
}

const styles: Record<Status, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  EXECUTED:  "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  FAILED:    "bg-red-100 text-red-700",
  BUY:       "bg-blue-100 text-blue-700",
  SELL:      "bg-orange-100 text-orange-700",
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}