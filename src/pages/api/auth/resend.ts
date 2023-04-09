import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/sendEmail'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    const { type, email } = req.body
    if (!email || !type) {
      return res.status(400).json({ error: 'Missing email or type' })
    }

    if (type === 'emailVerification') {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          verificationToken: true
        },
        where: {
          email
        }
      })
      if (user) {
        if (!user.verificationToken) {
          return res.status(400).json({ error: 'User already verified' })
        }

        await sendEmail({
          to: email,
          type: 'emailVerification',
          token: user.verificationToken
        })
        return res.status(200).json({})
      }
      return res.status(404).json({ error: 'User not found or already verified or token expired' })
    } else if (type === 'passwordReset') {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          forgotPasswordToken: true
        },
        where: {
          email
        }
      })
      if (user) {
        if (!user.forgotPasswordToken) {
          return res.status(400).json({ error: 'Password already reset' })
        }

        await sendEmail({
          to: email,
          type: 'passwordReset',
          token: user.forgotPasswordToken
        })
        return res.status(200).json({})
      }
      return res.status(404).json({ error: 'User not found or already reset or token expired' })
    }

    return res.status(400).json({ error: 'Invalid type' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})