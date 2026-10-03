'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

type Listing = {
  id: string
  title: string
  price: number
  category: string
  image_url: string | null
  status: string
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setListings(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function markSold(id: string) {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id)
    setListings((p) => p.map((l) => (l.id === id ? { ...l, status: 'sold' } : l)))
  }

  async function remove(id: string) {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings((p) => p.filter((l) => l.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          My <span className="gradient-text">Listings</span>
        </h1>
        <p className="text-slate-400">Manage what you&apos;re selling</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : listings.length === 0 ? (
        <div className="glass rounded-2xl text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-slate-400 mb-4">You haven&apos;t posted anything yet.</p>
          <Link
            href="/post"
            className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:scale-[1.02] transition"
          >
            Post your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-violet-500/30 transition"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-white/5">
                {l.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/listing/${l.id}`}
                  className="font-semibold text-white hover:text-violet-300 transition line-clamp-1"
                >
                  {l.title}
                </Link>
                <p className="text-slate-400 text-sm">
                  ₹{l.price.toLocaleString('en-IN')}
                </p>
                <span
                  className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${
                    l.status === 'sold'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {l.status === 'sold' ? 'Sold' : 'Available'}
                </span>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {l.status !== 'sold' && (
                  <button
                    onClick={() => markSold(l.id)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
                  >
                    Mark Sold
                  </button>
                )}
                <button
                  onClick={() => remove(l.id)}
                  className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}