import { verify } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

export function authorization(fn: (req: NextApiRequestWithUser, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    if (!process.env.SECRET_KEY) return res.status(500).json({ error: 'Missing secret key' })

    const { authorized_token: token } = req.cookies
    let authData: UserAuthSafe

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      authData = verify(token, process.env.SECRET_KEY) as UserAuthSafe
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = authData
    await fn(req, res)
  }
}

export interface UserAuthSafe {
  id: string,
  name: string,
  email: string,
}

export interface NextApiRequestWithUser extends NextApiRequest {
  user?: UserAuthSafe
}