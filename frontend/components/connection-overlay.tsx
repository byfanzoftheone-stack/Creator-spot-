"use client"

import { useEffect, useMemo, useState } from "react"

type Conn = {
  from: string
  to: string
  color?: string
  dashed?: boolean
  width?: number
}

export type ConnectionOverlayProps = {
  container: React.RefObject<HTMLElement>
  connections: Conn[]
}

/**
 * Draws smooth cubic-bezier connectors with arrowheads between elements
 * inside the given container. Elements must have data-conn-id="<id>".
 */
export function ConnectionOverlay({ container, connections }: ConnectionOverlayProps) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [paths, setPaths] = useState<
    { d: string; color: string; dashed: boolean; width: number; key: string }[]
  >([])

  useEffect(() => {
    if (!container.current) return
    const ro = new ResizeObserver(() => layout())
    ro.observe(container.current)
    window.addEventListener("resize", layout)
    layout()
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", layout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, connections])

  function layout() {
    const root = container.current!
    const rect = root.getBoundingClientRect()
    setSize({ w: rect.width, h: rect.height })

    const getPoint = (id: string) => {
      const el = root.querySelector(`[data-conn-id="${id}"]`) as HTMLElement | null
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cx = r.left - rect.left + r.width / 2
      const cy = r.top - rect.top + r.height / 2
      return { r, cx, cy }
    }

    const out: { d: string; color: string; dashed: boolean; width: number; key: string }[] = []

    for (const c of connections) {
      const A = getPoint(c.from)
      const B = getPoint(c.to)
      if (!A || !B) continue

      // Determine start/end on horizontal side closest to direction of travel
      const startOnRight = B.cx >= A.cx
      const sx = startOnRight ? A.r.right - rect.left : A.r.left - rect.left
      const sy = A.cy
      const ex = B.cx >= A.cx ? B.r.left - rect.left : B.r.right - rect.left
      const ey = B.cy

      const dx = Math.max(40, Math.abs(ex - sx) * 0.5)
      const c1x = sx + (startOnRight ? dx : -dx)
      const c1y = sy
      const c2x = ex - (startOnRight ? dx : -dx)
      const c2y = ey
      const d = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`

      out.push({
        d,
        color: c.color ?? "rgba(255,255,255,0.85)",
        dashed: !!c.dashed,
        width: c.width ?? 2.5,
        key: `${c.from}->${c.to}`,
      })
    }
    setPaths(out)
  }

  const defs = useMemo(
    () => (
      <defs>
        <marker id="arrow-white" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
        </marker>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="white" floodOpacity="0.35" />
        </filter>
      </defs>
    ),
    []
  )

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w} ${size.h}`}
      aria-hidden="true"
    >
      {defs}
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          fill="none"
          stroke={p.color}
          strokeWidth={p.width}
          strokeDasharray={p.dashed ? "6 6" : undefined}
          markerEnd="url(#arrow-white)"
          filter="url(#glow)"
        />
      ))}
    </svg>
  )
}
