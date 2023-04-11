import { MenuItem } from '@/components/shell'
import { IconCreditCard, IconDevices, IconUser } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useUpdateMenu({ setMenu }: {
  setMenu: (menu: MenuItem[]) => void
}) {
  const router = useRouter()

  useEffect(() => {
    setMenu(router.pathname.startsWith('/dashboard') ? [
      { label: 'Credentials', href: '/dashboard', icon: <IconCreditCard size={18} /> },
      { label: 'Devices', href: '/dashboard/devices', icon: <IconDevices size={18} /> },
      { label: 'Profile', href: '/dashboard/profile', icon: <IconUser size={18} /> },
    ] : [])
  }, [setMenu, router.pathname])
}