'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

// ============================================
// ✏️ CHANGE THIS TO YOUR ADMIN EMAIL
// ============================================
const ADMIN_EMAIL = 'your-email@gmail.com'
// ============================================

type Report = {
  id: string
  listing_id: string
  reporter_id: string
  reason: string
  created_at: string
  listings: {
    title: string
    seller_email: string
    status: string
  } | null
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== ADMIN_EMAIL) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)

      const { data } = await supabase
        .from('reports')
        .select(`
          *,
          listings (title, seller_email, status)
        `)
        .order('created_at', { ascending: false })

      setReports((data as any) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing permanently?')) return
    await supabase.from('listings').delete().eq('id', id)
    setReports((p) => p.filter((r) => r.listing_id !== id))
    alert('Listing deleted.')
  }

  async function dismissReport(id: string) {
    await supabase.from('reports').delete().eq('id', id)
    setReports((p) => p.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-slate-400 mb-4">Access denied.</p>
        <Link href="/" className="text-violet-400 underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        Admin <span className="gradient-text">Dashboard</span>
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        Review reported listings
      </p>

      {reports.length === 0 ? (
        <div className="glass rounded-2xl text-center py-16">
          <div className="text-5xl mb-3">✨</div>
          <p className="text-slate-400">No reports. Site is clean!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {r.listings?.title || 'Listing removed'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seller: {r.listings?.seller_email || 'unknown'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-3">
                <p className="text-xs uppercase tracking-wider text-red-400 mb-1">
                  Report reason
                </p>
                <p className="text-sm text-slate-300">{r.reason}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/listing/${r.listing_id}`}
                  target="_blank"
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
                >
                  View Listing
                </Link>
                <button
                  onClick={() => deleteListing(r.listing_id)}
                  className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition"
                >
                  Delete Listing
                </button>
                <button
                  onClick={() => dismissReport(r.id)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}