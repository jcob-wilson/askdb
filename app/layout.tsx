import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AskDB',
  description: 'AskDB - Convert natural language queries to MongoDB aggregation pipelines with AI-powered intelligence',
  openGraph: {
    title: 'AskDB',
    description: 'AskDB - Convert natural language queries to MongoDB aggregation pipelines with AI-powered intelligence',
    url: '/askdb',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
