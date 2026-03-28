import Link from 'next/link'
import { Ticket, Twitter, Instagram, Linkedin, Github } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Browse Events', href: '/events' },
    { label: 'List an Event', href: '/organiser' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'For Enterprise', href: '/enterprise' },
  ],
  Categories: [
    { label: 'Comedy', href: '/events?category=comedy' },
    { label: 'Music', href: '/events?category=music' },
    { label: 'Sports', href: '/events?category=sports' },
    { label: 'Workshops', href: '/events?category=workshop' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold">BookIt</span>
            </Link>
            <p className="text-sm text-[#606060] leading-relaxed mb-6">
              India's local events ticketing platform. Discover, book, and attend.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-white/10 bg-white/5
                             flex items-center justify-center text-[#606060]
                             hover:text-white hover:border-white/20 hover:bg-white/10
                             transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#606060] hover:text-[#a0a0a0] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#606060]">
            © {new Date().getFullYear()} BookIt Platform Pvt. Ltd. Made with ❤️ in Pune.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#606060]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
