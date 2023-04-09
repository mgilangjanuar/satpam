import { authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { parseQuery } from '@/utils/parseQuery'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  users?: Partial<User>[],
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET' || (req.method === 'POST' && req.body?._search)) {
    const { _orderBy, _skip, _take, ...query } = req.query

    // build orderBy
    let sort: { [Property in keyof User]?: 'asc' | 'desc' } = { createdAt: 'desc' }
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      },
      orderBy: sort,
      skip,
      take,
      where: req.body?._search ?? parseQuery(query)
    })

    return res.status(200).json({ users })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
