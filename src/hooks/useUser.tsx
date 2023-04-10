import { UserContextAttributes } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { useEffect } from 'react'

export function useUser({ setUser, setCompleteGetUser }: {
  setUser: (user: UserContextAttributes | null) => void,
  setCompleteGetUser: (completeGetUser: boolean) => void
}) {
  useEffect(() => {
    setCompleteGetUser(false)
    f.get('/api/auth/me')
    .then(({ user }) => {
      setUser(user)
      setCompleteGetUser(true)
    })
    .catch(() => {
      setUser(null)
      setCompleteGetUser(true)
    })
  }, [setCompleteGetUser, setUser])
}