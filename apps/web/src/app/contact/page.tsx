import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — BookIt',
  description: 'Get in touch with the BookIt team for support, partnerships, or feedback.',
}

const CONTACT_METHODS = [
  {
    icon: <Mail size={24} className="text-brand-400" />,
    title: 'Email Support',
    description: 'For general inquiries and support',
    value: 'support@bookit.in',
    href: 'mailto:support@bookit.in',
  },
  {
    icon: <Phone size={24} className="text-emerald-400" />,
    title: 'Phone',
    description: 'Mon–Sat, 9 AM – 8 PM IST',
    value: '+91 20 1234 5678',
    href: 'tel:+912012345678',
  },
  {
    icon: <MessageCircle size={24} className="text-blue-400" />,
    title: 'WhatsApp',
    description: 'Quick responses via WhatsApp',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
  },
  {
    icon: <MapPin size={24} className="text-purple-400" />,
    title: 'Office',
    description: 'BookIt Platform Pvt. Ltd.',
    value: 'Kalyani Nagar, Pune 411006',
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              Have a question, feedback, or partnership idea? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {CONTACT_METHODS.map((method, i) => (
              <div key={i} className="card p-8 group hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-surface-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-lg font-display font-bold mb-1">{method.title}</h3>
                <p className="text-sm text-text-muted mb-3">{method.description}</p>
                {method.href ? (
                  <a href={method.href} className="text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors">
                    {method.value}
                  </a>
                ) : (
                  <p className="text-white font-medium text-sm">{method.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="card p-8 text-center bg-surface-800/30">
            <Clock size={24} className="text-brand-500 mx-auto mb-3" />
            <h3 className="text-lg font-display font-bold mb-2">Response Times</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              We typically respond to emails within 4 hours during business hours (Mon–Sat, 9 AM – 8 PM IST). 
              WhatsApp messages are usually answered within 30 minutes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
