import type { Metadata } from 'next'
import { Inter, Red_Hat_Display, Syncopate, Montserrat } from 'next/font/google'
import './globals.css'
import Menu from '../components/menu'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

// Fuentes oficiales de Europbots
const redHatDisplay = Red_Hat_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-red-hat'
})

const syncopate = Syncopate({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-syncopate'
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'EUROPBOTS',
  description: 'Application web moderne avec système d\'authentification',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

async function getUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/me`, {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.user
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
  return null
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Detectar cookie de autenticación
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  
  // Obtener datos del usuario si hay token
  const user = token ? await getUser(token) : null

  return (
    <html lang="fr" className={`${redHatDisplay.variable} ${syncopate.variable} ${montserrat.variable}`}>
      <body className={`${inter.className} font-red-hat bg-europbots-primary text-europbots-text`}>
        <Menu user={user} />
        {children}
      </body>
    </html>
  )
} 