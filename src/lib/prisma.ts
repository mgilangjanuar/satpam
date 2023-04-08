import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
// .$extends({
//   result: {
//     user: {
//       password: {
//         needs: { password: true },
//         compute({ password }) {
//           return password.replace(password, '*'.repeat(6))
//         },
//       },
//     },
//   },
// })