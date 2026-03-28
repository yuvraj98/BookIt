import type { Metadata } from 'next'
import { EventCreationForm } from '@/components/organiser/EventCreationForm'
import { OrganiserSidebar } from '@/components/organiser/OrganiserSidebar'

export const metadata: Metadata = {
  title: 'Create Event | Organiser Dashboard',
  description: 'Create a new event, set up seat sections and prices.',
}

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex">
      <OrganiserSidebar />
      <main className="flex-1 lg:ml-64 relative w-full overflow-x-hidden min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-800/10 to-transparent">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="p-6 md:p-10 max-w-4xl">
          <EventCreationForm />
        </div>
      </main>
    </div>
  )
}
