import Link from "next/link"
import { ScrollText, ArrowLeft } from "lucide-react"

export default function LogsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
          <ScrollText className="h-6 w-6 text-emerald-400/60" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-sm text-white/40">System log viewer coming soon.</p>
        <Link
          href="/"
          className="mt-2 flex items-center gap-2 rounded-lg bg-white/[0.06] px-4 py-2 text-sm text-white/60 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
