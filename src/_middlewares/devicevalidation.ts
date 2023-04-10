import { NextApiResponse } from 'next'
import { NextApiRequestWithUser } from './authorization'
import { prisma } from '@/lib/prisma'

export function devicevalidation(fn: (req: NextApiRequestWithUser, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    const { 'x-device-id': deviceId } = req.headers
    if (!deviceId) {
      return res.status(400).json({ error: 'Missing device id' })
    }

    const device = await prisma.device.findFirst({
      select: {
        id: true
      },
      where: {
        id: deviceId as string,
        userId: req.user?.id as string
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not registered' })
    }

    await fn(req, res)
  }
}