'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from './supabase'

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
    })

    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const linkClass = (href: string) =>
    `relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
      pathname === href ? 'text-white' : 'text-slate-400 hover:text-white'
    }`

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-strong border-b border-white/5'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — college logo image + GECMart */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="GEC Mart Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            GEC<span className="gradient-text">Mart</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/" className={linkClass('/')}>
            Browse
          </Link>
          <Link href="/post" className={linkClass('/post')}>
            Sell
          </Link>

          {email ? (
            <>
              <Link href="/my-listings" className={linkClass('/my-listings')}>
                My Listings
              </Link>
              <div className="ml-3 pl-3 border-l border-white/10 flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                    {email[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-400 max-w-[120px] truncate">
                    {email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-violet-600/30"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}