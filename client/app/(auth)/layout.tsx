// auth layout — no sidebar, no navbar
// just a clean centered card on a gray background
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4 py-10">
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="mb-8 text-center">
          <div className="display-font mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2457d6] text-lg font-bold text-white shadow-lg shadow-blue-200">T</div>
          <h1 className="display-font text-2xl font-bold text-[#172033]">Trade<span className="text-[#2457d6]">Pro</span></h1>
          <p className="mt-1 text-sm text-slate-500">Your market workspace</p>
        </div>
        {children}
      </div>
    </main>
  )
}