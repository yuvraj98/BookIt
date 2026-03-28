import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to BookIt with your mobile number.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-surface-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />
      </div>

      <LoginForm />
    </main>
  )
}
