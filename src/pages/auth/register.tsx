import { f } from '@/lib/fetch'
import { Button, Group, Loader, Paper, PasswordInput, Stack, Text, TextInput, Title, rem } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface RegisterForm {
  name: string
  email: string,
  password: string
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timer, setTimer] = useState(0)
  const form = useForm<RegisterForm>({
    initialValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
  }, [timer])

  const register = async (values: RegisterForm) => {
    setLoading(true)
    try {
      await f.post('/api/auth/register', values)
      showNotification({
        title: 'Success',
        message: 'Please check your email to verify your account',
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
        type: 'emailVerification',
        email: form.values.email
      })
      showNotification({
        title: 'Success',
        message: 'Please check your email to verify your account',
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
      {submitted && form.values.email ? <>
        <Title order={2}>Resend Verification Email</Title>
        <Text mb="lg" mt="xs" color="dimmed">
          Resend verification email to {form.values.email}.
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
        <Title order={2}>Register</Title>
        <Text mb="lg" mt="xs" color="dimmed">
          Register your account.
        </Text>
        <form onSubmit={form.onSubmit(register)}>
          <TextInput
            label="Name"
            type="name"
            required
            withAsterisk
            {...form.getInputProps('name')} />
          <TextInput
            mt="md"
            label="Email"
            type="email"
            required
            withAsterisk
            {...form.getInputProps('email')} />
          <PasswordInput
            mt="md"
            label="Password"
            required
            withAsterisk
            {...form.getInputProps('password')} />
          <Group position="apart" mt="md">
            <Link href="/auth/login">
              Back to login
            </Link>
            <Button type="submit" loading={loading}>
              Register
            </Button>
          </Group>
        </form>
      </>}
    </Paper>
  </Stack>
}