import { NextApiRequestWithUser, UserAuthSafe, authorization } from '@/_middlewares/authorization'
import { wrapper } from '@/_middlewares/wrapper'
import type { NextApiResponse } from 'next'

type Data = {
  user?: UserAuthSafe,
  error?: string
}

export default authorization(wrapper(async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<Data>
) => {
  return res.status(200).json({ user: req.user })
}))