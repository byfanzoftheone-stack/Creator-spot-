"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api, Task, Stats } from "@/lib/api-client"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setErr(null)
    try {
      const [s, t] = await Promise.all([api.stats(), api.listTasks()])
      setStats(s)
      setTasks(t.slice(0, 6))
    } catch (e: any) {
      const msg = e?.message || "Failed"
      setErr(msg)
      if (msg.toLowerCase().includes("invalid token") || msg.toLowerCase().includes("user not found")) {
        localStorage.removeItem("auth_token")
        router.push("/login")
      }
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) router.push("/login")
    else load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell title="Dashboard">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Today</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/tasks")}>Open Tasks</Button>
          <Button onClick={load}>Refresh</Button>
        </div>
      </div>

      {err ? <div className="mt-4 text-sm text-red-500 whitespace-pre-wrap">{err}</div> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Productivity</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.productivity_score ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Done today</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.done_today ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Doing</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.doing ?? "-"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Todo</div>
          <div className="mt-1 text-3xl font-semibold">{stats?.todo ?? "-"}</div>
        </Card>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent tasks</h3>
          <Button variant="link" onClick={() => router.push("/tasks")}>Manage</Button>
        </div>
        <div className="mt-2 grid gap-2">
          {tasks.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">No tasks yet. Create one in Tasks.</Card>
          ) : (
            tasks.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.status} • priority {t.priority}</div>
                </div>
                <div className="text-xs text-muted-foreground">{t.due_date ? `Due ${t.due_date}` : ""}</div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
