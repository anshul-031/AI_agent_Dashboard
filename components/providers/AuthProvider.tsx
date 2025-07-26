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
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('auth-token', data.token)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('auth-token')
      if (savedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setToken(savedToken)
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth-token')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('auth-token')
        }
      } else if (process.env.NODE_ENV === 'development') {
        // Auto-login in development with default admin credentials
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'admin@company.com', password: 'password' }),
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setToken(data.token)
            localStorage.setItem('auth-token', data.token)
            console.log('Auto-logged in with admin credentials for development')
          }
        } catch (error) {
          console.log('Auto-login failed, user will need to login manually')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth-token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
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