// auth layout — no sidebar, no navbar
// just a clean centered card on a gray background
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">TradePro</h1>
          <p className="text-sm text-gray-500 mt-1">Stock trading platform</p>
        </div>
        {children}
      </div>
    </main>
  )
}