import { f } from '@/lib/fetch'
import { Button, Group, Paper, PasswordInput, Stack, Text, TextInput, Title, rem } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ResetForm {
  newPassword: string
}

export default function Reset() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<ResetForm>({
    initialValues: {
      newPassword: ''
    }
  })

  const reset = async (values: ResetForm) => {
    setLoading(true)
    try {
      await f.post('/api/auth/verification', {
        ...values,
        type: 'passwordReset',
        token: router.query.token
      })
      showNotification({
        title: 'Success',
        message: 'Your password has been reset',
        color: 'teal'
      })
      router.push('/auth/login')
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  return <Stack mih={`calc(100vh - ${rem(92)})`} align="center" justify="center">
    <Paper withBorder p="md" maw={480} w="100%">
      <Title order={2}>Reset password</Title>
      <Text mb="lg" mt="xs" color="dimmed">
        Enter your new password.
      </Text>
      <form onSubmit={form.onSubmit(reset)}>
        <PasswordInput
          label="New password"
          required
          withAsterisk
          {...form.getInputProps('newPassword')} />
        <Group position="right" mt="md">
          <Button type="submit" loading={loading}>
            Reset
          </Button>
        </Group>
      </form>
    </Paper>
  </Stack>
}