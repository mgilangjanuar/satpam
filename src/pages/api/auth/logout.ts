import { authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import { serialize } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', serialize(
      'authorized_token', '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        expires: new Date()
      }
    ))
    return res.end('{}')
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))