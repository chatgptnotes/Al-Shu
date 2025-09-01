import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI-Shu | One-Stop Student Support',
  description: 'Your calm, smart guide for school success. Universal subject help, exam prep, coursework coaching, and time management.',
  keywords: 'education, AI tutor, IGCSE, IB, A-Levels, CBSE, exam preparation, homework help',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}