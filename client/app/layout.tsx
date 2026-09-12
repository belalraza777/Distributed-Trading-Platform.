import "./globals.css"
import type { Metadata } from "next"
import { DM_Sans, Manrope } from "next/font/google"
import { Toaster } from "sonner"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "TradePro",
  description: "A microservices-based stock trading platform",
}

// root layout — wraps every single page in the app
// Toaster is here so toast notifications work on every page
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${manrope.variable} bg-[#f4f6f8] text-[#172033] antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}