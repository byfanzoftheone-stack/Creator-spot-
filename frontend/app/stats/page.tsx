"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api, Stats } from "@/lib/api-client"

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setErr(null)
    try {
      setStats(await api.stats())
    } catch (e: any) {
      setErr(e?.message || "Failed")
      localStorage.removeItem("auth_token")
      router.push("/login")
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) router.push("/login")
    else load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell title="Stats">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Stats</h2>
        <Button onClick={load} variant="outline">Refresh</Button>
      </div>

      {err ? <div className="mt-4 text-sm text-red-500 whitespace-pre-wrap">{err}</div> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total tasks</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.total ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Done</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.done ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Done today</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.done_today ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Todo</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.todo ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Doing</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.doing ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Productivity score</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.productivity_score ?? "-"}</div>
        </Card>
      </div>
    </AppShell>
  )
}
