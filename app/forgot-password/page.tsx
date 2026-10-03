 'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Check your email for the password reset link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 fade-in">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
            placeholder="you@gmail.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {msg && (
          <div className="text-sm text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2 mt-4">
            {msg}
          </div>
        )}

        <p className="text-center mt-6 text-sm text-slate-400">
          Remembered it?{' '}
          <Link href="/login" className="text-violet-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}