import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from './db'
import { users, tenants } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
/* eslint-disable @typescript-eslint/no-explicit-any */

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.role     = (user as any).role
        token.tenantId = (user as any).tenantId
      }
      return token
    },
   async session({ session, token }) {
        return {
            ...session,
            user: {
            ...session.user,
            id:       token.sub ?? '',
            role:     token.role,
            tenantId: token.tenantId,
            }
        }
    },
  },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!valid) return null

        const tenant = await db.query.tenants.findFirst({
          where: eq(tenants.id, user.tenantId),
        })

        if (!tenant || tenant.status !== 'active') return null

        return {
          id:       String(user.id),
          email:    user.email,
          name:     user.name,
          role:     user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
})