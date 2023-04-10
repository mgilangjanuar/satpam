import { UserContextAttributes } from '@/contexts/user'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useProtectedPages({ user, completeGetUser }: {
  user: UserContextAttributes | null, completeGetUser: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (completeGetUser && !user) {
      const isProtected = [
        /\/dashboard\/*/,
        '/profile'
      ].some((page) => {
        if (typeof page === 'string') {
          return router.pathname === page
        } else {
          return page.test(router.pathname)
        }
      })

      if (isProtected) {
        router.push('/auth/login')
      }
    }
  }, [router, completeGetUser, user])
}