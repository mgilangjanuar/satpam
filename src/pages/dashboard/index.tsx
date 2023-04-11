import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Button, Col, Container, Grid, Group, Modal, NumberInput, PasswordInput, Select, Tabs, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Service } from '@prisma/client'
import { useCallback, useContext, useEffect, useState } from 'react'

interface CreateForm {
  url: string,
  username?: string,
  password?: string,
  name?: string,
  secret?: string,
  digits?: number,
  period?: number,
  algorithm?: string
}

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [services, setServices] = useState<Service[]>([])
  const [opened, setOpened] = useState<boolean>(false)
  const [filters, setFilters] = useState<{
    skip: number,
    take: number,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    skip: 0,
    take: 10,
    orderBy: 'url:asc',
    search: {}
  })
  const createForm = useForm({
    initialValues: {
      url: '',
      username: '',
      password: '',
      name: '',
      secret: '',
      digits: 6,
      period: 30,
      algorithm: 'SHA-1'
    }
  })

  const fetchAll = useCallback(async () => {
    if (user) {
      try {
        const { services } = await f.post(`/api/services?${
          new URLSearchParams({
            _skip: filters.skip.toString(),
            _take: filters.take.toString(),
            _orderBy: filters.orderBy
          })}`, { _search: {} }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
        setServices(services)
      } catch (error: any) {
        showNotification({
          title: 'Error',
          message: error.message,
          color: 'red',
        })
      }
    }
  }, [user, filters])

  const create = async (data: CreateForm) => {
    try {
      const { service } = await f.post('/api/services', {
        url: data.url,
      }, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })
      if (data.username || data.password) {
        await f.post(`/api/services/${service.id}/passwords`, {
          username: data.username,
          password: data.password
        }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
      }
      if (data.secret) {
        await f.post(`/api/services/${service.id}/authenticators`, {
          name: data.name || new URL(data.url).host,
          secret: data.secret,
          digits: data.digits,
          period: data.period,
          algorithm: data.algorithm
        }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
      }

      fetchAll()
      setOpened(false)
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    }
  }

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return <Container fluid>
    <Grid>
      <Col span={12} lg={6} md={8} sm={10}>
        <Group position="apart" mb="lg">
          <Title order={2}>
            Your Credentials
          </Title>
          <Button size="sm" color="blue" variant="light" onClick={() => setOpened(true)}>
            Create
          </Button>
        </Group>
      </Col>
    </Grid>

    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Create a new credential">
      <form onSubmit={createForm.onSubmit(create)}>
        <TextInput
          label="URL"
          type="url"
          required
          withAsterisk
          {...createForm.getInputProps('url')}
        />
        <Tabs defaultValue="password" mt="md">
          <Tabs.List>
            <Tabs.Tab value="password">Password</Tabs.Tab>
            <Tabs.Tab value="authenticator">Authenticator</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="password">
            <TextInput
              mt="md"
              label="Username"
              {...createForm.getInputProps('username')}
            />
            <PasswordInput
              mt="md"
              label="Password"
              type="password"
              {...createForm.getInputProps('password')}
            />
          </Tabs.Panel>
          <Tabs.Panel value="authenticator">
            <TextInput
              mt="md"
              label="Name"
              {...createForm.getInputProps('name')}
            />
            <TextInput
              mt="md"
              label="Secret"
              {...createForm.getInputProps('secret')}
            />
            <NumberInput
              mt="md"
              label="Digits"
              {...createForm.getInputProps('digits')}
            />
            <NumberInput
              mt="md"
              label="Period"
              {...createForm.getInputProps('period')}
            />
            <Select
              mt="md"
              data={[
                'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384',
                'SHA-512', 'SHA3-224', 'SHA3-256',
                'SHA3-384', 'SHA3-512']}
              label="Algorithm"
              {...createForm.getInputProps('algorithm')}
            />
          </Tabs.Panel>
        </Tabs>

        <Group position="right" mt="lg">
          <Button type="submit" variant="light">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  </Container>
}