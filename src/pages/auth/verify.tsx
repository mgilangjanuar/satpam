import { f } from '@/lib/fetch'
import { Group, Loader, Paper, Stack, Text, Title, rem } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Verify() {
  const router = useRouter()

  useEffect(() => {
    const verify = async () => {
      try {
        await f.post('/api/auth/verification', {
          type: 'emailVerification',
          token: router.query.token
        })
        showNotification({
          title: 'Success',
          message: 'Your account has been verified',
          color: 'teal'
        })
        router.push('/auth/login')
      } catch (error: any) {
        showNotification({
          title: 'Error',
          message: error.message,
          color: 'red'
        })
      }
    }
    if (router.query.token) {
      verify()
    }
  }, [router])


  return <Stack mih={`calc(100vh - ${rem(92)})`} align="center" justify="center">
    <Paper withBorder p="md" maw={480} w="100%">
      <Title order={2}>Verification</Title>
      <Text mb="lg" mt="xs" color="dimmed">
        Please wait while we verify your account.
      </Text>
      <Group>
        <Loader variant="dots" />
        <Text>
          Verifying...
        </Text>
      </Group>
    </Paper>
  </Stack>
}