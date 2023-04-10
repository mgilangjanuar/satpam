import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/sendEmail'
import { serialize } from 'cookie'
import type { NextApiResponse } from 'next'
import { genSync } from 'random-web-token'

type Data = {
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'PATCH') {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Missing email' })
    }

    const token = genSync('extra', 72)
    await prisma.user.update({
      where: {
        id: req.user?.id
      },
      data: {
        email,
        verificationToken: token
      }
    })

    await sendEmail({
      to: email,
      type: 'emailVerification',
      token
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