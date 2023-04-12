import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { Service } from '@prisma/client'
import type { NextApiResponse } from 'next'

type Data = {
  service?: Service,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    const { id } = req.query
    const service = await prisma.service.findFirst({
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    return res.status(200).json({ service })
  }

  if (req.method === 'PATCH') {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'Missing url' })
    }

    const { id } = req.query
    const service = await prisma.service.findFirst({
      select: {
        id: true
      },
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    await prisma.service.update({
      where: {
        id: service.id
      },
      data: {
        url,
        host: new URL(url).host
      }
    })

    return res.status(200).json({})
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const service = await prisma.service.findFirst({
      select: {
        id: true
      },
      where: {
        id: id as string,
        userId: req.user?.id as string
      }
    })

    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    await prisma.service.delete({
      where: {
        id: service.id
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))