import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — BookIt',
  description: 'Stories, guides, and insights about events, ticketing, and the BookIt platform.',
}

const POSTS = [
  {
    title: 'How We Built Real-Time Seat Selection',
    category: 'Engineering',
    date: 'Mar 15, 2026',
    excerpt: 'A deep dive into the interactive seat map system that handles concurrent bookings for thousands of users.',
    gradient: 'from-blue-600/20 to-cyan-900/40',
  },
  {
    title: '5 Tips to Sell Out Your Next Event',
    category: 'For Organisers',
    date: 'Mar 10, 2026',
    excerpt: 'From pricing strategy to social media, here is how BookIt organisers are maximizing ticket sales.',
    gradient: 'from-purple-600/20 to-violet-900/40',
  },
  {
    title: 'The Rise of Local Events in Tier-2 Cities',
    category: 'Insights',
    date: 'Mar 5, 2026',
    excerpt: 'Data-driven analysis of how comedy, music, and wellness events are booming beyond metros.',
    gradient: 'from-amber-600/20 to-orange-900/40',
  },
  {
    title: 'Introducing Loyalty Coins: Rewarding Our Community',
    category: 'Product',
    date: 'Feb 28, 2026',
    excerpt: 'Earn coins on every booking and redeem them for discounts. Our way of saying thanks.',
    gradient: 'from-emerald-600/20 to-teal-900/40',
  },
]

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              The BookIt <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-text-muted text-lg">Stories, guides, and insights from the events world.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {POSTS.map((post, i) => (
              <article key={i} className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className={`h-40 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <Sparkles className="text-white/20 group-hover:text-white/40 transition-colors" size={48} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge-brand text-[10px]">{post.category}</span>
                    <span className="text-xs text-text-subtle">{post.date}</span>
                  </div>
                  <h2 className="text-lg font-display font-bold mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-muted line-clamp-2">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-text-muted text-sm">More posts coming soon. Stay tuned!</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
