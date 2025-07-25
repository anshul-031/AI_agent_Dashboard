'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user based on email
    const mockUser: User = {
      id: '1',
      email,
      name: email === 'admin@company.com' ? 'Admin User' : 'John Doe',
      role: email === 'admin@company.com' ? 'admin' : 'operator',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    }
    
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}