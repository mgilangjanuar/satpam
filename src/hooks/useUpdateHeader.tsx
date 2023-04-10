import { MenuItem } from '@/components/shell'
import { UserContextAttributes } from '@/contexts/user'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useUpdateHeader({ user, setMenuHeader }: {
  user: UserContextAttributes | null,
  setMenuHeader: (menuHeader: MenuItem[]) => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      setMenuHeader([
        { label: 'Login', href: '/auth/login' }
      ])
    } else {
      setMenuHeader(router.pathname.startsWith('/dashboard') ? [] : [
        { label: 'Dashboard', href: '/dashboard' }
      ])
    }
  }, [user, setMenuHeader, router.pathname])
}