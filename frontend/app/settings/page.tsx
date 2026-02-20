"use client"

import { AppShell } from "@/components/app-shell"
import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Frontend API URL</div>
          <div className="mt-1 font-mono text-sm">NEXT_PUBLIC_API_URL</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Set this in Vercel to your Railway backend base URL (no <span className="font-mono">/api</span> at the end).
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Auth Token</div>
          <div className="mt-2 text-sm text-muted-foreground">
            This app stores your JWT token in <span className="font-mono">localStorage</span> as{" "}
            <span className="font-mono">auth_token</span>.
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
