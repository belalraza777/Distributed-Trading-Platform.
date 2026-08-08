import Link from "next/link"
import { MdShowChart, MdAccountBalanceWallet, MdPieChart, MdSecurity } from "react-icons/md"

const features = [
  { icon: MdShowChart, title: "Live Market Data", desc: "Browse stocks and track prices in real time" },
  { icon: MdAccountBalanceWallet, title: "Wallet", desc: "Deposit and withdraw funds instantly" },
  { icon: MdPieChart, title: "Portfolio", desc: "Track your holdings, average cost and P&L" },
  { icon: MdSecurity, title: "Secure", desc: "JWT auth, role-based access, and ban protection" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
        <span className="font-bold text-blue-600 text-lg">TradePro</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Trade Stocks with Confidence
        </h1>
        <p className="text-gray-500 text-lg mt-4">
          A simple, fast, and secure platform to buy and sell stocks.
          Fund your wallet, track your portfolio, and stay on top of the market.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} TradePro. All rights reserved.
      </footer>

    </main>
  )
}