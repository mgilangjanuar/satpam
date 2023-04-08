import { authorization } from '@/_middlewares/authorization'
import { serialize } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default authorization(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', serialize(
      'authorized_token', '', {
        maxAge: 0,
        httpOnly: true,
        expires: new Date()
      }
    ))
    res.end(res.getHeader('Set-Cookie'))
  }

  return res.status(405).json({ error: 'Method not allowed' })
})