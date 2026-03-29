'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Info, CheckCircle2, IndianRupee } from 'lucide-react'

interface Seat {
  id: string
  label: string
  status: 'available' | 'locked' | 'booked'
  row_number: number
  col_number: number
  seat_sections: { event_id: string }
}

interface SeatSection {
  id: string
  label: string
  price: number
  total_seats: number
  available_seats: number
  row_count: number
  col_count: number
}

interface Props {
  sections: SeatSection[]
  seats: Seat[]
  selectedIds: Set<string>
  onToggle: (seatId: string) => void
  maxSelectable?: number
}

const SECTION_COLORS = [
  { bg: 'bg-purple-500', ring: 'ring-purple-400', text: 'text-purple-400', hex: '#a855f7' },
  { bg: 'bg-blue-500', ring: 'ring-blue-400', text: 'text-blue-400', hex: '#3b82f6' },
  { bg: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-emerald-400', hex: '#10b981' },
  { bg: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-amber-400', hex: '#f59e0b' },
  { bg: 'bg-rose-500', ring: 'ring-rose-400', text: 'text-rose-400', hex: '#f43f5e' },
]

export function InteractiveSeatMap({ sections, seats, selectedIds, onToggle, maxSelectable = 10 }: Props) {
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; seat: Seat; section: SeatSection } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const seatsBySection = new Map<string, Seat[]>()
  seats.forEach(s => {
    const list = seatsBySection.get((s as any).section_id) || []
    list.push(s)
    seatsBySection.set((s as any).section_id, list)
  })

  const getSeatColor = (seat: Seat, sectionIdx: number) => {
    if (selectedIds.has(seat.id)) return 'bg-brand-500 ring-2 ring-brand-400 scale-110 shadow-glow z-10'
    if (seat.status === 'booked') return 'bg-surface-700 opacity-30 cursor-not-allowed'
    if (seat.status === 'locked') return 'bg-yellow-600/50 opacity-50 cursor-not-allowed'
    const c = SECTION_COLORS[sectionIdx % SECTION_COLORS.length]
    return `${c.bg}/30 hover:${c.bg}/70 cursor-pointer ring-1 ring-white/10 hover:ring-2 hover:${c.ring} hover:scale-110`
  }

  return (
    <div className="card p-4 md:p-6 bg-surface-900 border border-white/5">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Select Your Seats
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="btn-ghost p-2 rounded-lg">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-text-muted font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="btn-ghost p-2 rounded-lg">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(1)} className="btn-ghost p-2 rounded-lg">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="relative mx-auto mb-6 max-w-md">
        <div className="h-8 rounded-t-[100%] bg-gradient-to-b from-brand-500/30 to-transparent border-t-2 border-brand-500/50 flex items-start justify-center pt-1">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Stage</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div ref={containerRef} className="overflow-auto max-h-[500px] pb-4" style={{ cursor: 'grab' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
          {sections.map((section, sIdx) => {
            const sectionSeats = seatsBySection.get(section.id) || []
            if (sectionSeats.length === 0) return null
            const color = SECTION_COLORS[sIdx % SECTION_COLORS.length]

            // Build grid
            const grid: (Seat | null)[][] = []
            for (let r = 1; r <= section.row_count; r++) {
              const row: (Seat | null)[] = []
              for (let c = 1; c <= section.col_count; c++) {
                const seat = sectionSeats.find(s => s.row_number === r && s.col_number === c)
                row.push(seat || null)
              }
              grid.push(row)
            }

            return (
              <div key={section.id} className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-3 h-3 rounded-sm ${color.bg}`} />
                  <span className="text-sm font-bold text-white">{section.label}</span>
                  <span className={`text-xs ${color.text}`}>₹{section.price}</span>
                  <span className="text-xs text-text-subtle ml-auto">
                    {section.available_seats}/{section.total_seats} left
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {grid.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-1">
                      <span className="w-5 text-[10px] text-text-subtle text-right mr-1 font-mono">
                        {String.fromCharCode(65 + ri)}
                      </span>
                      {row.map((seat, ci) => {
                        if (!seat) return <div key={ci} className="w-7 h-7" />
                        const isSelected = selectedIds.has(seat.id)
                        const isAvailable = seat.status === 'available'
                        return (
                          <button
                            key={seat.id}
                            disabled={!isAvailable && !isSelected}
                            onClick={() => {
                              if (isSelected || selectedIds.size < maxSelectable) onToggle(seat.id)
                            }}
                            onMouseEnter={(e) => setTooltip({
                              x: e.clientX, y: e.clientY, seat, section
                            })}
                            onMouseLeave={() => setTooltip(null)}
                            className={`w-7 h-7 rounded-md text-[9px] font-bold transition-all duration-200 relative ${getSeatColor(seat, sIdx)}`}
                            title={`${seat.label} — ₹${section.price}`}
                          >
                            {isSelected && <CheckCircle2 size={12} className="text-white mx-auto" />}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-surface-600 border border-white/10" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-brand-500 shadow-glow" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-surface-700 opacity-30" />
          Booked
        </div>
        {selectedIds.size > 0 && (
          <span className="ml-auto text-brand-400 font-bold">
            {selectedIds.size} seat{selectedIds.size > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-surface-800 border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="text-sm font-bold text-white">{tooltip.seat.label}</p>
          <p className="text-xs text-text-muted">{tooltip.section.label} — ₹{tooltip.section.price}</p>
        </div>
      )}
    </div>
  )
}
