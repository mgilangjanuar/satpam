import { f } from '@/lib/fetch'
import { ActionIcon, Col, Container, Grid, Group, JsonInput, ScrollArea, Stack, Table, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { User } from '@prisma/client'
import { IconArrowLeft, IconArrowRight, IconPlayerPlayFilled } from '@tabler/icons-react'
import dayjs from 'dayjs'
import dJSON from 'dirty-json'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export default function Users() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>()
  const [filtersLoading, setFiltersLoading] = useState<boolean>(false)
  const [filters, setFilters] = useState<{
    skip: number,
    take: number,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    skip: 0,
    take: 10,
    orderBy: 'createdAt:desc',
    search: {}
  })
  const [filtersRaw, setFiltersRaw] = useState<string>(JSON.stringify(filters, null, 2))

  const fetchAll = useCallback(async () => {
    setFiltersLoading(true)
    try {
      const { users } = await f.post(`/api/users?${
        new URLSearchParams({
          _skip: filters.skip.toString(),
          _take: filters.take.toString(),
          _orderBy: filters.orderBy
        })
      }`, { _search: filters.search })
      setUsers(users)
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
      if (error.message === 'Unauthorized')  {
        router.push('/')
      }
    } finally {
      setFiltersLoading(false)
    }
  }, [filters, router])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    setFiltersRaw(JSON.stringify(filters, null, 2))
  }, [filters])

  return <Container fluid>
    <Title order={3}>Users Management</Title>
    <Grid>
      <Col span={12} md={6}>
        <Group align="end" mt="md">
          <JsonInput
            spellCheck={false}
            label="Filters"
            style={{ flexGrow: 1 }}
            variant="filled"
            value={filtersRaw}
            onChange={setFiltersRaw}
            autoCorrect="off"
            autoCapitalize="off"
            autosize
            minRows={5}
            maxRows={10}
            formatOnBlur={true}
            serialize={val => JSON.stringify(val, null, 2)}
            deserialize={dJSON.parse} />
          <Stack>
            <ActionIcon loading={filtersLoading} color="green" variant="light" onClick={() => {
              try {
                setFilters(dJSON.parse(filtersRaw))
              } catch (error: any) {
                showNotification({
                  title: 'Error',
                  message: error.message,
                  color: 'red'
                })
              }
            }}>
              <IconPlayerPlayFilled size={18} />
            </ActionIcon>
          </Stack>
        </Group>
      </Col>
    </Grid>
    <Group mt="sm">
      <ActionIcon variant="subtle" disabled={filters.skip === 0} onClick={() => {
        setFilters(filters => ({ ...filters, skip: filters.skip - filters.take }))
      }}>
        <IconArrowLeft size={20} />
      </ActionIcon>
      <ActionIcon variant="subtle" disabled={(users?.length || 0) < filters.take} onClick={() => {
        setFilters(filters => ({ ...filters, skip: filters.skip + filters.take }))
      }}>
        <IconArrowRight size={20} />
      </ActionIcon>
    </Group>
    <ScrollArea mt="md">
      <Table striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th style={{ whiteSpace: 'nowrap' }}>Created At</th>
            <th style={{ whiteSpace: 'nowrap' }}>Deleted At</th>
          </tr>
        </thead>
        <tbody>
          {users?.map(user => <tr key={user.id}>
            <td>
              <Link href={`/_admin/users/${user.id}`}>
                {user.id}
              </Link>
            </td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.name}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.email}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.role}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{dayjs(user.createdAt).format('MMM D, YYYY H:mm')}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.deletedAt ? dayjs(user.deletedAt).format('MMM D, YYYY H:mm') : '-'}</td>
          </tr>)}
        </tbody>
      </Table>
    </ScrollArea>
  </Container>
}