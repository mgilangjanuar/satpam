import { f } from '@/lib/fetch'
import { ActionIcon, Container, Group, JsonInput, ScrollArea, Stack, Table, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { User } from '@prisma/client'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import dayjs from 'dayjs'
import dJSON from 'dirty-json'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export default function Users() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>()
  const [filtersLoading, setFiltersLoading] = useState<boolean>(false)
  const [filters, setFilters] = useState<{
    pagination: `${number}:${number}`,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    pagination: '0:10',
    orderBy: 'createdAt:desc',
    search: {}
  })
  const [filtersRaw, setFiltersRaw] = useState<string>(JSON.stringify(filters, null, 2))

  const fetchAll = useCallback(async () => {
    setFiltersLoading(true)
    try {
      const { users } = await f.post(`/api/users?${
        new URLSearchParams({
          pagination: filters.pagination,
          orderBy: filters.orderBy
        })
      }`, { _search: filters.search })
      setUsers(users)
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
      router.push('/')
    } finally {
      setFiltersLoading(false)
    }
  }, [filters, router])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return <Container>
    <Title order={3}>Users Management</Title>
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
            <td>{user.id}</td>
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