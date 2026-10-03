'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Link from 'next/link'

type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string | null
  seller_email: string
}

const categories = [
  { value: 'all', label: 'All Items', icon: '✦' },
  { value: 'calculator', label: 'Calculators', icon: '🧮' },
  { value: 'drafting', label: 'Drafting Tools', icon: '📐' },
  { value: 'books', label: 'Textbooks', icon: '📚' },
  { value: 'lab', label: 'Lab Equipment', icon: '⚗️' },
  { value: 'electronics', label: 'Electronics', icon: '🔌' },
  { value: 'components', label: 'Components', icon: '⚡' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'stationery', label: 'Stationery', icon: '✏️' },
  { value: 'safety', label: 'Safety Gear', icon: '🦺' },
  { value: 'projects', label: 'Project Kits', icon: '🛠️' },
  { value: 'tools', label: 'Hand Tools', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📦' },
]

const COLLEGE_NAME = 'SESHADRI RAO GUDLAVALLERU ENGINEERING COLLEGE'
const DEPARTMENT_NAME = 'DEPARTMENT OF IMFORMATION TECHNOLOGY'
const COLLEGE_TAGLINE = 'Where innovation meets engineering excellence'
const COLLEGE_IMAGE = '/college.jpg'

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (category !== 'all') query = query.eq('category', category)

      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
        )
      }

      const { data, error } = await query
      if (error) console.error(error)
      setListings(data || [])
      setLoading(false)
    }

    const timeout = setTimeout(fetchListings, 300)
    return () => clearTimeout(timeout)
  }, [category, search])

  return (
    <div>
      {/* HERO WITH BACKGROUND IMAGE */}
      <section className="relative overflow-hidden min-h-[650px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COLLEGE_IMAGE}
          alt={COLLEGE_NAME}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Lighter overlay — image shows more */}
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        <div className="grid-bg absolute inset-0 opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs text-white mb-6 fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
              <span className="font-semibold">{COLLEGE_NAME}</span>
              <span className="text-white/40">·</span>
              <span className="text-violet-300 font-medium">{DEPARTMENT_NAME}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 fade-in text-white">
              The marketplace for
              <br />
              <span className="gradient-text">engineering minds.</span>
            </h1>

            <p className="text-lg text-slate-200 max-w-xl mb-10 fade-in leading-relaxed">
              Buy and sell calculators, drafting kits, textbooks, and lab gear —
              with verified students on your campus.
            </p>

            <div className="flex items-center gap-4 flex-wrap fade-in">
              <Link
                href="/post"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-violet-600/40 hover:shadow-violet-500/60 hover:scale-[1.02]"
              >
                Start Selling
                <span className="group-hover:translate-x-0.5 transition">→</span>
              </Link>
              <a
                href="#listings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-white/30 text-white backdrop-blur hover:bg-white/10 transition"
              >
                Browse Listings
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg fade-in">
              <div>
                <div className="text-3xl font-bold gradient-text">
                  {listings.length}+
                </div>
                <div className="text-xs text-slate-300 mt-1 uppercase tracking-wider">
                  Listings
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">100%</div>
                <div className="text-xs text-slate-300 mt-1 uppercase tracking-wider">
                  Verified
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">Free</div>
                <div className="text-xs text-slate-300 mt-1 uppercase tracking-wider">
                  Forever
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="listings" className="max-w-7xl mx-auto px-6 py-16">
        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search calculators, textbooks, tools..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`group flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-white/15 border-violet-500/40 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {(search || category !== 'all') && !loading && (
          <p className="text-sm text-slate-400 mb-6">
            {listings.length} result{listings.length !== 1 ? 's' : ''}
            {search && (
              <>
                {' '}
                for{' '}
                <span className="text-white font-medium">
                  &quot;{search}&quot;
                </span>
              </>
            )}
            {category !== 'all' && (
              <>
                {' '}
                in{' '}
                <span className="text-white font-medium">
                  {categories.find((c) => c.value === category)?.label}
                </span>
              </>
            )}
          </p>
        )}

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-white/5 rounded" />
                  <div className="h-5 w-3/4 bg-white/5 rounded" />
                  <div className="h-6 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="glass rounded-2xl text-center py-20 px-6">
            <div className="text-6xl mb-4">{search ? '🔍' : '📦'}</div>
            <p className="text-slate-400 mb-4">
              {search
                ? `No results for "${search}".`
                : 'No listings yet in this category.'}
            </p>
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="text-violet-400 hover:text-violet-300 underline font-medium"
              >
                Clear search
              </button>
            ) : (
              <Link
                href="/post"
                className="text-violet-400 hover:text-violet-300 underline font-medium"
              >
                Be the first to post one
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group glass rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  {listing.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs uppercase tracking-wider text-white font-semibold bg-black/50 backdrop-blur px-2 py-1 rounded-md border border-white/10">
                      {listing.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg text-white line-clamp-1 mb-2 group-hover:text-violet-300 transition">
                    {listing.title}
                  </h2>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-white">
                      ₹{listing.price.toLocaleString('en-IN')}
                    </p>
                    <span className="text-xs text-slate-500 group-hover:text-violet-400 transition">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}