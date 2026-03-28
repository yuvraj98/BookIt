import type { Metadata } from 'next'
import { OrganiserAnalyticsContent } from '@/components/organiser/OrganiserAnalyticsContent'

export const metadata: Metadata = {
  title: 'Revenue Analytics | Organiser',
  description: 'Per-event revenue breakdown and payout analytics.',
}

export default function OrganiserAnalyticsPage() {
  return <OrganiserAnalyticsContent />
}
