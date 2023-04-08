import { NextApiRequest, NextApiResponse } from 'next'

export function wrapper(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await fn(req, res)
    } catch (error: any) {
      res.status(500).json({ error: error.message || error })
    }
  }
}