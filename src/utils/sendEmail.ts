import { createTransport } from 'nodemailer'

interface Attributes {
  to: string,
  type: 'emailVerification' | 'passwordReset',
  token: string
}

export async function sendEmail({ to, type, token }: Attributes) {
  if (!process.env.SMTP_URL) throw new Error('SMTP_URL is not defined')
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is not defined')

  const transporter = createTransport(process.env.SMTP_URL)

  let subject, text, html
  if (type === 'emailVerification') {
    subject = 'Verify your email'
    text = `Verify your email by clicking on the following link: ${process.env.BASE_URL}/auth/verify?token=${token}`
    html = `Verify your email by clicking on the following link: <a href="${process.env.BASE_URL}/auth/verify?token=${token}">${process.env.BASE_URL}/auth/verify?token=${token}</a>`
  } else if (type === 'passwordReset') {
    subject = 'Reset your password'
    text = `Reset your password by clicking on the following link: ${process.env.BASE_URL}/auth/reset?token=${token}`
    html = `Reset your password by clicking on the following link: <a href="${process.env.BASE_URL}/auth/reset?token=${token}">${process.env.BASE_URL}/auth/reset?token=${token}</a>`
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  })
}