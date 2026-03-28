'use client'

import { Share2, MessageCircle, Twitter, Link2, Copy, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ShareData {
  title: string
  text: string
  url: string
  city?: string
  date?: string
}

export function SocialShare({ data }: { data: ShareData }) {
  const [open, setOpen] = useState(false)
  const encoded = encodeURIComponent(data.text + '\n' + data.url)
  const encodedUrl = encodeURIComponent(data.url)
  const encodedTitle = encodeURIComponent(data.title)

  const channels = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-green-600 hover:bg-green-500',
      href: `https://wa.me/?text=${encoded}`,
    },
    {
      name: 'Twitter / X',
      icon: <Twitter size={20} />,
      color: 'bg-sky-600 hover:bg-sky-500',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodedUrl}`,
    },
    {
      name: 'Copy Link',
      icon: <Copy size={20} />,
      color: 'bg-surface-600 hover:bg-surface-500',
      action: () => {
        navigator.clipboard.writeText(data.url)
        toast.success('Link copied!')
        setOpen(false)
      },
    },
  ]

  return (
    <>
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: data.title, text: data.text, url: data.url })
          } else {
            setOpen(true)
          }
        }}
        className="btn-ghost flex items-center gap-2 text-sm"
      >
        <Share2 size={16} />
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setOpen(false)}>
          <div
            className="bg-surface-800 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Share Event</h3>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-sm text-text-muted mb-5 line-clamp-2">{data.title}</p>
            <div className="grid grid-cols-3 gap-3">
              {channels.map(ch => (
                ch.action ? (
                  <button
                    key={ch.name}
                    onClick={ch.action}
                    className={`${ch.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-white`}
                  >
                    {ch.icon}
                    <span className="text-xs font-medium">{ch.name}</span>
                  </button>
                ) : (
                  <a
                    key={ch.name}
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={`${ch.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-white`}
                  >
                    {ch.icon}
                    <span className="text-xs font-medium">{ch.name}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
