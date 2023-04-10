import { wrapper } from '@/_middlewares/wrapper'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/sendEmail'
import { genSaltSync, hashSync } from 'bcrypt'
import type { NextApiRequest, NextApiResponse } from 'next'
import NodeRSA from 'node-rsa'
import { genSync } from 'random-web-token'
import { UAParser } from 'ua-parser-js'

type Data = {
  privateKey?: string,
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
    await prisma.device.create({
      data: {
        name: `${ua.browser.name} (${ua.os.name} ${ua.device.vendor})`,
        token: genSync('extra', 72),
        userId: user.id,
      }
    })

    await sendEmail({
      to: email,
      type: 'emailVerification',
      token
    })

    return res.status(200).json({ privateKey: rsa.exportKey('private') })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})