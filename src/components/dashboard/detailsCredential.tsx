import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { ActionIcon, Box, Button, Col, CopyButton, Drawer, Grid, Group, Menu, Paper, PasswordInput, Popover, Progress, Stack, Tabs, Text, TextInput, Tooltip } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Authenticator, Password, Service } from '@prisma/client'
import { IconCheck, IconCopy, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react'
import NodeRSA from 'node-rsa'
import { useContext, useEffect, useState } from 'react'
import totp from 'totp-generator'
import { CreateCredentialForm } from './createCredential'

export interface UpdateURLForm {
  url: string
}

interface Props {
  formCreate: UseFormReturnType<CreateCredentialForm, (values: CreateCredentialForm) => CreateCredentialForm>,
  form: UseFormReturnType<UpdateURLForm, (values: UpdateURLForm) => UpdateURLForm>,
  setOpenedCreate: (opened: boolean) => void,
  openedService?: Service,
  setOpenedService: (service?: Service | ((s?: Service) => Service)) => void,
  setTab: (tab: 'password' | 'authenticator') => void,
  onFinish: () => void,
  setServices: (services: Service[] | ((s: Service[]) => Service[])) => void
}

export default function DetailsCredential({ formCreate, form, setOpenedCreate: setOpened, openedService, setOpenedService, setTab, onFinish, setServices }: Props) {
  const { user } = useContext(UserContext)
  const [tabDetails, setTabDetails] = useState<'password' | 'authenticator'>('password')
  const [loadingUpdateURL, setLoadingUpdateURL] = useState<boolean>(false)
  const [passwords, setPasswords] = useState<Password[]>([])
  const [auths, setAuths] = useState<(Authenticator)[]>([])
  const [tokens, setTokens] = useState<{ id: string, token: string, remaining: number }[]>([])

  useEffect(() => {
    if (openedService && user?.id) {
      f.get(`/api/services/${openedService.id}/passwords?${
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
      f.get(`/api/services/${openedService.id}/authenticators?${
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
  }, [openedService, user?.id])

  useEffect(() => {
    if (auths?.length && openedService) {
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
  }, [tokens, openedService, auths, user?.id])

  const updateService = async (data: UpdateURLForm) => {
    setLoadingUpdateURL(true)
    try {
      await f.patch(`/api/services/${openedService?.id}`, {
        url: data.url
      }, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })

      onFinish()
      setOpenedService(s => ({ ...s, url: data.url } as Service))
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
      await f.delete(`/api/services/${openedService?.id}/passwords/${id}`, {
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
      await f.delete(`/api/services/${openedService?.id}/authenticators/${id}`, {
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
      await f.delete(`/api/services/${openedService?.id}`, {
        'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
      })
      setServices(s => s.filter(s => s.id !== openedService?.id))
      setOpenedService(undefined)
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

  return <Drawer
    position="right"
    opened={Boolean(openedService)}
    onClose={() => {
      setAuths([])
      setPasswords([])
      setOpenedService(undefined)
    }}
    title={openedService?.url.split('://')[1].replace(/^\/|\/$/g, '')}>
    <Stack mih="calc(100vh - 70px)">
      <form onSubmit={form.onSubmit(updateService)}>
        <Group align="end">
          <TextInput
            style={{ flexGrow: 1 }}
            placeholder="https://example.com"
            type="url"
            {...form.getInputProps('url')}
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
          {!passwords.length ? <Box mt="md" p="md">
            <Text size="sm" ta="center" color="dimmed">No passwords</Text>
          </Box> : <></>}
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
                      formCreate.setValues({
                        username: password.username,
                        password: password.password,
                        passwordId: password.id,
                        url: openedService?.id
                      })
                      setTab('password')
                      setOpenedService(undefined)
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
          {!auths.length ? <Box mt="md" p="md">
            <Text size="sm" ta="center" color="dimmed">No authenticators</Text>
          </Box> : <></>}
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
                      formCreate.setValues({
                        name: auth.name,
                        secret: auth.secret,
                        digits: auth.digits,
                        period: auth.period,
                        algorithm: auth.algorithm,
                        authenticatorId: auth.id,
                        url: openedService?.id
                      })
                      setTab('authenticator')
                      setOpenedService(undefined)
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
          formCreate.reset()
          formCreate.setValues({
            url: openedService?.id,
            authenticatorId: undefined,
            passwordId: undefined
          })
          setOpenedService(undefined)
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
}