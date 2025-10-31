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
        if (!user.email) {
          console.error('❌ Email není k dispozici')
          return false
        }

        // Kontrola, zda uživatel již existuje v databázi (podle emailu)
        const existingUser = await queryOne(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        )

        if (!existingUser) {
          // Vytvoření nového uživatele v databázi (jen pokud neexistuje)
          const userId = user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          try {
            await insert(
              `INSERT INTO users (id, name, email, image, createdAt, updatedAt, isVerified) 
               VALUES (?, ?, ?, ?, NOW(), NOW(), ?)`,
              [
                userId,
                user.name,
                user.email,
                user.image,
                account?.provider === 'google' ? true : false
              ]
            )
            // Nastavit user.id pro JWT callback
            ;(user as any).id = userId
            console.log('✅ Nový uživatel vytvořen v databázi:', user.email)
          } catch (insertError: any) {
            // Pokud je to duplicitní ID, zkusit načíst existujícího uživatele podle emailu
            if (insertError.code === 'ER_DUP_ENTRY') {
              const retryUser = await queryOne(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
              )
              if (retryUser) {
                ;(user as any).id = retryUser.id
                console.log('👤 Uživatel nalezen po konfliktu ID:', user.email)
              } else {
                console.error('❌ Duplicitní ID a uživatel nebyl nalezen')
                return false
              }
            } else {
              throw insertError
            }
          }
        } else {
          // Uživatel existuje - použít jeho ID
          ;(user as any).id = existingUser.id
          console.log('👤 Uživatel již existuje v databázi:', user.email)
        }

        return true
      } catch (error) {
        console.error('❌ Chyba při přihlášení uživatele:', error)
        return false // Nepovolit přihlášení při chybě
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
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