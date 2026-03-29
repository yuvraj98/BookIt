import type { Metadata } from 'next'
import { AdminLogsContent } from '@/components/admin/AdminLogsContent'

export const metadata: Metadata = {
  title: 'Audit Logs | Admin',
  description: 'View all administrative actions and audit history.',
}

export default function AdminLogsPage() {
  return <AdminLogsContent />
}
