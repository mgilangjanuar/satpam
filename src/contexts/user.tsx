import { createContext } from 'react'

export interface UserContext {
  id: string,
  name: string,
  email: string
}

export const User = createContext<{ user: UserContext | null, setUser: (user: UserContext) => void }>({
  user: null,
  setUser: () => {},
})