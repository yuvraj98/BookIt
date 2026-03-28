import type { Metadata } from 'next'
import { AdminEventsContent } from '@/components/admin/AdminEventsContent'

export const metadata: Metadata = {
  title: 'Events | Admin Control',
  description: 'Manage event listings.',
}

export default function AdminEventsPage() {
  return <AdminEventsContent />
}
