import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

interface Options {
  bypass?: boolean,
  roles?: string[]
}

export function authorization(fn: (req: NextApiRequestWithUser, res: NextApiResponse) => Promise<void | NextApiResponse>, opts?: Options) {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    if (!process.env.SECRET_KEY) return res.status(500).json({ error: 'Missing secret key' })

    const { authorized_token: token } = req.cookies
    let authData: UserAuthSafe | undefined = undefined

    // if token is not present and bypass is not enabled, return unauthorized
    if (!token && !opts?.bypass) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (token) {
      try {
        // get user data from token
        authData = verify(token, process.env.SECRET_KEY) as UserAuthSafe
      } catch (error) {
        console.error(error)

        // if token is invalid, return unauthorized
        if (!opts?.bypass) {
          return res.status(401).json({ error: 'Unauthorized' })
        }
      }
    }

    if (authData) {
      // check if user exists and is not deleted
      const user = await prisma.user.findFirst({
        select: { role: true, deletedAt: true },
        where: { id: authData.id }
      })

      // if user does not exist or is deleted, return unauthorized
      if ((!user || user.deletedAt) && !opts?.bypass) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // if user exists and has a role, check if user has the required role
      if (user && opts?.roles?.length) {
        if (!opts.roles.includes(user.role) && !opts?.bypass) {
          return res.status(401).json({ error: 'Unauthorized' })
        }
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        id: authData?.id as string
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) as UserAuthSafe

    req.user = user
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