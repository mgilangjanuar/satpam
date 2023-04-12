import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { ActionIcon, Box, Button, Col, Container, CopyButton, Drawer, Grid, Group, Menu, NumberInput, Paper, PasswordInput, Popover, Select, Stack, Switch, Tabs, Text, TextInput, Title, Tooltip, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Authenticator, Password, Service } from '@prisma/client'
import { IconCheck, IconCopy, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import NodeRSA from 'node-rsa'
import parseURI from 'otpauth-uri-parser'
import { useCallback, useContext, useEffect, useState } from 'react'
import QrReader from 'react-qr-scanner'
import totp from 'totp-generator'

interface Form {
  url: string,
  passwordId?: string,
  username?: string,
  password?: string,
  authenticatorId?: string,
  name?: string,
  secret?: string,
  digits?: number,
  period?: number,
  algorithm?: string,
  uri?: string
}

interface UpdateServiceForm {
  url: string
}

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [services, setServices] = useState<Service[]>([])
  const [opened, setOpened] = useState<boolean>(false)
  const [toggleQR, setToggleQR] = useState<boolean>(true)
  const [urlData, setUrlData] = useState<{ label: string, value: string }[]>([])
  const [tab, setTab] = useState<'password' | 'authenticator'>('password')
  const [tabDetails, setTabDetails] = useState<'password' | 'authenticator'>('password')
  const [camDevices, setCamDevices] = useState<MediaDeviceInfo[]>()
  const [camDeviceId, setCamDeviceId] = useState<string | null>(null)
  const [openService, setOpenService] = useState<Service>()
  const [passwords, setPasswords] = useState<Password[]>([])
  const [auths, setAuths] = useState<(Authenticator)[]>([])
  const [tokens, setTokens] = useState<{ id: string, token: string, remaining: number }[]>([])
  const [loadingCreate, setLoadingCreate] = useState<boolean>(false)
  const [loadingUpdateService, setLoadingUpdateService] = useState<boolean>(false)
  const [filters, setFilters] = useState<{
    skip: number,
    take: number,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    skip: 0,
    take: 0,
    orderBy: 'url:asc',
    search: {}
  })
  const form = useForm<Form>({
    initialValues: {
      url: '',
      passwordId: '',
      username: '',
      password: '',
      authenticatorId: '',
      name: '',
      secret: '',
      digits: 6,
      period: 30,
      algorithm: 'SHA-1'
    }
  })
  const updateServiceForm = useForm({
    initialValues: {
      url: ''
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
          })}`, { _search: filters.search }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
        setServices(services)
        if (filters.skip === 0 && filters.take === 0) {
          setUrlData((services as Service[]).map(s => ({ label: s.url, value: s.id })))
        }
      } catch (error: any) {
        showNotification({
          title: 'Error',
          message: error.message,
          color: 'red',
        })
      }
    }
  }, [user, filters])

  const save = async (data: Form) => {
    setLoadingCreate(true)
    try {
      let serviceId: string = data.url

      if (serviceId.startsWith('new_')) {
        const { service } = await f.post('/api/services', {
          url: data.url.replace(/^new_/, ''),
        }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
        serviceId = service.id
      }

      if (data.username || data.password) {
        if (data.passwordId) {
          await f.patch(`/api/services/${serviceId}/passwords/${data.passwordId}`, {
            username: data.username,
            password: data.password
          }, {
            'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
          })
        } else {
          await f.post(`/api/services/${serviceId}/passwords`, {
            username: data.username,
            password: data.password
          }, {
            'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
          })
        }
      }
      if (data.secret) {
        if (data.authenticatorId) {
          await f.patch(`/api/services/${serviceId}/authenticators/${data.authenticatorId}`, {
            name: data.name || new URL(data.url).host,
            secret: data.secret,
            digits: data.digits,
            period: data.period,
            algorithm: data.algorithm
          }, {
            'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
          })
        } else {
          await f.post(`/api/services/${serviceId}/authenticators`, {
            name: data.name || new URL(data.url).host,
            secret: data.secret,
            digits: data.digits,
            period: data.period,
            algorithm: data.algorithm
          }, {
            'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
          })
        }
      }

      fetchAll()
      setOpened(false)
      form.reset()
      if (!serviceId.startsWith('new_')) {
        setOpenService(services.find(s => s.id === serviceId))
      }
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoadingCreate(false)
    }
  }

  const updateService = async (data: UpdateServiceForm) => {
    setLoadingUpdateService(true)
    try {
      await f.patch(`/api/services/${openService?.id}`, {
        url: data.url
      }, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })

      fetchAll()
      setOpenService(s => ({ ...s, url: data.url } as Service))
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoadingUpdateService(false)
    }
  }

  const removePass = async (id: string) => {
    try {
      await f.delete(`/api/services/${openService?.id}/passwords/${id}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })
      setPasswords(p => p.filter(p => p.id !== id))
      showNotification({
        title: 'Success',
        message: 'Account removed',
        color: 'green',
      })
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    }
  }

  const removeAuth = async (id: string) => {
    try {
      await f.delete(`/api/services/${openService?.id}/authenticators/${id}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })
      setAuths(a => a.filter(a => a.id !== id))
      showNotification({
        title: 'Success',
        message: 'Authenticator removed',
        color: 'green',
      })
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    }
  }

  const removeService = async () => {
    try {
      await f.delete(`/api/services/${openService?.id}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })
      setServices(s => s.filter(s => s.id !== openService?.id))
      setOpenService(undefined)
      showNotification({
        title: 'Success',
        message: 'Service removed',
        color: 'green',
      })
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

  useEffect(() => {
    if (toggleQR && tab === 'authenticator' && opened) {
      window.navigator.mediaDevices.enumerateDevices().then(devices => {
        const cams = devices.filter(device => device.kind === 'videoinput' && device.deviceId)
        setCamDevices(cams)
        setCamDeviceId(cams[0]?.deviceId)
      })
    }
  }, [toggleQR, tab, opened])

  useEffect(() => {
    if (openService && user?.id) {
      f.get(`/api/services/${openService.id}/passwords?${
        new URLSearchParams({
          _skip: '0',
          _take: '0'
        })}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      }).then(({ passwords }) => {
        setPasswords(passwords.map((p: Password) => {
          const rsa = new NodeRSA()
          rsa.importKey(localStorage.getItem(`privateKey:${user?.id}`) || '')
          return {
            ...p,
            username: rsa.decrypt(p.username, 'utf8'),
            password: rsa.decrypt(p.password, 'utf8')
          }
        }))
      })
      f.get(`/api/services/${openService.id}/authenticators?${
        new URLSearchParams({
          _skip: '0',
          _take: '0'
        })}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      }).then(({ authenticators }) => {
        setAuths(authenticators.map((a: Authenticator) => {
          const rsa = new NodeRSA()
          rsa.importKey(localStorage.getItem(`privateKey:${user?.id}`) || '')
          return { ...a,
            name: rsa.decrypt(a.name, 'utf8'),
            secret: rsa.decrypt(a.secret, 'utf8')
          }
        }))
      })
    }
  }, [openService, user?.id])

  useEffect(() => {
    if (auths?.length && openService) {
      setTimeout(() => {
        setTokens(auths.map(a => {
          const time = Date.now()
          return {
            id: a.id,
            remaining: a.period - Math.floor((time / 1000) % a.period),
            token: totp(a.secret, {
              digits: a.digits,
              period: a.period,
              timestamp: time,
              algorithm: a.algorithm as any
            })
          }
        }))
      }, 1000)
    }
  }, [tokens, openService, auths, user?.id])

  return <Container fluid>
    <Grid>
      <Col span={12} lg={6} md={8} sm={10}>
        <Group position="apart" mb={4}>
          <Title order={2}>
            Your Credentials
          </Title>
          <Button size="sm" color="blue" variant="light" onClick={() => {
            form.reset()
            setOpened(true)
          }}>
            Create
          </Button>
        </Group>

        {services.map(service => <UnstyledButton
          w="100%"
          mt="md"
          key={service.id}
          onClick={() => {
            updateServiceForm.setValues({
              url: service.url
            })
            setOpenService(service)
          }}>
            <Paper
              p="md"
              withBorder>
              <Text truncate>
                {service.url.split('://')[1].replace(/^\/|\/$/g, '')}
              </Text>
              <Text color="dimmed" mt="xs">
                Added at {dayjs(service.createdAt).format('MMMM D, YYYY H:mm')}
              </Text>
            </Paper>
          </UnstyledButton>)}
      </Col>
    </Grid>

    <Drawer
      position="right"
      opened={opened}
      onClose={() => setOpened(false)}
      title={form.values.passwordId || form.values.authenticatorId ? 'Update a credential' : 'Create a credential'}>
      <form onSubmit={form.onSubmit(save)}>
        <Select
          data={urlData}
          placeholder="Select or type a URL"
          required
          withAsterisk
          searchable
          creatable
          getCreateLabel={(query) => `Add ${query}`}
          onCreate={(query) => {
            const v = { label: query, value: `new_${query}` }
            setUrlData(data => [...data, v])
            return v
          }}
          {...form.getInputProps('url')} />
        <Tabs mt="md" value={tab} onTabChange={e => setTab(e as 'password' | 'authenticator')}>
          {form.values.passwordId || form.values.authenticatorId ? <></> : <Tabs.List>
            <Tabs.Tab value="password">Password</Tabs.Tab>
            <Tabs.Tab value="authenticator">Authenticator</Tabs.Tab>
          </Tabs.List>}
          <Tabs.Panel value="password">
            <TextInput
              mt="md"
              label="Username"
              {...form.getInputProps('username')}
            />
            <PasswordInput
              mt="md"
              label="Password"
              {...form.getInputProps('password')}
            />
          </Tabs.Panel>
          <Tabs.Panel value="authenticator">
            <Switch
              mt="md"
              checked={toggleQR}
              onChange={({ target: { checked } }) => setToggleQR(checked)}
              label={toggleQR ? 'Switch to input secret' : 'Switch to QR scanner'} />
            {toggleQR && tab === 'authenticator' ? <>
              {camDevices?.length ? <Select
                my="md"
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
                    console.log(data.text)
                    try {
                      const parsed = parseURI(data.text)
                      if (parsed.type === 'totp') {
                        form.setValues({
                          name: `${parsed.label.issuer}${
                            parsed.label.account ? `: ${parsed.label.account}` : ''}`,
                          secret: parsed.query.secret,
                          digits: Number(parsed.query.digits) || 6,
                          period: Number(parsed.query.period) || 30,
                          algorithm: parsed.query.algorithm || 'SHA-1'
                        })
                        setToggleQR(false)
                      }
                    } catch (error) {
                      // ignore
                    }
                  }
                }} />
            </> : <>
              <TextInput
                mt="md"
                label="Name"
                {...form.getInputProps('name')}
              />
              <TextInput
                mt="md"
                label="Secret"
                {...form.getInputProps('secret')}
              />
              <NumberInput
                mt="md"
                label="Digits"
                {...form.getInputProps('digits')}
              />
              <NumberInput
                mt="md"
                label="Period"
                {...form.getInputProps('period')}
              />
              {/* <Select
                mt="md"
                data={[
                  'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384',
                  'SHA-512', 'SHA3-224', 'SHA3-256',
                  'SHA3-384', 'SHA3-512']}
                label="Algorithm"
                {...form.getInputProps('algorithm')}
              /> */}
            </>}
          </Tabs.Panel>
        </Tabs>

        <Group position="right" mt="lg">
          <Button type="submit" variant="light" loading={loadingCreate}>
            {form.values.passwordId || form.values.authenticatorId ? 'Update' : 'Create'}
          </Button>
        </Group>
      </form>
    </Drawer>

    <Drawer
      position="right"
      opened={Boolean(openService)}
      onClose={() => setOpenService(undefined)}
      title={openService?.url.split('://')[1].replace(/^\/|\/$/g, '')}>
      <Stack mih="calc(100vh - 70px)">
        <form onSubmit={updateServiceForm.onSubmit(updateService)}>
          <Group align="end">
            <TextInput
              style={{ flexGrow: 1 }}
              placeholder="https://example.com"
              type="url"
              {...updateServiceForm.getInputProps('url')}
            />
            <ActionIcon
              size="lg"
              type="submit"
              color="teal"
              variant="subtle"
              loading={loadingUpdateService}>
              <IconCheck size={18} />
            </ActionIcon>
          </Group>
        </form>

        <Tabs value={tabDetails} onTabChange={t => setTabDetails(t as 'password' | 'authenticator')} style={{ flexGrow: 1 }}>
          <Tabs.List>
            <Tabs.Tab value="password">Password</Tabs.Tab>
            <Tabs.Tab value="authenticator">Authenticator</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="password">
            {passwords.map(password => <Paper key={password.id} p="md" mt="md" withBorder>
              <Box>
                <Group position="apart" align="start">
                  <Text component="strong" size="sm" lineClamp={1}>
                    Username
                  </Text>
                  <Menu withArrow closeOnItemClick={false} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item closeMenuOnClick onClick={() => {
                        form.setValues({
                          username: password.username,
                          password: password.password,
                          passwordId: password.id,
                          url: openService?.id
                        })
                        setTab('password')
                        setOpenService(undefined)
                        setOpened(true)
                      }}>
                        <Group>
                          <IconEdit size={16} />
                          <Text>
                            Update
                          </Text>
                        </Group>
                      </Menu.Item>
                      <Popover width={280} withArrow position="bottom-end">
                        <Popover.Target>
                          <Menu.Item color="red">
                            <Group>
                              <IconTrash size={16} />
                              <Text>Remove</Text>
                            </Group>
                          </Menu.Item>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Text component="p" mt="xs" mb="md">
                            Are you sure you want to remove this account?
                          </Text>
                          <Group position="right">
                            <Button size="sm" color="red" onClick={() => removePass(password.id)}>
                              Yes, I&apos;m confirm
                            </Button>
                          </Group>
                        </Popover.Dropdown>
                      </Popover>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Group>
                  <Text>{password.username}</Text>
                  <CopyButton value={password.username} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Box>
              <Box mt="md">
                <Text component="strong" size="sm">
                  Password
                </Text>
                <Group>
                  <PasswordInput mt="xs" readOnly value={password.password} style={{ flexGrow: 1 }} />
                  <CopyButton value={password.password} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Box>
            </Paper>)}
          </Tabs.Panel>
          <Tabs.Panel value="authenticator">
            {auths.map(auth => <Paper key={auth.id} p="md" mt="md" withBorder>
              <Box>
                <Group position="apart" align="start">
                  <Text component="strong" size="sm" lineClamp={1}>
                    Name
                  </Text>
                  <Menu withArrow closeOnItemClick={false} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item closeMenuOnClick onClick={() => {
                        form.setValues({
                          name: auth.name,
                          secret: auth.secret,
                          digits: auth.digits,
                          period: auth.period,
                          algorithm: auth.algorithm,
                          authenticatorId: auth.id,
                          url: openService?.id
                        })
                        setTab('authenticator')
                        setOpenService(undefined)
                        setOpened(true)
                      }}>
                        <Group>
                          <IconEdit size={16} />
                          <Text>
                            Update
                          </Text>
                        </Group>
                      </Menu.Item>
                      <Popover width={280} withArrow position="bottom-end">
                        <Popover.Target>
                          <Menu.Item color="red">
                            <Group>
                              <IconTrash size={16} />
                              <Text>Remove</Text>
                            </Group>
                          </Menu.Item>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Text component="p" mt="xs" mb="md">
                            Are you sure you want to remove this authenticator?
                          </Text>
                          <Group position="right">
                            <Button size="sm" color="red" onClick={() => removeAuth(auth.id)}>
                              Yes, I&apos;m confirm
                            </Button>
                          </Group>
                        </Popover.Dropdown>
                      </Popover>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Text>{auth.name}</Text>
              </Box>
              <Box mt="md">
                <Text component="strong" size="sm">
                  Token
                </Text>
                <Group>
                  <Text>{tokens?.find(t => t.id === auth.id)?.token}</Text>
                  <CopyButton value={tokens?.find(t => t.id === auth.id)?.token || ''} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
                <Text color="dimmed" size="sm">
                  expires in {tokens?.find(t => t.id === auth.id)?.remaining}s
                </Text>
              </Box>
            </Paper>)}
          </Tabs.Panel>
        </Tabs>
        <Group position="right">
          <Button variant="light" onClick={() => {
            form.reset()
            form.setValues({
              url: openService?.id,
              authenticatorId: undefined,
              passwordId: undefined
            })
            setOpenService(undefined)
            setTab(tabDetails)
            setOpened(true)
          }}>
            Add {tabDetails === 'password' ? 'a password' : 'an authenticator'}
          </Button>
          <Popover width={280} withArrow position="top-end">
            <Popover.Target>
              <Button variant="light" color="red">
                Remove all
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text component="p" mt="xs" mb="md">
                Are you sure you want to remove all passwords and authenticators?
              </Text>
              <Group position="right">
                <Button size="sm" color="red" onClick={removeService}>
                  Yes, I&apos;m confirm
                </Button>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Stack>
    </Drawer>
  </Container>
}