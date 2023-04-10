import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import { serialize } from 'cookie'
import type { NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'PATCH') {
    const { password, newPassword } = req.body
    if (!password || !newPassword) {
      return res.status(400).json({ error: 'Missing password or newPassword' })
    }

    const user = await prisma.user.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        id: req.user?.id
      }
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashSync(newPassword, genSaltSync())
      }
    })

    res.setHeader('Set-Cookie', serialize(
      'authorized_token', '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        expires: new Date()
      }
    ))
    return res.end('{}')
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))