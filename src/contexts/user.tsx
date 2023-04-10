import { createContext } from 'react'

export interface UserContextAttributes {
  id: string,
  name: string,
  email: string
}

export const UserContext = createContext<{
  user: UserContextAttributes | null,
  completeGetUser: boolean,
  setUser: (user: UserContextAttributes | null) => void
}>({
  user: null,
  completeGetUser: true,
  setUser: () => {},
})