import { authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  user?: Partial<User>,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    const user = await prisma.user.findFirst({
      select: { id: true },
      where: { id: req.query.id as string }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: null
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
}), { roles: ['owner'] })
