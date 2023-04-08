import { NextApiRequestWithUser, UserAuthSafe, authorization } from '@/_middlewares/authorization'
import type { NextApiResponse } from 'next'

type Data = {
  user?: UserAuthSafe,
  error?: string
}

export default authorization(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  return res.status(200).json({ user: req.user })
})