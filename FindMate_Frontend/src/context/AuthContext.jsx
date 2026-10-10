// AuthContext — global authentication state
// Provides: isAuthed, user, login(), logout()

import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock user data — will come from Go backend later
const MOCK_USER = {
  id: 'u1',
  name: 'Alex Rivera',
  username: 'alexr',
  avatar: 'AR',
  bio: 'Gamer, coder, weekend hooper 🏀',
  teamUps: 12,
  lobbiesHosted: 4,
  reliability: 96,
  rating: 4.9,
}

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [user, setUser] = useState(null)

  // login — accepts user data (or uses mock)
  const login = (userData = MOCK_USER) => {
    setUser(userData)
    setIsAuthed(true)
  }

  // logout — clears everything
  const logout = () => {
    setUser(null)
    setIsAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthed, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component: const { isAuthed, user } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
