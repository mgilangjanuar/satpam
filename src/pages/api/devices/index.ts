import { NextApiRequestWithUser, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { parseQuery } from '@/utils/parseQuery'
import { Device } from '@prisma/client'
import { NextApiResponse } from 'next'
import { UAParser } from 'ua-parser-js'

interface Data {
  device?: Partial<Device>,
  devices?: Partial<Device>[]
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET' || (req.method === 'POST' && req.body?._search)) {
    const { _orderBy, _skip, _take, ...query } = req.query

    // build orderBy
    let sort: { [Property in keyof Device]?: 'asc' | 'desc' } = { createdAt: 'desc' }
    if (_orderBy) {
      const { _orderBy: order } = parseQuery(req.query, ['_orderBy'])
      const [key, value] = order.split(':')
      sort = { [key]: value as 'asc' | 'desc' || 'asc' }
    }

    // build pagination
    let skip = 0
    let take = undefined
    if (_skip || _take) {
      const { _skip: s, _take: t } = parseQuery(req.query, ['_skip', '_take'])
      skip = Number(s) || 0
      take = Number(t) || undefined
    }

    const devices = await prisma.device.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: sort,
      skip,
      take,
      where: {
        ...req.body?._search ?? parseQuery(query),
        userId: req.user?.id as string
      }
    })

    return res.status(200).json({ devices })
  }

  if (req.method === 'POST') {
    const { name } = req.body

    const ua = new UAParser(req.headers['user-agent']).getResult()
    const device = await prisma.device.create({
      select: {
        id: true,
        name: true,
      },
      data: {
        name: name || `${ua.browser.name} (${ua.os.name} ${ua.device.vendor})`,
        userId: req.user?.id as string
      }
    })

    return res.status(200).json({ device })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))