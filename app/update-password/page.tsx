'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // The reset link puts a session in the URL hash.
    // Supabase JS auto-detects it. We just check if a session exists.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        setMsg('Invalid or expired reset link. Please request a new one.')
      }
    })

    // Also listen for the auth state change (link may be detected async)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMsg(error.message)
      setLoading(false)
    } else {
      setMsg('Password updated! Redirecting...')
      setTimeout(() => router.push('/'), 1500)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <p className="text-slate-400 text-center">{msg || 'Verifying link...'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 fade-in">
        <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
        <p className="text-sm text-slate-400 mb-6">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
            placeholder="New password (min 6 characters)"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {msg && (
          <div className="text-sm text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2 mt-4">
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}