import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EklēsiaApp — Gestão de Membros',
  description: 'Sistema completo de gestão de membros para igrejas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={syne.variable}>
      <body className="bg-stone-50 text-stone-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
