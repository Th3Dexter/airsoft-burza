import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { queryOne, insert, query } from '@/lib/mysql'

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
          // Uživatel existuje - použít jeho ID a aktualizovat profilovou fotku z Google účtu
          ;(user as any).id = existingUser.id
          
          // Aktualizace profilové fotky a jména z Google účtu, pokud jsou k dispozici
          if (user.image || user.name) {
            try {
              const updateFields: string[] = []
              const updateValues: any[] = []
              
              if (user.image) {
                updateFields.push('image = ?')
                updateValues.push(user.image)
              }
              
              if (user.name) {
                updateFields.push('name = ?')
                updateValues.push(user.name)
              }
              
              if (updateFields.length > 0) {
                updateFields.push('updatedAt = NOW()')
                updateValues.push(existingUser.id)
                
                await query(
                  `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
                  updateValues
                )
                console.log('✅ Profilová fotka a jméno aktualizovány z Google účtu:', user.email)
              }
            } catch (updateError) {
              console.error('⚠️ Chyba při aktualizaci profilové fotky:', updateError)
              // Nepřerušit přihlášení kvůli chybě aktualizace fotky
            }
          }
          
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
      
      // Vždy načíst isAdmin z databáze (i pro existující tokeny)
      if (token.id) {
        const dbUser = await queryOne(
          'SELECT isAdmin FROM users WHERE id = ?',
          [token.id]
        )
        if (dbUser) {
          token.isAdmin = dbUser.isAdmin || false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        (session.user as any).id = token.id as string
        (session.user as any).isAdmin = token.isAdmin || false
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}