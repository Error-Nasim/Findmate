// AuthContext — global authentication state with localStorage persistence & JWT support
// Real platform users: Abu Nasim (Main Admin), Rimon Chandra Bhowmik, Al Imtiaz

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const DEFAULT_USER_TEMPLATE = {
  reliability: 98,
  rating: 5.0,
  teamUps: 0,
  lobbiesHosted: 0,
  roomsJoined: 0,
  roomsCompleted: 0,
  bio: 'Ready to team up and find great teammates!',
  tags: ['#gaming'],
}

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    const saved = localStorage.getItem('findmate_is_authed')
    const token = localStorage.getItem('findmate_jwt_token')
    return saved === 'true' && Boolean(token)
  })

  const [user, setUser] = useState(() => {
    try {
      const isAuth = localStorage.getItem('findmate_is_authed') === 'true'
      const savedUser = localStorage.getItem('findmate_auth_user')
      if (isAuth && savedUser) {
        const parsed = JSON.parse(savedUser)
        const isNasim =
          parsed.handle?.toLowerCase() === 'error-nasim' ||
          (parsed.name && parsed.name.toLowerCase().includes('nasim'))
        if (parsed.avatar === 'AN' && !isNasim) {
          if (parsed.name) {
            parsed.avatar = parsed.name
              .trim()
              .split(/\s+/)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)
          } else if (parsed.handle) {
            parsed.avatar = parsed.handle.substring(0, 2).toUpperCase()
          }
        }
        return parsed
      }
      return null
    } catch {
      return null
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

  const login = (userData = {}, token = '') => {
    const handle = userData.handle || userData.username || 'member'
    const cleanHandle = handle.replace(/^@/, '')
    const isNasim =
      cleanHandle.toLowerCase() === 'error-nasim' ||
      (userData.name && userData.name.toLowerCase().includes('nasim'))

    const role =
      isNasim || userData.role === 'superadmin'
        ? 'superadmin'
        : userData.role === 'admin'
        ? 'admin'
        : userData.role || 'member'

    let initials = 'ME'
    if (userData.avatar && (isNasim || userData.avatar !== 'AN')) {
      initials = userData.avatar
    } else if (userData.name) {
      initials = userData.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    } else if (cleanHandle) {
      initials = cleanHandle.substring(0, 2).toUpperCase()
    }

    let linkedAccounts = userData.linkedAccounts
    if (!linkedAccounts) {
      const p = userData.provider || (userData.email?.includes('gmail') ? 'google' : '')
      linkedAccounts = [
        { id: 'google', label: 'Google', connected: p === 'google' },
        { id: 'discord', label: 'Discord', connected: p === 'discord' },
        { id: 'facebook', label: 'Facebook', connected: p === 'facebook' },
      ]
    }

    const formattedUser = {
      ...DEFAULT_USER_TEMPLATE,
      ...userData,
      handle: cleanHandle,
      username: cleanHandle,
      role,
      avatar: initials,
      linkedAccounts,
    }

    setUser(formattedUser)
    setIsAuthed(true)
    if (token) {
      localStorage.setItem('findmate_jwt_token', token)
    }
  }

  const logout = () => {
    setIsAuthed(false)
    setUser(null)
    localStorage.removeItem('findmate_is_authed')
    localStorage.removeItem('findmate_auth_user')
    localStorage.removeItem('findmate_jwt_token')
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
