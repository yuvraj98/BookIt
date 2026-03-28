import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { EventCreationForm } from '@/components/organiser/EventCreationForm'

export const metadata: Metadata = {
  title: 'Create Event | Organiser Dashboard',
  description: 'Create a new event, set up seat sections and prices.',
}

export default function NewEventPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          <EventCreationForm />
        </div>
      </main>
    </>
  )
}
