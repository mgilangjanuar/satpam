import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { parseQuery } from '@/utils/parseQuery'
import { Password } from '@prisma/client'
import type { NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import StringCrypto from 'string-crypto'

type Data = {
  passwords?: Password[],
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET' || (req.method === 'POST' && req.body?._search)) {
    const { _orderBy, _skip, _take, id: _, ...query } = req.query

    // build orderBy
    let sort: { [Property in keyof Password]?: 'asc' | 'desc' } = { createdAt: 'desc' }
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
      digest: process.env.DIGEST as string
    })

    const passwords = await prisma.password.findMany({
      orderBy: sort,
      skip,
      take,
      where: {
        ...req.body?._search ?? parseQuery(query),
        serviceId: req.query.id as string
      }
    })

    return res.status(200).json({
      passwords: passwords.map(password => ({
        ...password,
        username: decryptString(password.username, process.env.ENCRYPT_KEY as string),
        password: decryptString(password.password, process.env.ENCRYPT_KEY as string)
      }))
    })
  }

  if (req.method === 'POST') {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
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
      digest: process.env.DIGEST as string
    })
    await prisma.password.create({
      data: {
        username: encryptString(
          rsa.encrypt(username, 'base64'), process.env.ENCRYPT_KEY as string),
        password: encryptString(
          rsa.encrypt(password, 'base64'), process.env.ENCRYPT_KEY as string),
        serviceId: req.query.id as string
      }
    })

    return res.status(200).json({})
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))