// AuthContext — global authentication state with localStorage persistence
// Ready for Go backend JWT auth integration

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const DEFAULT_MOCK_USER = {
  id: 'u_nasim',
  name: 'Abu Nasim',
  username: 'Error-nasim',
  avatar: 'AN',
  bio: 'Student developer & competitive gamer. Building stuff by day, climbing ranks by night. CSE 416 @ Stony Brook.',
  teamUps: 24,
  lobbiesHosted: 5,
  reliability: 98,
  rating: 4.9,
  tags: ['#gaming', '#valorant', '#coding', '#ranked', '#competitive', '#fps'],
}

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    const saved = localStorage.getItem('findmate_is_authed')
    return saved === 'true'
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('findmate_auth_user')
      return savedUser ? JSON.parse(savedUser) : DEFAULT_MOCK_USER
    } catch {
      return DEFAULT_MOCK_USER
    }
  })

  useEffect(() => {
    localStorage.setItem('findmate_is_authed', String(isAuthed))
  }, [isAuthed])

  useEffect(() => {
    if (user) {
      localStorage.setItem('findmate_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('findmate_auth_user')
    }
  }, [user])

  const login = (userData = DEFAULT_MOCK_USER) => {
    const mergedUser = {
      ...DEFAULT_MOCK_USER,
      ...userData,
      avatar: userData.name
        ? userData.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : 'AN',
    }
    setUser(mergedUser)
    setIsAuthed(true)
  }

  const logout = () => {
    setIsAuthed(false)
    localStorage.removeItem('findmate_is_authed')
  }

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ isAuthed, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
