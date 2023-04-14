import CreateCredential from '@/components/dashboard/createCredential'
import DetailsCredential from '@/components/dashboard/detailsCredential'
import { UserContext } from '@/contexts/user'
import useCreateCredential from '@/hooks/useCreateCredential'
import useUpdateCredential from '@/hooks/useUpdateCredential'
import { f } from '@/lib/fetch'
import { ActionIcon, Button, Col, Container, Grid, Group, Paper, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { Service } from '@prisma/client'
import { IconSearch, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useCallback, useContext, useEffect, useState } from 'react'

interface SearchForm {
  urlContains: string
}

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [services, setServices] = useState<Service[]>([])
  const [opened, setOpened] = useState<boolean>(false)
  const [urlData, setUrlData] = useState<{ label: string, value: string }[]>([])
  const [tab, setTab] = useState<'password' | 'authenticator'>('password')
  const [openedService, setOpenedService] = useState<Service>()
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
  const { form: updateURLForm } = useUpdateCredential()
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
        if (filters.skip === 0 && filters.take === 0 && !Object.keys(filters.search)?.length) {
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

  const search = ({ urlContains }: { urlContains?: string }) => {
    setLoadingSearch(true)
    setFilters(f => ({ ...f, search: {
      ...f.search, url: urlContains ? {
        contains: urlContains,
        mode: 'insensitive'
      } : undefined
    } }))
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
          <Button size="sm" color="blue" variant="light" onClick={() => {
            form.reset()
            setOpened(true)
          }}>
            Create
          </Button>
        </Group>

        <form onSubmit={searchForm.onSubmit(search)}>
          <TextInput
            tabIndex={1}
            autoFocus
            mt="md"
            placeholder="Search..."
            rightSection={!filters.search.url ? <ActionIcon
              loading={loadingSearch}
              onClick={() => search({
                urlContains: searchForm.values.urlContains
              })}>
              <IconSearch size={16} />
            </ActionIcon> : <ActionIcon
              loading={loadingSearch}
              onClick={() => {
                searchForm.reset()
                search({
                  urlContains: undefined
                })
              }}>
              <IconX size={16} />
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
            setOpenedService(service)
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
          setOpenedService(services.find(s => s.id === serviceId))
        }
      }}
    />

    <DetailsCredential
      formCreate={form}
      form={updateURLForm}
      setOpenedCreate={setOpened}
      openedService={openedService}
      setOpenedService={setOpenedService}
      setTab={setTab}
      onFinish={fetchAll}
      setServices={setServices} />
  </Container>
}