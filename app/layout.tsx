import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import dynamic from 'next/dynamic'
const NavBar = dynamic(() => import('../components/NavBar'), { ssr: false })

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
      <body className={inter.className}><Providers><NavBar />{children}</Providers></body>
    </html>
  )
}
