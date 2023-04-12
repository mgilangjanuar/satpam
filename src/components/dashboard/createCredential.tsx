import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Button, Drawer, Group, NumberInput, PasswordInput, Select, Switch, Tabs, TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import parseURI from 'otpauth-uri-parser'
import { useCallback, useContext, useState } from 'react'
import ScanQr from './scanQr'

export interface CreateCredentialForm {
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

interface Props {
  form: UseFormReturnType<CreateCredentialForm, (values: CreateCredentialForm) => CreateCredentialForm>,
  opened: boolean,
  setOpened: (opened: boolean) => void,
  urlData: { label: string, value: string }[],
  setUrlData: (data: (
    { label: string, value: string }[]
  ) | (
    (d: {
      label: string, value: string
    }[]) => {
      label: string, value: string
    }[]
  )) => void,
  tab: 'password' | 'authenticator',
  setTab: (tab: 'password' | 'authenticator') => void,
  onFinish: (id: string) => void
}

export default function CreateCredential({ form, opened, setOpened, urlData, setUrlData, tab, setTab, onFinish }: Props) {
  const { user } = useContext(UserContext)
  const [toggleQR, setToggleQR] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const onGetDevices = useCallback(() => {
    return toggleQR && tab === 'authenticator' && opened
  }, [toggleQR, tab, opened])

  const save = async (data: CreateCredentialForm) => {
    setLoading(true)
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

      setOpened(false)
      form.reset()
      onFinish(serviceId)
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return <Drawer
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
            my="md"
            checked={toggleQR}
            onChange={({ target: { checked } }) => setToggleQR(checked)}
            label={toggleQR ? 'Switch to input secret' : 'Switch to QR scanner'} />
          {toggleQR && tab === 'authenticator' ? <ScanQr
            onScan={val => {
              const parsed = parseURI(val)
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
            }}
            onGetDevices={onGetDevices} /> : <>
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
        <Button type="submit" variant="light" loading={loading}>
          {form.values.passwordId || form.values.authenticatorId ? 'Update' : 'Create'}
        </Button>
      </Group>
    </form>
  </Drawer>
}