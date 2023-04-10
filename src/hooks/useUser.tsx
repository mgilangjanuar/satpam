import { UserContextAttributes } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Box, Button, Group, Text } from '@mantine/core'
import { notifications, showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export function useUser({ setUser, setCompleteGetUser }: {
  setUser: (user: UserContextAttributes | null) => void,
  setCompleteGetUser: (completeGetUser: boolean) => void
}) {
  const router = useRouter()
  const [userLoggedIn, setUserLoggedIn] = useState<UserContextAttributes | null>(null)
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    setCompleteGetUser(false)
    f.get('/api/auth/me')
    .then(({ user }) => {
      setUser(user)
      setCompleteGetUser(true)
      setUserLoggedIn(user)
    })
    .catch(() => {
      setUser(null)
      setCompleteGetUser(true)
    })
  }, [setCompleteGetUser, setUser, router])

  useEffect(() => {
    if (userLoggedIn && !showNotif) {
      if (!localStorage.getItem(`privateKey:${userLoggedIn.id}`) || !localStorage.getItem(`deviceId:${userLoggedIn.id}`)) {
        showNotification({
          title: 'Warning',
          id: 'device-not-registered',
          message: <Box>
            <Text>
              Your device is not registered. Please register your device to continue using the app.
            </Text>
            <Group mt="md" position="right">
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  router.push('/dashboard/devices')
                  notifications.hide('device-not-registered')
                }}
              >
                Register Device
              </Button>
            </Group>
          </Box>,
          color: 'yellow',
        })
        setShowNotif(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn, showNotif])
}