"use client"

interface Props {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 items-center">
          {action}
        </div>
      )}
    </div>
  )
}