'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function NavBar() {
  const { data: session, status } = useSession()
  const [lang, setLang] = useState<string>(typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en')
  const pathname = usePathname()

  const LinkItem = ({ href, label }: { href: string, label: string }) => (
    <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{label}</Link>
  )

  return (
    <nav className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-base font-semibold text-gray-900">AskDB</Link>
            <div className="hidden sm:flex items-center gap-1 ml-4">
              <LinkItem href="/askdb" label="AskDB" />
              <LinkItem href="/account" label="Account" />
              <LinkItem href="/billing" label="Billing" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => { setLang(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('lang', e.target.value) }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="es">ES</option>
            </select>
            {status === 'authenticated' ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600 mr-1">{session?.user?.email}</span>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="px-3 py-2 rounded-md text-sm font-medium border">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => signIn()} className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


