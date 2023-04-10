import { MenuItem } from '@/components/shell'
import { IconUser } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useUpdateMenu({ setMenu }: {
  setMenu: (menu: MenuItem[]) => void
}) {
  const router = useRouter()

  useEffect(() => {
    setMenu(router.pathname.startsWith('/dashboard') ? [
      { label: 'Profile', href: '/profile', icon: <IconUser size={18} /> },
    ] : [])
  }, [setMenu, router.pathname])
}