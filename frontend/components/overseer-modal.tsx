"use client"

import { useState } from "react"
import { Loader2, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { api } from "@/lib/api-client"

export function OverseerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [idea, setIdea] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)

  async function handleSubmit() {
    if (!idea.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const data = await api.oversee(idea.trim())
      setResponse(data.approval)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setIdea("")
    setError(null)
    setResponse(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-neutral-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            Submit Idea to Overseer
          </DialogTitle>
          <DialogDescription>
            Describe your idea and the Overseer will review it for feasibility, scope, and alignment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Input */}
          <Textarea
            placeholder="Describe your idea, feature request, or architectural proposal..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-[120px] resize-none border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/30 focus-visible:ring-purple-500/40"
            disabled={loading}
          />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !idea.trim()}
              className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
            {response && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-white/50 hover:bg-white/10 hover:text-white/80"
              >
                New Idea
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-4 py-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400/70">
                Overseer Response
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                {response}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
