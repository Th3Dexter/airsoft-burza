import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { queryOne, insert } from '@/lib/mysql'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Kontrola, zda uživatel již existuje v databázi
        const existingUser = await queryOne(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        )

        if (!existingUser) {
          // Vytvoření nového uživatele v databázi
          const userId = await insert(
            `INSERT INTO users (id, name, email, image, createdAt, updatedAt, isVerified) 
             VALUES (?, ?, ?, ?, NOW(), NOW(), ?)`,
            [
              user.id || `user_${Date.now()}`,
              user.name,
              user.email,
              user.image,
              account?.provider === 'google' ? true : false
            ]
          )
          console.log('✅ Nový uživatel vytvořen v databázi:', user.email)
        } else {
          console.log('👤 Uživatel již existuje v databázi:', user.email)
        }

        return true
      } catch (error) {
        console.error('❌ Chyba při vytváření uživatele:', error)
        return true // Povolit přihlášení i při chybě
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}