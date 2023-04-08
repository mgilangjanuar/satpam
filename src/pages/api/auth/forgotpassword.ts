import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/sendEmail'
import type { NextApiRequest, NextApiResponse } from 'next'
import { genSync } from 'random-web-token'

type Data = {
  error?: string
}

export default wrapper(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Missing email' })
    }

    const user = await prisma.user.findFirst({
      select: {
        id: true,
      }, where: {
        email
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const token = genSync('extra', 72)

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        forgotPasswordToken: token
      }
    })

    await sendEmail({
      to: email,
      type: 'passwordReset',
      token
    })

    return res.status(200).json({})
  }
  return res.status(405).json({ error: 'Method not allowed' })
})