import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/sendEmail'
import { genSaltSync, hashSync } from 'bcrypt'
import type { NextApiRequest, NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import { genSync } from 'random-web-token'
import { UAParser } from 'ua-parser-js'

type Data = {
  id?: string,
  privateKey?: string,
  deviceId?: string,
  error?: string
}

export default wrapper(async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing name or email or password' })
    }

    if (await prisma.user.count({ where: { email } })) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const token = genSync('extra', 72)

    const rsa = new NodeRSA()
    rsa.generateKeyPair()

    const user = await prisma.user.create({
      select: {
        id: true
      },
      data: {
        name,
        email,
        publicKey: rsa.exportKey('public'),
        role: await prisma.user.count() ? 'user' : 'owner',
        password: hashSync(password, genSaltSync()),
        verificationToken: token,
      }
    })

    const ua = new UAParser(req.headers['user-agent']).getResult()
    const device = await prisma.device.create({
      select: {
        id: true
      },
      data: {
        name: `${ua.browser.name} (${ua.os.name} ${ua.device.vendor})`,
        userId: user.id,
      }
    })

    await sendEmail({
      to: email,
      type: 'emailVerification',
      token
    })

    return res.status(200).json({
      id: user.id,
      privateKey: rsa.exportKey('private'),
      deviceId: device.id
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})