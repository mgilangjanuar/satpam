import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Button, Divider, Group, Paper, PasswordInput, Stack, Text, TextInput, Title, UnstyledButton, rem } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

interface LoginForm {
  email: string,
  password: string
}

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(UserContext)
  const form = useForm<LoginForm>({
    initialValues: {
      email: '',
      password: ''
    }
  })

  const login = async (values: LoginForm) => {
    setLoading(true)
    try {
      await f.post('/api/auth/login', values)
      const { user } = await f.get('/api/auth/me')
      setUser(user)
      showNotification({
        title: 'Success',
        message: 'You have been logged in',
        color: 'teal'
      })
      router.push('/dashboard')
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
      <Title order={2}>Login</Title>
      <Text mb="lg" mt="xs" color="dimmed">
        Login to your account.
      </Text>
      <form onSubmit={form.onSubmit(login)}>
        <TextInput
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
          <UnstyledButton component={Link} href="/auth/forgot">
            <Text color="blue">Forgot password?</Text>
          </UnstyledButton>
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </Group>
        <Divider my="lg" label="Or" labelPosition="center" />
        <Group>
          <Text color="dimmed">Don&apos;t have an account?</Text>
          <UnstyledButton component={Link} href="/auth/register">
            <Text color="blue">Register</Text>
          </UnstyledButton>
        </Group>
      </form>
    </Paper>
  </Stack>
}