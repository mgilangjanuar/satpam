import { MenuItem } from '@/components/shell'
import { IconDevices, IconPassword, IconUser } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useUpdateMenu({ setMenu }: {
  setMenu: (menu: MenuItem[]) => void
}) {
  const router = useRouter()

  useEffect(() => {
    setMenu(router.pathname.startsWith('/dashboard') ? [
      { label: 'Services', href: '/dashboard', icon: <IconPassword size={18} /> },
      { label: 'Devices', href: '/dashboard/devices', icon: <IconDevices size={18} /> },
      { label: 'Profile', href: '/dashboard/profile', icon: <IconUser size={18} /> },
    ] : [])
  }, [setMenu, router.pathname])
}