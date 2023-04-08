import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { genSaltSync, hashSync } from 'bcrypt'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default wrapper(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { token, type, newPassword } = req.body
    if (!token || !type) {
      return res.status(400).json({ error: 'Missing token or type' })
    }

    if (type === 'emailVerification') {
      const user = await prisma.user.findFirst({
        select: {
          id: true
        },
        where: {
          verificationToken: token
        }
      })
      if (user) {
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            verificationToken: null
          }
        })
        return res.status(200).json({})
      }
      return res.status(404).json({ error: 'User not found or already verified or token expired' })
    } else if (type === 'passwordReset') {
      if (!newPassword) {
        return res.status(400).json({ error: 'Missing newPassword' })
      }

      const user = await prisma.user.findFirst({
        select: {
          id: true
        },
        where: {
          forgotPasswordToken: token
        }
      })
      if (user) {
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            forgotPasswordToken: null,
            password: hashSync(newPassword, genSaltSync())
          }
        })
        return res.status(200).json({})
      }
      return res.status(404).json({ error: 'User not found or already reset or token expired' })
    }

    return res.status(400).json({ error: 'Invalid type' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})