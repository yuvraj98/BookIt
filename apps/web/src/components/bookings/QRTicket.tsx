'use client'

import { useMemo } from 'react'
import { QrCode, Download, Share2, Calendar, MapPin, Ticket, Clock } from 'lucide-react'

interface TicketData {
  bookingId: string
  qrToken: string
  eventTitle: string
  venueName: string
  city: string
  startsAt: string
  seatLabels: string[]
  totalAmount: number
  userName: string
}

export function QRTicket({ ticket }: { ticket: TicketData }) {
  const qrUrl = useMemo(() => {
    // Use a free QR code API
    const data = encodeURIComponent(`bookit://verify/${ticket.qrToken}`)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}&bgcolor=1a1a2e&color=ffffff&format=svg`
  }, [ticket.qrToken])

  const eventDate = new Date(ticket.startsAt)
  const day = eventDate.toLocaleDateString('en-IN', { weekday: 'short' })
  const date = eventDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  const handleShare = async () => {
    const text = `🎟️ I'm going to ${ticket.eventTitle} on ${date}! Booked via BookIt.`
    if (navigator.share) {
      await navigator.share({ title: 'My BookIt Ticket', text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Ticket Card */}
      <div className="relative bg-gradient-to-br from-surface-800 to-surface-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Section */}
        <div className="p-6 pb-4 bg-gradient-to-r from-brand-600/20 to-purple-600/20 border-b border-dashed border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-brand-400 mb-2">
                <Ticket size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">BookIt Pass</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white leading-tight mb-3">
                {ticket.eventTitle}
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar size={14} className="text-blue-400" />
                  <span>{day}, {date} • {time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{ticket.venueName}, {ticket.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tear Effect */}
        <div className="relative h-4">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-950" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-950" />
          <div className="border-t border-dashed border-white/10 absolute top-1/2 left-5 right-5" />
        </div>

        {/* Bottom Section */}
        <div className="p-6 pt-2">
          <div className="flex items-center gap-4">
            {/* QR Code */}
            <div className="bg-white rounded-2xl p-2 shadow-lg flex-shrink-0">
              <img src={qrUrl} alt="QR Code" width={120} height={120} className="rounded-lg" />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] text-text-subtle uppercase tracking-wider font-bold">Seats</p>
                <p className="text-white font-bold text-sm">
                  {ticket.seatLabels.length > 0 ? ticket.seatLabels.join(', ') : 'General'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-subtle uppercase tracking-wider font-bold">Attendee</p>
                <p className="text-white font-medium text-sm">{ticket.userName}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-subtle uppercase tracking-wider font-bold">Amount Paid</p>
                <p className="text-brand-400 font-display font-bold">₹{ticket.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-text-subtle font-mono">ID: {ticket.bookingId.slice(0, 12)}...</p>
            <div className="flex gap-2">
              <button onClick={handleShare} className="btn-ghost p-2 rounded-lg" title="Share">
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
