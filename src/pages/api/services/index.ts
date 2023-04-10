import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { devicevalidation } from '@/_middlewares/devicevalidation'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { parseQuery } from '@/utils/parseQuery'
import { Service } from '@prisma/client'
import type { NextApiResponse } from 'next'

type Data = {
  services?: Service[],
  error?: string
}

export default authorization(devicevalidation(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET' || (req.method === 'POST' && req.body?._search)) {
    const { _orderBy, _skip, _take, ...query } = req.query

    // build orderBy
    let sort: { [Property in keyof Service]?: 'asc' | 'desc' } = { createdAt: 'desc' }
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

    const services = await prisma.service.findMany({
      orderBy: sort,
      skip,
      take,
      where: {
        ...req.body?._search ?? parseQuery(query),
        userId: req.user?.id as string
      }
    })

    return res.status(200).json({ services })
  }

  if (req.method === 'POST') {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'Missing url' })
    }

    await prisma.service.create({
      data: {
        url: url,
        host: new URL(url).host,
        userId: req.user?.id as string
      }
    })

    return res.status(200).json({})
  }
  return res.status(405).json({ error: 'Method not allowed' })
})))