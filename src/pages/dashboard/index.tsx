import { UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { Col, Container, Grid } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { Service } from '@prisma/client'
import { useCallback, useContext, useEffect, useState } from 'react'

export default function Dashboard() {
  const { user } = useContext(UserContext)
  const [services, setServices] = useState<Service[]>([])
  const [filters, setFilters] = useState<{
    skip: number,
    take: number,
    orderBy: `${string}:${'desc' | 'asc'}`,
    search: Record<string, any>
  }>({
    skip: 0,
    take: 10,
    orderBy: 'url:asc',
    search: {}
  })

  const fetchAll = useCallback(async () => {
    if (user) {
      try {
        const { services } = await f.post(`/api/services?${
          new URLSearchParams({
            _skip: filters.skip.toString(),
            _take: filters.take.toString(),
            _orderBy: filters.orderBy
          })}`, { _search: {} }, {
          'x-device-id': localStorage.getItem(`deviceId:${user?.id}`) || ''
        })
        setServices(services)
      } catch (error: any) {
        showNotification({
          title: 'Error',
          message: error.message,
          color: 'red',
        })
      }
    }
  }, [user, filters])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return <Container fluid>
    <Grid>
      <Col span={12} lg={6} md={8} sm={10}>
      </Col>
    </Grid>
  </Container>
}