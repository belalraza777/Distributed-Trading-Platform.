"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/Auth.service"
import { useAuthStore } from "@/store/Auth.store"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const { setAuth,user } = useAuthStore()
    console.log(user) // Debugging statement to confirm store initialization

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !password) return toast.error("Please fill in all fields")

        setLoading(true)
        try {
            const { user, accessToken } = await authService.login({ email, password })
            setAuth(user, accessToken)
            toast.success(`Welcome back, ${user.name}!`)
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Login</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"

                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                    Register
                </Link>
            </p>
        </div>
    )
}