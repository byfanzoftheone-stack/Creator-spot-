"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Server, Database, Layout, Wrench, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type PipelineStage = "idle" | "infrastructure" | "backend" | "frontend" | "devtools" | "rendering" | "complete"

const STAGES: { key: PipelineStage; label: string; icon: typeof Server; color: string; accent: string; delay: number }[] = [
  { key: "infrastructure", label: "Infrastructure", icon: Server, color: "bg-yellow-500/20", accent: "text-yellow-400", delay: 0 },
  { key: "backend", label: "Backend", icon: Database, color: "bg-green-500/20", accent: "text-green-400", delay: 600 },
  { key: "frontend", label: "Frontend", icon: Layout, color: "bg-cyan-500/20", accent: "text-cyan-400", delay: 1200 },
  { key: "devtools", label: "Dev Tools", icon: Wrench, color: "bg-purple-500/20", accent: "text-purple-300", delay: 1800 },
]

export function ComingSoonGenerator() {
  const [description, setDescription] = useState("")
  const [stage, setStage] = useState<PipelineStage>("idle")
  const [generatedHTML, setGeneratedHTML] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [expandPreview, setExpandPreview] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const isProcessing = stage !== "idle" && stage !== "complete"

  const advanceStages = useCallback(() => {
    STAGES.forEach(({ key, delay }) => {
      setTimeout(() => setStage(key), delay)
    })
    setTimeout(() => {
      setStage("rendering")
    }, 2400)
  }, [])

  const generate = useCallback(async () => {
    if (!description.trim() || isProcessing) return

    setGeneratedHTML("")
    setExpandPreview(false)
    setIsStreaming(true)

    // Start pipeline animation
    advanceStages()

    abortRef.current = new AbortController()

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setGeneratedHTML(fullText)
      }

      setStage("complete")
      setIsStreaming(false)
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Generation error:", err)
        setStage("idle")
        setIsStreaming(false)
      }
    }
  }, [description, isProcessing, advanceStages])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStage("idle")
    setGeneratedHTML("")
    setExpandPreview(false)
    setIsStreaming(false)
  }, [])

  // Auto-scroll to preview when HTML first arrives
  const hasScrolledRef = useRef(false)
  useEffect(() => {
    if (generatedHTML && !hasScrolledRef.current && previewRef.current) {
      hasScrolledRef.current = true
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
    if (!generatedHTML) {
      hasScrolledRef.current = false
    }
  }, [generatedHTML])

  const stageIndex = STAGES.findIndex((s) => s.key === stage)
  const isRendering = stage === "rendering"
  const isComplete = stage === "complete"

  return (
    <div className="mt-3 flex flex-col gap-3">
      {/* Input area */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-semibold text-white/90">UI Generator</span>
          <span className="ml-auto text-xs text-white/40">Powered by the full stack</span>
        </div>

        <Textarea
          placeholder="Describe the UI you want to build... e.g. 'A dashboard with analytics cards, a sidebar navigation, and a dark theme with charts'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] resize-none border-white/10 bg-black/40 text-sm text-white/90 placeholder:text-white/30 focus-visible:ring-orange-500/40"
          disabled={isProcessing || isStreaming}
        />

        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={generate}
            disabled={!description.trim() || isProcessing || isStreaming}
            className="bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40"
          >
            {isProcessing || isStreaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate UI
              </>
            )}
          </Button>
          {(isComplete || isStreaming) && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-white/60 hover:bg-white/10 hover:text-white/90">
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline visualization */}
      {stage !== "idle" && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-800/60 to-neutral-900/80 p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            Stack Pipeline
          </div>

          <div className="flex flex-col gap-2">
            {STAGES.map((s, idx) => {
              const Icon = s.icon
              const isActive = s.key === stage
              const isPast = stageIndex > idx || isRendering || isComplete
              const isFuture = !isActive && !isPast

              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                    isActive && `${s.color} ring-1 ring-white/20`,
                    isPast && "bg-white/5",
                    isFuture && "opacity-30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-500",
                      isActive && `${s.color} ring-1 ring-white/20`,
                      isPast && "bg-white/10"
                    )}
                  >
                    {isActive ? (
                      <Loader2 className={cn("h-4 w-4 animate-spin", s.accent)} />
                    ) : isPast ? (
                      <Icon className={cn("h-4 w-4", s.accent)} />
                    ) : (
                      <Icon className="h-4 w-4 text-white/30" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isActive ? s.accent : isPast ? "text-white/70" : "text-white/30"
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-white/40">
                      {isActive
                        ? "Processing..."
                        : isPast
                          ? "Complete"
                          : "Waiting"}
                    </span>
                  </div>

                  {/* Progress indicator */}
                  <div className="ml-auto">
                    {isPast && !isActive && (
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                    {isActive && (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                    )}
                  </div>

                  {/* Connector handled by gap spacing */}
                </div>
              )
            })}

            {/* Rendering stage */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                isRendering && "bg-orange-500/15 ring-1 ring-orange-500/30",
                isComplete && "bg-white/5",
                !isRendering && !isComplete && "opacity-30"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isRendering && "bg-orange-500/20 ring-1 ring-orange-500/30",
                  isComplete && "bg-emerald-500/20"
                )}
              >
                {isRendering ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                ) : isComplete ? (
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white/30" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isRendering
                      ? "text-orange-400"
                      : isComplete
                        ? "text-emerald-400"
                        : "text-white/30"
                  )}
                >
                  {isComplete ? "UI Ready" : "Rendering Output"}
                </span>
                <span className="text-xs text-white/40">
                  {isRendering
                    ? "Building from stack..."
                    : isComplete
                      ? "Framework delivered"
                      : "Waiting"}
                </span>
              </div>
              {isComplete && <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
            </div>
          </div>
        </div>
      )}

      {/* Live preview area — visible as soon as HTML starts streaming */}
      {generatedHTML && (
        <div ref={previewRef} className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 text-xs text-white/50">
                {isStreaming ? "Building live preview..." : "Generated UI Preview"}
              </span>
              {isStreaming && <Loader2 className="h-3 w-3 animate-spin text-orange-400" />}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandPreview((e) => !e)}
              className="h-7 text-xs text-white/50 hover:bg-white/10 hover:text-white/80"
            >
              {expandPreview ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" /> Expand
                </>
              )}
            </Button>
          </div>
          <div
            className={cn(
              "transition-all duration-300",
              expandPreview ? "h-[600px]" : "h-[320px]"
            )}
          >
            <iframe
              title="Generated UI preview"
              sandbox="allow-scripts"
              className="h-full w-full border-0 bg-white"
              srcDoc={generatedHTML}
            />
          </div>
        </div>
      )}
    </div>
  )
}
