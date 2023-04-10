import pkg from '@/../package.json'
import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { ActionIcon, Box, Button, Col, Container, Divider, Grid, Group, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconCheck } from '@tabler/icons-react'
import { useContext, useEffect, useState } from 'react'

interface NameForm {
  name: string
}

interface EmailForm {
  email: string
}

interface PasswordForm {
  password: string,
  newPassword: string,
  confirmNewPassword: string
}

export default function Profile() {
  const { user, setUser } = useContext(UserContext)
  const [loadingName, setLoadingName] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const formName = useForm<NameForm>({
    initialValues: { name: user?.name || '' }
  })
  const formEmail = useForm<EmailForm>({
    initialValues: { email: user?.email || '' }
  })
  const formPassword = useForm<PasswordForm>({
    initialValues: {
      password: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    validate: {
      confirmNewPassword: (value, { newPassword }) => value !== newPassword ? 'Passwords do not match' : null
    }
  })

  const updateName = async (values: NameForm) => {
    setLoadingName(true)
    try {
      await f.patch('/api/profile/me', values)
      const { user } = await f.get('/api/auth/me')
      setUser(user)
      showNotification({
        title: 'Success',
        message: 'Your name has been updated',
        color: 'teal'
      })
    } catch (e: any) {
      showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })
    } finally {
      setLoadingName(false)
    }
  }

  const updateEmail = async (values: EmailForm) => {
    setLoadingEmail(true)
    try {
      await f.patch('/api/profile/me/changeemail', values)
      showNotification({
        title: 'Success',
        message: 'Please check your email for a verification link',
        color: 'teal'
      })
      setUser(null)
    } catch (e: any) {
      showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })
    } finally {
      setLoadingEmail(false)
    }
  }

  const updatePassword = async (values: PasswordForm) => {
    setLoadingPassword(true)
    try {
      await f.patch('/api/profile/me/changepassword', {
        password: values.password,
        newPassword: values.newPassword
      })
      showNotification({
        title: 'Success',
        message: 'Your password has been updated. Please login again.',
        color: 'teal'
      })
      setUser(null)
    } catch (e: any) {
      showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })
    } finally {
      setLoadingPassword(false)
    }
  }

  const logout = async () => {
    await f.post('/api/auth/logout', {})
    setUser(null)
    showNotification({
      title: 'Success',
      message: 'You have been logged out',
      color: 'teal'
    })
  }

  useEffect(() => {
    if (user) {
      formName.setValues({ name: user.name })
      formEmail.setValues({ email: user.email })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return <Container>
    <Grid>
      <Col span={12} md={8} offsetMd={2} sm={10} offsetSm={1}>
        <Title order={3}>
          Hello, {user?.name}!
        </Title>

        <Paper p="md" mt="lg" pb="xl" mb="xl" shadow="xs">
          <form onSubmit={formName.onSubmit(updateName)}>
            <Group align="end">
              <TextInput
                label="Name"
                style={{ flexGrow: 1 }}
                required
                withAsterisk
                {...formName.getInputProps('name')}
              />
              <ActionIcon
                size="lg"
                type="submit"
                color="teal"
                variant="subtle"
                loading={loadingName}>
                <IconCheck size={18} />
              </ActionIcon>
            </Group>
          </form>

          <form onSubmit={formEmail.onSubmit(updateEmail)}>
            <Group mt="md" align="end">
              <TextInput
                label="Email"
                type="email"
                style={{ flexGrow: 1 }}
                required
                withAsterisk
                description="You will need to verify your new email address"
                {...formEmail.getInputProps('email')}
              />
              <ActionIcon
                size="lg"
                type="submit"
                color="teal"
                variant="subtle"
                loading={loadingEmail}>
                <IconCheck size={18} />
              </ActionIcon>
            </Group>
          </form>

          <Divider my="xl" label="Danger Zone" />

          <form onSubmit={formPassword.onSubmit(updatePassword)}>
            <Group align="end">
              <Box style={{ flexGrow: 1 }}>
                <PasswordInput
                  label="Old Password"
                  required
                  withAsterisk
                  {...formPassword.getInputProps('password')}
                />
                <PasswordInput
                  mt="md"
                  label="New Password"
                  required
                  withAsterisk
                  {...formPassword.getInputProps('newPassword')}
                />
                <PasswordInput
                  mt="md"
                  label="New Password Confirmation"
                  required
                  withAsterisk
                  {...formPassword.getInputProps('confirmNewPassword')}
                />
              </Box>
              <ActionIcon
                size="lg"
                type="submit"
                color="teal"
                variant="subtle"
                loading={loadingPassword}>
                <IconCheck size={18} />
              </ActionIcon>
            </Group>
          </form>
        </Paper>

        <Grid mt="lg">
          <Col span={12} md={6} offsetMd={3}>
            <Button color="red" fullWidth onClick={logout}>
              Logout
            </Button>
            <Text ta="center" mt="xs" color="dimmed" size="sm">
              v{pkg.version}
            </Text>
          </Col>
        </Grid>
      </Col>
    </Grid>
  </Container>
}