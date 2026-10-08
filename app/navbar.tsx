'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from './supabase'
import UnreadBadge from './unread-badge'

// ============================================
// ✏️ CHANGE THIS TO YOUR ADMIN EMAIL
// ============================================
const ADMIN_EMAIL = 'bharathpinnika8078@gmail.com'
// ============================================

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = email === ADMIN_EMAIL

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

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  const linkClass = (href: string) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition ${
      pathname === href
        ? 'bg-white/10 text-white'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  const desktopLinkClass = (href: string) =>
    `relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
      pathname === href ? 'text-white' : 'text-slate-400 hover:text-white'
    }`

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="GEC Mart"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight">
            GEC<span className="gradient-text">Mart</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className={desktopLinkClass('/')}>
            Browse
          </Link>
          <Link href="/post" className={desktopLinkClass('/post')}>
            Sell
          </Link>

          {email ? (
            <>
              <Link
                href="/my-listings"
                className={desktopLinkClass('/my-listings')}
              >
                My Listings
              </Link>
              <Link href="/chats" className={desktopLinkClass('/chats')}>
                <span className="inline-flex items-center">
                  Chats
                  <UnreadBadge />
                </span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === '/admin'
                      ? 'text-red-400'
                      : 'text-red-400/80 hover:text-red-400'
                  }`}
                >
                  Admin
                </Link>
              )}

              <div className="ml-3 pl-3 border-l border-white/10 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAdmin
                        ? 'bg-gradient-to-br from-red-500 to-orange-500'
                        : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                    }`}
                  >
                    {email[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-400 max-w-[100px] truncate">
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10"
          aria-label="Menu"
        >
          {menuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-4 py-4 space-y-1">
          {email && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-white/5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  isAdmin
                    ? 'bg-gradient-to-br from-red-500 to-orange-500'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                }`}
              >
                {email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </div>
          )}

          <Link href="/" className={linkClass('/')}>
            Browse
          </Link>
          <Link href="/post" className={linkClass('/post')}>
            Sell
          </Link>

          {email && (
            <>
              <Link href="/my-listings" className={linkClass('/my-listings')}>
                My Listings
              </Link>
              <Link href="/chats" className={linkClass('/chats')}>
                <span className="inline-flex items-center">
                  Chats
                  <UnreadBadge />
                </span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition ${
                    pathname === '/admin'
                      ? 'bg-red-500/10 text-red-400'
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  🛡️ Admin Dashboard
                </Link>
              )}
            </>
          )}

          {email ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block mt-2 text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-3 rounded-lg font-medium transition"
            >
              Log In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}