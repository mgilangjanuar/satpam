import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { ActionIcon, Badge, Box, Button, Col, Container, Drawer, Grid, Group, Image, List, MediaQuery, Menu, Paper, Popover, Select, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Device } from '@prisma/client'
import { IconDevicesOff, IconDotsVertical, IconEdit, IconNetwork, IconQrcode } from '@tabler/icons-react'
import dayjs from 'dayjs'
import NodeRSA from 'node-rsa'
import QrCode from 'qrcode'
import { useCallback, useContext, useEffect, useState } from 'react'
import QrReader from 'react-qr-scanner'
import { UAParser } from 'ua-parser-js'

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [devices, setDevices] = useState<Device[]>([])
  const [drawerOpened, setDrawerOpened] = useState<Device>()
  const [modalOpened, setModalOpened] = useState<'qrreader' | 'qrcode'>()
  const [thisDevice, setThisDevice] = useState<string | null>(null)
  const [privKey, setPrivKey] = useState<string | null>(null)
  const [camDevices, setCamDevices] = useState<MediaDeviceInfo[]>()
  const [camDeviceId, setCamDeviceId] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [scanComplete, setScanComplete] = useState(false)
  const form = useForm<Device>()

  const fetchDevices = useCallback(async () => {
    const { devices } = await f.get('/api/devices')
    setDevices(devices)
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  useEffect(() => {
    if (user) {
      setThisDevice(localStorage.getItem(`deviceId:${user?.id}`))
      setPrivKey(localStorage.getItem(`privateKey:${user?.id}`))

      QrCode.toDataURL(localStorage.getItem(`privateKey:${user?.id}`) as string)
        .then(setQr)
        .catch(() => setQr(null))
    }
  }, [user])

  useEffect(() => {
    if (modalOpened === 'qrreader') {
      window.navigator.mediaDevices.enumerateDevices().then(devices => {
        const cams = devices.filter(device => device.kind === 'videoinput' && device.deviceId)
        setCamDevices(cams)
        setCamDeviceId(cams[0]?.deviceId)
      })
    }
  }, [modalOpened])

  useEffect(() => {
    if (camDevices?.length === 0) {
      setModalOpened(undefined)
      setTimeout(() => {
        setModalOpened('qrreader')
      }, 500)
    }
  }, [camDevices])

  const update = async (values: Device) => {
    try {
      await f.patch(`/api/devices/${values.id}`, values)
      fetchDevices()
      setDrawerOpened(undefined)
      form.reset()
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

  const connect = async (values: Device) => {
    try {
      const { device } = await f.post('/api/devices', values)
      localStorage.setItem(`deviceId:${user?.id}`, device.id)
      setThisDevice(device.id)
      form.reset()
      fetchDevices()
      setModalOpened(undefined)
      showNotification({
        title: 'Success',
        message: 'Your device has been added',
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
        <Group position="apart" mb="lg">
          <Title order={2}>
            Your Devices
          </Title>
          <Menu withArrow>
            <Menu.Target>
              <Button size="sm" color="blue" variant="light">
                Add Device
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {qr ? <Menu.Item onClick={() => setModalOpened('qrcode')}>
                <Group>
                  <IconQrcode size={16} />
                  <Text>Show QR Code</Text>
                </Group>
              </Menu.Item> : <></>}
              <Menu.Item onClick={() => setModalOpened('qrreader')}>
                <Group>
                  <IconNetwork size={16} />
                  <Text>Connect to Host</Text>
                </Group>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {devices.map(device => <Paper key={device.id} p="md" mt="md" withBorder>
          <Group position="apart" noWrap>
            <Group>
              <Text lineClamp={1}>
                {device.name}
              </Text>
              {thisDevice === device.id ? <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                <Badge size="sm">
                  this device
                </Badge>
              </MediaQuery> : <></>}
            </Group>
            <Menu withArrow closeOnItemClick={false}>
              <Menu.Target>
                <ActionIcon>
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item closeMenuOnClick onClick={() => {
                  setDrawerOpened(device)
                  form.setValues(device)
                }}>
                  <Group>
                    <IconEdit size={16} />
                    <Text>
                      Update
                    </Text>
                  </Group>
                </Menu.Item>
                <Popover width={280} withArrow>
                  <Popover.Target>
                    <Menu.Item color="red">
                      <Group>
                        <IconDevicesOff size={16} />
                        <Text>Revoke</Text>
                      </Group>
                    </Menu.Item>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Text color="dimmed">
                      Are you sure you want to revoke this device?
                    </Text>
                    <Group mt="sm" position="right">
                      <Button size="sm" color="red" onClick={() => remove(device.id)}>
                        Yes, I&apos;m confirm
                      </Button>
                    </Group>
                  </Popover.Dropdown>
                </Popover>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Text color="dimmed" mt="xs">
            Added at {dayjs(device.createdAt).format('MMMM D, YYYY H:mm')}
          </Text>
        </Paper>)}
      </Col>
    </Grid>

    <Drawer
      opened={Boolean(drawerOpened)}
      onClose={() => setDrawerOpened(undefined)}
      position="right"
      size="md"
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

    <Drawer
      size="md"
      position="right"
      opened={Boolean(modalOpened)}
      onClose={() => setModalOpened(undefined)}
      title={`Connect ${modalOpened === 'qrcode' ? 'as Host' : 'to Host'}`}>
      {modalOpened === 'qrcode' ? <>
        <Box p="sm">
          <Text color="dimmed">
            Scan this QR Code with your device to connect.
          </Text>
        </Box>
        <Box ta="center">
          {privKey ? <Image src={qr} alt="qr" /> : <></>}
        </Box>
        <Box p="sm">
          <List type="ordered">
            <List.Item>
              <Text>
                Login with your account on your device.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Select <Text component="strong">Connect to Host</Text> on the <Text component="strong">Devices</Text> page.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Scan this QR Code.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Check your <Text component="strong">Services</Text> page to see if it&apos;s connected.
              </Text>
            </List.Item>
          </List>
        </Box>
      </> : <></>}
      {modalOpened === 'qrreader' ? <>
        <Box p="sm">
          <Text color="dimmed">
            Scan the QR Code on your host device to connect.
          </Text>
        </Box>
        {scanComplete ? <Box my="sm">
          <form onSubmit={form.onSubmit(connect)}>
            <TextInput
              label="Name"
              required
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Group mt="md" position="right">
              <Button size="sm" color="blue" variant="light" type="submit">
                Connect
              </Button>
            </Group>
          </form>
        </Box> : <Box ta="center" my="sm">
          {camDevices?.length ? <Select
            mb="md"
            data={camDevices.map(c => ({ value: c.deviceId, label: c.label }))}
            value={camDeviceId}
            onChange={setCamDeviceId} /> : <></>}
          <QrReader
            constraints={{ video: camDeviceId ? { deviceId: camDeviceId } : { facingMode: { ideal: 'environment' } } }}
            style={{ width: '100%'}}
            onError={e => showNotification({
              title: 'Error',
              message: e.message,
              color: 'red'
            })}
            onScan={async data => {
              if (data?.text) {
                try {
                  const key = new NodeRSA()
                  key.importKey(data.text)

                  if (key.isPrivate()) {
                    localStorage.setItem(`privateKey:${user?.id}`, data.text)
                    const ua = new UAParser().getResult()
                    form.setValues({
                      name: `${ua.browser.name} (${ua.os.name} ${ua.device.vendor})`
                    })
                    setScanComplete(true)
                  }
                } catch (error) {
                  // ignore
                }
              }
            }} />
        </Box>}
        <Box p="sm">
          <List type="ordered">
            <List.Item>
              <Text>
                Login with your account on your host device.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Select <Text component="strong">Show QR Code</Text> on the <Text component="strong">Devices</Text> page.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Scan the QR Code on your host device.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Check your <Text component="strong">Services</Text> page to see if it&apos;s connected.
              </Text>
            </List.Item>
          </List>
        </Box>
      </> : <></>}
    </Drawer>
  </Container>
}