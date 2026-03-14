import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SNOWBALL - Crypto Trading',
  description: 'Compound your way to crypto freedom with the Snowball method',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.className}>
      <body style={{ backgroundColor: '#020918', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
