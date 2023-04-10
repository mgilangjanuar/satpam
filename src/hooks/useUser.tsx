import { UserContextAttributes } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useUser({ setUser, setCompleteGetUser }: {
  setUser: (user: UserContextAttributes | null) => void,
  setCompleteGetUser: (completeGetUser: boolean) => void
}) {
  const router = useRouter()

  useEffect(() => {
    setCompleteGetUser(false)
    f.get('/api/auth/me')
    .then(({ user }) => {
      setUser(user)
      setCompleteGetUser(true)
      if (!localStorage.getItem(`privateKey:${user.id}`) || !localStorage.getItem(`deviceId:${user.id}`)) {
        showNotification({
          title: 'Warning',
          message: 'Your device is not registered. Please register your device to continue using the app.',
          color: 'yellow',
          onClick: () => router.push('/dashboard/devices'),
          onClose: () => router.push('/dashboard/devices')
        })
      }
    })
    .catch(() => {
      setUser(null)
      setCompleteGetUser(true)
    })
  }, [setCompleteGetUser, setUser, router])
}