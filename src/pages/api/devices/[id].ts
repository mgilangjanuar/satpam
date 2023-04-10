import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { Device } from '@prisma/client'
import type { NextApiResponse } from 'next'

type Data = {
  device?: Device,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    const { id } = req.query
    const device = await prisma.device.findFirst({
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    return res.status(200).json({ device })
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    const device = await prisma.device.findFirst({
      select: {
        id: true
      },
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    await prisma.device.update({
      where: {
        id: device.id
      },
      data: req.body
    })

    return res.status(200).json({})
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const device = await prisma.device.findFirst({
      select: {
        id: true
      },
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    await prisma.device.delete({
      where: {
        id: device.id
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))