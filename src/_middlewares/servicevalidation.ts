import { prisma } from '@/lib/prisma'
import { NextApiResponse } from 'next'
import { NextApiRequestWithUser } from './authorization'

export function servicevalidation(fn: (req: NextApiRequestWithUser, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    const service = await prisma.service.findFirst({
      select: {
        id: true,
      },
      where: {
        id: req.query.id as string,
        userId: req.user?.id
      }
    })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    await fn(req, res)
  }
}