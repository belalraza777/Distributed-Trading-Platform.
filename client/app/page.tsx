import Link from "next/link"
import {
  MdShowChart,
  MdAccountBalanceWallet,
  MdPieChart,
  MdSecurity,
} from "react-icons/md"

const features = [
  {
    icon: MdShowChart,
    title: "Live Market Data",
    desc: "Browse stocks and track prices in real time",
  },
  {
    icon: MdAccountBalanceWallet,
    title: "Wallet",
    desc: "Deposit and withdraw funds instantly",
  },
  {
    icon: MdPieChart,
    title: "Portfolio",
    desc: "Track your holdings, average cost and P&L",
  },
  {
    icon: MdSecurity,
    title: "Secure",
    desc: "JWT auth, role-based access, and ban protection",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* navbar */}
      <nav className="border-b border-gray-200 bg-white px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-blue-600"
          >
            TradePro
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-gray-600 transition hover:text-blue-600 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="text-sm text-gray-600 transition hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* project notice */}
      <div className="border-b border-amber-100 bg-amber-50 px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-center text-center">
          <p className="text-xs leading-5 text-amber-800 sm:text-sm">
            <span className="font-semibold">Personal learning project:</span>{" "}
            TradePro is a portfolio/showcase project built to demonstrate
            frontend, backend, authentication, and microservices architecture
            skills. It is <span className="font-semibold">not intended for real trading or financial use.</span>
          </p>
        </div>
      </div>

      {/* hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
          Learning • Microservices • Full-Stack Project
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Trade Stocks with{" "}
          <span className="text-blue-600">Confidence</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          A simple, fast, and secure stock trading platform built as a
          personal project to explore modern full-stack development,
          microservices architecture, authentication, and financial workflows.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/register"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto"
          >
            Login
          </Link>

          <Link
            href="/dashboard"
            className="w-full rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 sm:w-auto"
          >
            View Dashboard
          </Link>
        </div>

        <p className="mt-5 text-xs text-gray-400">
          Demo application only • No real money or real trades
        </p>
      </section>

      {/* features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Built to Explore Real-World Architecture
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            A hands-on project for learning and demonstrating full-stack
            engineering concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition group-hover:bg-blue-100">
                  <Icon size={21} className="text-blue-600" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* architecture / learning section */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Architecture
              </p>
              <h3 className="mt-2 font-semibold text-gray-900">
                Microservices
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Designed to explore service-based architecture and
                communication between independent backend services.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Authentication
              </p>
              <h3 className="mt-2 font-semibold text-gray-900">
                Secure Access
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Includes JWT authentication, protected routes, role-based
                access, and user account controls.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Purpose
              </p>
              <h3 className="mt-2 font-semibold text-gray-900">
                Learning & Showcase
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Created to learn, experiment, and showcase software engineering
                skills. This application is not a financial product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-gray-200 bg-white py-7 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} TradePro. Personal learning &
          portfolio project.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Not intended for real trading, investment, or financial use.
        </p>
      </footer>
    </main>
  )
}