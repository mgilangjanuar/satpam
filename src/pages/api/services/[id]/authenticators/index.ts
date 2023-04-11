import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { devicevalidation } from '@/_middlewares/devicevalidation'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { parseQuery } from '@/utils/parseQuery'
import { Authenticator } from '@prisma/client'
import type { NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import StringCrypto from 'string-crypto'

type Data = {
  authenticators?: Authenticator[],
  error?: string
}

export default authorization(devicevalidation(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET' || (req.method === 'POST' && req.body?._search)) {
    const { _orderBy, _skip, _take, id: _, ...query } = req.query

    // build orderBy
    let sort: { [Property in keyof Authenticator]?: 'asc' | 'desc' } = { createdAt: 'desc' }
    if (_orderBy) {
      const { _orderBy: order } = parseQuery(req.query, ['_orderBy'])
      const [key, value] = order.split(':')
      sort = { [key]: value as 'asc' | 'desc' || 'asc' }
    }

    // build pagination
    let skip = 0
    let take = 10
    if (_skip || _take) {
      const { _skip: s, _take: t } = parseQuery(req.query, ['_skip', '_take'])
      skip = Number(s) || 0
      take = Number(t) || 10
    }

    const { decryptString } = new StringCrypto({
      salt: process.env.SALT,
      digest: process.env.DIGEST as string
    })

    const authenticators = await prisma.authenticator.findMany({
      orderBy: sort,
      skip,
      take,
      where: {
        ...req.body?._search ?? parseQuery(query),
        serviceId: req.query.id as string
      }
    })

    return res.status(200).json({
      authenticators: authenticators.map(authenticator => ({
        ...authenticator,
        name: decryptString(authenticator.name, process.env.ENCRYPT_KEY as string),
        secret: decryptString(authenticator.secret, process.env.ENCRYPT_KEY as string)
      }))
    })
  }

  if (req.method === 'POST') {
    const { name, secret, digits, period, algorithm } = req.body

    if (!name || !secret) {
      return res.status(400).json({ error: 'Missing name or secret' })
    }

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

    const { encryptString } = new StringCrypto({
      salt: process.env.SALT,
      digest: process.env.DIGEST as string
    })
    await prisma.authenticator.create({
      data: {
        name: encryptString(
          rsa.encrypt(name, 'base64'), process.env.ENCRYPT_KEY as string),
        secret: encryptString(
          rsa.encrypt(secret, 'base64'), process.env.ENCRYPT_KEY as string),
        digits: digits || 6,
        period: period || 30,
        algorithm: algorithm || 'SHA-1',
        serviceId: req.query.id as string
      }
    })

    return res.status(200).json({})
  }
  return res.status(405).json({ error: 'Method not allowed' })
})))