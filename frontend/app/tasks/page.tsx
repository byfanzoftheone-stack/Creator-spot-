"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { api, Task } from "@/lib/api-client"

const statuses: Task["status"][] = ["todo", "doing", "done"]

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Task["status"]>("todo")
  const [priority, setPriority] = useState<1 | 2 | 3>(2)

  async function load() {
    setErr(null)
    setLoading(true)
    try {
      setTasks(await api.listTasks())
    } catch (e: any) {
      setErr(e?.message || "Failed")
      localStorage.removeItem("auth_token")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) router.push("/login")
    else load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function create() {
    setErr(null)
    try {
      await api.createTask({ title, description, status, priority })
      setTitle("")
      setDescription("")
      setStatus("todo")
      setPriority(2)
      await load()
    } catch (e: any) {
      setErr(e?.message || "Create failed")
    }
  }

  async function setTaskStatus(t: Task, next: Task["status"]) {
    try {
      const updated = await api.updateTask(t.id, { status: next })
      setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (e: any) {
      setErr(e?.message || "Update failed")
    }
  }

  async function remove(t: Task) {
    try {
      await api.deleteTask(t.id)
      setTasks((prev) => prev.filter((x) => x.id !== t.id))
    } catch (e: any) {
      setErr(e?.message || "Delete failed")
    }
  }

  const grouped = useMemo(() => {
    const g: Record<Task["status"], Task[]> = { todo: [], doing: [], done: [] }
    for (const t of tasks) g[t.status].push(t)
    return g
  }, [tasks])

  return (
    <AppShell title="Tasks">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {err ? <div className="mt-4 text-sm text-red-500 whitespace-pre-wrap">{err}</div> : null}

      <Card className="mt-4 p-4">
        <div className="grid gap-3">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-muted-foreground">Status</div>
            {statuses.map((s) => (
              <Button key={s} variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)} size="sm">
                {s}
              </Button>
            ))}
            <div className="mx-2 h-5 w-px bg-border" />
            <div className="text-sm text-muted-foreground">Priority</div>
            {[1,2,3].map((p) => (
              <Button key={p} variant={priority === p ? "default" : "outline"} onClick={() => setPriority(p as any)} size="sm">
                {p}
              </Button>
            ))}
            <div className="flex-1" />
            <Button onClick={create} disabled={!title.trim()}>
              Add task
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {statuses.map((s) => (
          <div key={s} className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground uppercase">{s}</div>
            <div className="grid gap-2">
              {grouped[s].length === 0 ? (
                <Card className="p-3 text-sm text-muted-foreground">Empty</Card>
              ) : (
                grouped[s].map((t) => (
                  <Card key={t.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        {t.description ? <div className="text-xs text-muted-foreground mt-1">{t.description}</div> : null}
                        <div className="text-xs text-muted-foreground mt-1">priority {t.priority}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => remove(t)}>Delete</Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {statuses.map((nx) => (
                        <Button
                          key={nx}
                          size="sm"
                          variant={t.status === nx ? "default" : "outline"}
                          onClick={() => setTaskStatus(t, nx)}
                          disabled={t.status === nx}
                        >
                          {nx}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
