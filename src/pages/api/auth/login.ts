import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { compareSync } from 'bcrypt'
import { serialize } from 'cookie'
import { sign } from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    if (!process.env.SECRET_KEY) return res.status(500).json({ error: 'Missing secret key' })

    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const user = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        password: true,
        verificationToken: true,
      },
      where: {
        email,
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.verificationToken) {
      return res.status(401).json({ error: 'Email not verified' })
    }

    if (!compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const authData = {
      id: user.id,
      name: user.name,
      email,
    }

    res.setHeader('Set-Cookie', serialize(
      'authorized_token', sign(
        authData, process.env.SECRET_KEY as string
      ), {
        maxAge: 60 * 60 * 4, // 4 hours
        httpOnly: true,
        path: '/',
        expires: new Date(Date.now() + 60 * 60 * 4 * 1000), // 4 hours
      }
    ))
    return res.end('{}')
  }

  return res.status(405).json({ error: 'Method not allowed' })
})