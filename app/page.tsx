'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dashboard } from '@/components/dashboard/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}