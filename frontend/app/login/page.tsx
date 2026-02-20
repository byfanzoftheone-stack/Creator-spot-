"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setErr(null)
    setLoading(true)
    try {
      const res = mode === "login" ? await api.login(email, password) : await api.register(email, password)
      localStorage.setItem("auth_token", res.access_token)
      router.push("/dashboard")
    } catch (e: any) {
      setErr(e?.message || "Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-sm text-muted-foreground">By: FanzoftheOne</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Productivity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Login to start tracking output.</p>

        <div className="mt-5 grid gap-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err ? <div className="text-sm text-red-500 whitespace-pre-wrap">{err}</div> : null}
          <Button onClick={submit} disabled={loading || !email || !password}>
            {loading ? "Working..." : mode === "login" ? "Login" : "Create account"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
          >
            {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
