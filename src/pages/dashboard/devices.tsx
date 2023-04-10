import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Badge, Button, Col, Container, Drawer, Grid, Group, Paper, Popover, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Device } from '@prisma/client'
import dayjs from 'dayjs'
import { useCallback, useContext, useEffect, useState } from 'react'

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [devices, setDevices] = useState<Device[]>([])
  const [drawerOpened, setDrawerOpened] = useState<Device>()
  const form = useForm<Device>()

  const fetchDevices = useCallback(async () => {
    const { devices } = await f.get('/api/devices')
    setDevices(devices)
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const update = async (values: Device) => {
    try {
      await f.patch(`/api/devices/${values.id}`, values)
      fetchDevices()
      setDrawerOpened(undefined)
      showNotification({
        title: 'Success',
        message: 'Your device has been updated',
        color: 'teal'
      })
    } catch (e: any) {
      showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })
    }
  }

  const remove = async (id: string) => {
    try {
      await f.delete(`/api/devices/${id}`)
      fetchDevices()
      showNotification({
        title: 'Success',
        message: 'Your device has been revoked',
        color: 'teal'
      })
    } catch (e: any) {
      showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })
    }
  }

  return <Container fluid>
    <Grid>
      <Col span={12} lg={6} md={8} sm={10}>
        <Title order={2}>
          Your Devices
        </Title>

        {devices.map(device => <Paper key={device.id} p="md" mt="md" shadow="sm">
          <Group>
            <Title order={4} fw="normal">
              {device.name}
            </Title>
            {localStorage.getItem(`deviceId:${user?.id}`) === device.id ? <Badge>
              this device
            </Badge> : <></>}
          </Group>
          <Text color="dimmed" mt="xs">
            Added at {dayjs(device.createdAt).format('MMMM D, YYYY H:mm')}
          </Text>
          <Group mt="lg">
            <Button size="sm" color="yellow" variant="light" onClick={() => {
              setDrawerOpened(device)
              form.setValues(device)
            }}>
              Update
            </Button>
            <Popover width={280} withArrow>
              <Popover.Target>
                <Button size="sm" color="red" variant="light">
                  Revoke
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Text>
                  Are you sure you want to revoke this device?
                </Text>
                <Group mt="sm" position="right">
                  <Button size="sm" color="red" onClick={() => remove(device.id)}>
                    Yes, I&apos;m confirm
                  </Button>
                </Group>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Paper>)}
      </Col>
    </Grid>

    <Drawer
      opened={Boolean(drawerOpened)}
      onClose={() => setDrawerOpened(undefined)}
      position="right" size="md"
      title="Update Device">
      <form onSubmit={form.onSubmit(update)}>
        <TextInput
          label="Name"
          required
          withAsterisk
          {...form.getInputProps('name')}
        />
        <Group mt="md" position="right">
          <Button size="sm" color="yellow" variant="light" type="submit">
            Update
          </Button>
        </Group>
      </form>
    </Drawer>
  </Container>
}