import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { devicevalidation } from '@/_middlewares/devicevalidation'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { Password } from '@prisma/client'
import type { NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import StringCrypto from 'string-crypto'

type Data = {
  password?: Password,
  error?: string
}

export default authorization(devicevalidation(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    const { id, passId } = req.query
    const password = await prisma.password.findFirst({
      where: {
        id: passId as string,
        serviceId: id as string
      }
    })

    if (!password) {
      return res.status(404).json({ error: 'Password not found' })
    }

    const { decryptString } = new StringCrypto({
      salt: process.env.SALT,
      digest: process.env.DIGEST as string
    })

    return res.status(200).json({ password: {
      ...password,
      username: decryptString(password.username, process.env.ENCRYPT_KEY as string),
      password: decryptString(password.password, process.env.ENCRYPT_KEY as string)
    } })
  }

  if (req.method === 'PATCH') {
    const { id, passId } = req.query
    const password = await prisma.password.findFirst({
      select: {
        id: true
      },
      where: {
        id: passId as string,
        serviceId: id as string
      }
    })

    if (!password) {
      return res.status(404).json({ error: 'Password not found' })
    }

    let encryptString: ((str: string, password: string) => string) | undefined = undefined
    if (req.body.username || req.body.password) {
      const user = await prisma.user.findUnique({
        select: {
          publicKey: true
        },
        where: {
          id: req.user?.id as string
        }
      })
      if (!user) {
        return res.status(400).json({ error: 'User not found' })
      }

      const rsa = new NodeRSA()
      rsa.importKey(user.publicKey)

      encryptString = new StringCrypto({
        salt: process.env.SALT,
        digest: process.env.DIGEST as string
      }).encryptString
    }


    await prisma.password.update({
      where: {
        id: password.id
      },
      data: {
        ...req.body,
        ...req.body.username && encryptString ? {
          username: encryptString(req.body.username, process.env.ENCRYPT_KEY as string)
        } : {},
        ...req.body.password && encryptString ? {
          password: encryptString(req.body.password, process.env.ENCRYPT_KEY as string)
        } : {},
      }
    })

    return res.status(200).json({})
  }

  if (req.method === 'DELETE') {
    const { id, passId } = req.query
    const password = await prisma.password.findFirst({
      select: {
        id: true
      },
      where: {
        id: passId as string,
        serviceId: id as string
      }
    })

    if (!password) {
      return res.status(404).json({ error: 'Password not found' })
    }

    await prisma.password.delete({
      where: {
        id: password.id
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
})))