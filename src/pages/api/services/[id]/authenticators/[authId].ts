import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { Authenticator } from '@prisma/client'
import type { NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import StringCrypto from 'string-crypto'

type Data = {
  authenticator?: Authenticator,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    const { id, authId } = req.query
    const authenticator = await prisma.authenticator.findFirst({
      where: {
        id: authId as string,
        serviceId: id as string
      }
    })

    if (!authenticator) {
      return res.status(404).json({ error: 'Authenticator not found' })
    }

    const { decryptString } = new StringCrypto({
      digest: process.env.DIGEST as string
    })

    return res.status(200).json({ authenticator: {
      ...authenticator,
      name: decryptString(authenticator.name, process.env.ENCRYPT_KEY as string),
      secret: decryptString(authenticator.secret, process.env.ENCRYPT_KEY as string)
    } })
  }

  if (req.method === 'PATCH') {
    const { id, authId } = req.query
    const authenticator = await prisma.authenticator.findFirst({
      select: {
        id: true
      },
      where: {
        id: authId as string,
        serviceId: id as string
      }
    })

    if (!authenticator) {
      return res.status(404).json({ error: 'Authenticator not found' })
    }

    let encryptString: ((str: string, password: string) => string) | undefined = undefined
    if (req.body.name || req.body.secret) {
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
        digest: process.env.DIGEST as string
      }).encryptString
    }

    await prisma.authenticator.update({
      where: {
        id: authenticator.id
      },
      data: {
        ...req.body,
        ...req.body.name && encryptString ? {
          name: encryptString(req.body.name, process.env.ENCRYPT_KEY as string)
        } : {},
        ...req.body.secret && encryptString ? {
          secret: encryptString(req.body.secret, process.env.ENCRYPT_KEY as string)
        } : {},
      }
    })

    return res.status(200).json({})
  }

  if (req.method === 'DELETE') {
    const { id, authId } = req.query
    const authenticator = await prisma.authenticator.findFirst({
      select: {
        id: true
      },
      where: {
        id: authId as string,
        serviceId: id as string
      }
    })

    if (!authenticator) {
      return res.status(404).json({ error: 'Authenticator not found' })
    }

    await prisma.authenticator.delete({
      where: {
        id: authenticator.id
      }
    })

    return res.status(200).json({})
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))