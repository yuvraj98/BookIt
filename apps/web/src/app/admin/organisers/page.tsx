import type { Metadata } from 'next'
import { AdminOrganisersContent } from '@/components/admin/AdminOrganisersContent'

export const metadata: Metadata = {
  title: 'Organisers | Admin Control',
  description: 'Manage creator approvals.',
}

export default function AdminOrganisersPage() {
  return <AdminOrganisersContent />
}
