"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
]

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem("auth_token")
    router.push("/login")
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-tight">By: FanzoftheOne</div>
            <Separator orientation="vertical" className="h-5" />
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border bg-card p-3">
            <nav className="flex flex-col gap-1">
              {nav.map((n) => {
                const active = pathname === n.href
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={[
                      "rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    ].join(" ")}
                  >
                    {n.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="rounded-xl border bg-card p-4">{children}</main>
        </div>
      </div>
    </div>
  )
}
