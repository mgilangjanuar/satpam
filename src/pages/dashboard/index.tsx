import CreateCredential from '@/components/dashboard/createCredential'
import { UserContext } from '@/contexts/user'
import useCreateCredential from '@/hooks/useCreateCredential'
import { f } from '@/lib/fetch'
import { ActionIcon, Box, Button, Col, Container, CopyButton, Drawer, Grid, Group, Menu, Paper, PasswordInput, Popover, Progress, Stack, Tabs, Text, TextInput, Title, Tooltip, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Authenticator, Password, Service } from '@prisma/client'
import { IconCheck, IconCopy, IconDotsVertical, IconEdit, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import NodeRSA from 'node-rsa'
import { useCallback, useContext, useEffect, useState } from 'react'
import totp from 'totp-generator'

interface UpdateURLForm {
  url: string
}

interface SearchForm {
  urlContains: string
}

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [services, setServices] = useState<Service[]>([])
  const [opened, setOpened] = useState<boolean>(false)
  const [urlData, setUrlData] = useState<{ label: string, value: string }[]>([])
  const [tab, setTab] = useState<'password' | 'authenticator'>('password')
  const [tabDetails, setTabDetails] = useState<'password' | 'authenticator'>('password')
  const [openService, setOpenService] = useState<Service>()
  const [passwords, setPasswords] = useState<Password[]>([])
  const [auths, setAuths] = useState<(Authenticator)[]>([])
  const [tokens, setTokens] = useState<{ id: string, token: string, remaining: number }[]>([])
  const [loadingUpdateURL, setLoadingUpdateURL] = useState<boolean>(false)
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false)
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
  const { form } = useCreateCredential()

  const updateURLForm = useForm<UpdateURLForm>({
    initialValues: {
      url: ''
    }
  })
  const searchForm = useForm<SearchForm>({
    initialValues: {
      urlContains: ''
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
          id: 'services-error',
          message: error.message,
          color: 'red',
        })
      } finally {
        setLoadingSearch(false)
      }
    }
  }, [user, filters])

  const updateService = async (data: UpdateURLForm) => {
    setLoadingUpdateURL(true)
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
      setLoadingUpdateURL(false)
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
        <Group position="apart" mb="lg">
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

        <form onSubmit={searchForm.onSubmit(({ urlContains }) => {
          setLoadingSearch(true)
          setFilters(f => ({ ...f, search: {
            ...f.search, url: {
              contains: urlContains,
              mode: 'insensitive'
            }
          } }))
        })}>
          <TextInput
            tabIndex={1}
            autoFocus
            mt="md"
            placeholder="Search..."
            rightSection={<ActionIcon loading={loadingSearch}>
              <IconSearch size={16} />
            </ActionIcon>}
            {...searchForm.getInputProps('urlContains')} />
        </form>

        {services.map(service => <UnstyledButton
          w="100%"
          mt="md"
          key={service.id}
          onClick={() => {
            updateURLForm.setValues({
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

    <CreateCredential
      form={form}
      opened={opened}
      setOpened={setOpened}
      urlData={urlData}
      setUrlData={setUrlData}
      tab={tab}
      setTab={setTab}
      onFinish={serviceId => {
        fetchAll()
        if (!serviceId.startsWith('new_')) {
          setOpenService(services.find(s => s.id === serviceId))
        }
      }}
    />

    <Drawer
      position="right"
      opened={Boolean(openService)}
      onClose={() => setOpenService(undefined)}
      title={openService?.url.split('://')[1].replace(/^\/|\/$/g, '')}>
      <Stack mih="calc(100vh - 70px)">
        <form onSubmit={updateURLForm.onSubmit(updateService)}>
          <Group align="end">
            <TextInput
              style={{ flexGrow: 1 }}
              placeholder="https://example.com"
              type="url"
              {...updateURLForm.getInputProps('url')}
            />
            <ActionIcon
              size="lg"
              type="submit"
              color="teal"
              variant="subtle"
              loading={loadingUpdateURL}>
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
                <Group spacing="xs">
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
                <Group spacing="xs" mt="xs">
                  <PasswordInput readOnly value={password.password} style={{ flexGrow: 1 }} />
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
                <Grid>
                  <Col span={5}>
                    <Text component="strong" size="sm">
                      Token
                    </Text>
                    <Group spacing="xs">
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
                  </Col>
                  <Col span={7}>
                    <Text component="strong" size="sm">
                      Expires in
                    </Text>
                    <Group>
                      <Text>{tokens?.find(t => t.id === auth.id)?.remaining} sec</Text>
                      <Progress
                        size="sm"
                        value={(tokens?.find(t => t.id === auth.id)?.remaining || 0) / auth.period * 100} style={{ flexGrow: 1 }} />
                    </Group>
                  </Col>
                </Grid>
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