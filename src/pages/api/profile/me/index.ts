import { NextApiRequestWithUser, UserAuthSafe, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import type { NextApiResponse } from 'next'

type Data = {
  user?: UserAuthSafe,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    return res.status(200).json({ user: req.user })
  }

  if (req.method === 'PATCH') {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    await prisma.user.update({
      where: {
        id: req.user?.id as string
      },
      data: {
        name
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))