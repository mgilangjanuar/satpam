import { f } from '@/lib/fetch'
import { Button, Group, Loader, Paper, Stack, Text, TextInput, Title, rem } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ForgotForm {
  email: string
}

export default function Forgot() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timer, setTimer] = useState(0)
  const form = useForm<ForgotForm>({
    initialValues: {
      email: ''
    }
  })

  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
  }, [timer])

  const forgotPassword = async (values: ForgotForm) => {
    setLoading(true)
    try {
      await f.post('/api/auth/forgotpassword', values)
      showNotification({
        title: 'Success',
        message: 'Check your email for a link to reset your password',
        color: 'teal'
      })
      setSubmitted(true)
      setTimer(60)
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

  const resend = async () => {
    setLoading(true)
    try {
      await f.post('/api/auth/resend', {
        type: 'passwordReset',
        email: form.values.email
      })
      showNotification({
        title: 'Success',
        message: 'Please check your email to reset your password',
        color: 'teal'
      })
      setTimer(60)
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
      {submitted ? <>
        <Title order={2}>Resend Reset Password Email</Title>
        <Text mb="lg" mt="xs" color="dimmed">
          Resend the reset password email to {form.values.email}.
        </Text>
        <Group>
          <Button
            variant="light"
            disabled={timer > 0}
            onClick={resend}
            loading={loading}
            leftIcon={timer > 0 ? <Loader variant="dots" /> : null}>
            Resend{timer > 0 ? ` in ${timer} seconds` : ''}
          </Button>
        </Group>
      </> : <>
        <Title order={2}>Forgot Password</Title>
        <Text mb="lg" mt="xs" color="dimmed">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Text>
        <form onSubmit={form.onSubmit(forgotPassword)}>
          <TextInput
            label="Email"
            type="email"
            required
            withAsterisk
            {...form.getInputProps('email')} />
          <Group position="apart" mt="md">
            <Link href="/auth/login">
              Back to login
            </Link>
            <Button type="submit" loading={loading}>
              Reset
            </Button>
          </Group>
        </form>
      </>}
    </Paper>
  </Stack>
}