import type { Metadata } from 'next'
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard | Admin Control',
  description: 'BookIt Platform Admin dashboard.',
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}
