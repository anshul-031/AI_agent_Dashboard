import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/toaster'


export const metadata: Metadata = {
  title: 'AI Agent Dashboard',
  description: 'Comprehensive dashboard for managing AI agents and monitoring their execution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}