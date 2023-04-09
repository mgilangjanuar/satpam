import { f } from '@/lib/fetch'
import { ActionIcon, Button, Container, Group, Popover, ScrollArea, Table, Text, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { User } from '@prisma/client'
import { IconArrowLeft } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export default function User() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User>()

  const fetch = useCallback(async () => {
    if (!id) return
    try {
      const { user } = await f.get(`/api/users/${id}`)
      setUser(user)
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
      if (error.message === 'Unauthorized')  {
        router.push('/')
      }
    }
  }, [id, router])

  const remove = async () => {
    try {
      await f.delete(`/api/users/${id}`)
      showNotification({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green'
      })
      fetch()
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
      if (error.message === 'Unauthorized')  {
        router.push('/')
      }
    }
  }

  const recover = async () => {
    try {
      await f.post(`/api/users/${id}/recover`, {})
      showNotification({
        title: 'Success',
        message: 'User recovered successfully',
        color: 'green'
      })
      fetch()
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        color: 'red'
      })
      if (error.message === 'Unauthorized')  {
        router.push('/')
      }
    }
  }

  useEffect(() => {
    fetch()
  }, [fetch])

  return <Container>
    <Group>
      <ActionIcon onClick={() => router.back()}>
        <IconArrowLeft size={20} />
      </ActionIcon>
      <Title order={3}>{user?.email || id}</Title>
    </Group>
    <ScrollArea mt="xl">
      <Table striped>
        <tbody>
          <tr>
            <th>ID</th>
            <td>{user?.id}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{user?.name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{user?.email}</td>
          </tr>
          <tr>
            <th>Verification Token</th>
            <td>{user?.verificationToken || '-'}</td>
          </tr>
          <tr>
            <th>Forgot Password Token</th>
            <td>{user?.forgotPasswordToken || '-'}</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{dayjs(user?.createdAt).format('MMM D, YYYY H:mm')}</td>
          </tr>
          <tr>
            <th>Updated At</th>
            <td>{dayjs(user?.updatedAt).format('MMM D, YYYY H:mm')}</td>
          </tr>
          <tr>
            <th>Deleted At</th>
            <td>{user?.deletedAt ? dayjs(user?.deletedAt).format('MMM D, YYYY H:mm') : '-'}</td>
          </tr>
        </tbody>
      </Table>
    </ScrollArea>
    <Group mt="md" position="right">
      <Popover withArrow width={280}>
        <Popover.Target>
          {user?.deletedAt ? <Button variant="light">
            Recover
          </Button> : <Button color="red" variant="light">
            Delete
          </Button>}
        </Popover.Target>
        <Popover.Dropdown>
          <Text>
            Are you sure you want to {user?.deletedAt ? 'recover' : 'delete'} this user?
          </Text>
          <Group mt="md" position="right">
            {user?.deletedAt ? <Button variant="light" onClick={recover}>
              Recover
            </Button> : <Button color="red" variant="light" onClick={remove}>
              Yes, confirm
            </Button>}
          </Group>
        </Popover.Dropdown>
      </Popover>
      <Button color="yellow" variant="light">
        Update
      </Button>
    </Group>
  </Container>
}