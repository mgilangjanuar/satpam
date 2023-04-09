import { f } from '@/lib/fetch'
import { Box } from '@mantine/core'
import { User } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'

export default function Users() {
  const [users, setUsers] = useState<User[]>()
  const [filters, setFilters] = useState<{
    pagination: `${number}:${number}`,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    pagination: '0:10',
    orderBy: 'createdAt:desc',
    search: {}
  })

  const fetch = useCallback(async () => {
    const { users } = await f.post(`/api/users?${
      new URLSearchParams({
        pagination: filters.pagination,
        orderBy: filters.orderBy
      })
    }`, { _search: filters.search })
    setUsers(users)
  }, [filters])

  useEffect(() => {
    fetch()
  }, [fetch])

  return <Box></Box>
}