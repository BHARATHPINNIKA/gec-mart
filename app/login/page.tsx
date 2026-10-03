'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMsg(error.message)
      } else {
        setMsg('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMsg(error.message)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl shadow-violet-500/5 fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="GEC" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'login'
                ? 'Log in to continue'
                : 'Sign up with your email'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
                placeholder="you@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
                placeholder="At least 6 characters"
              />
            </div>

            {msg && (
              <div className="text-sm text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 rounded-xl font-medium transition disabled:opacity-50 shadow-lg shadow-violet-600/30"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center mt-4 text-sm">
              <Link
                href="/forgot-password"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Forgot your password?
              </Link>
            </p>
          )}

          <p className="text-center mt-4 text-sm text-slate-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setMsg('')
              }}
              className="text-violet-400 hover:text-violet-300 underline font-medium transition"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}