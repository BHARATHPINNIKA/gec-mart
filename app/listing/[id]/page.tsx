'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../supabase'
import Chat from './chat'

type Listing = {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  seller_email: string
  seller_id: string
}

export default function ListingPage() {
  const { id } = useParams() as { id: string }
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error(error)
      setListing(data)
      setLoading(false)
    }
    if (id) fetchListing()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="text-slate-400">Listing not found.</p>
        <Link href="/" className="text-violet-400 underline mt-4 inline-block">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition"
      >
        ← Back to listings
      </Link>

      <div className="mt-4 sm:mt-6 glass-strong rounded-2xl overflow-hidden">
        <div className="relative h-72 sm:h-96 bg-slate-900 flex items-center justify-center">
          {listing.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-slate-600">No image</span>
          )}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className="text-xs uppercase tracking-wider text-white font-semibold bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
              {listing.category}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            {listing.title}
          </h1>
          <p className="text-2xl sm:text-4xl font-bold gradient-text mb-4 sm:mb-6">
            ₹{listing.price.toLocaleString('en-IN')}
          </p>

          {listing.description && (
            <div className="mt-4 sm:mt-6 pb-4 sm:pb-6 border-b border-white/5">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                Description
              </h2>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact Seller */}
          <div className="mt-4 sm:mt-6 pb-4 sm:pb-6 border-b border-white/5">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
              Contact Seller
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-mono text-xs sm:text-sm text-slate-300 break-all">
                {listing.seller_email}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(listing.seller_email)
                  alert('Email copied!')
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition"
              >
                Copy
              </button>
              <a
                href={`mailto:${listing.seller_email}?subject=Interested in ${encodeURIComponent(listing.title)}`}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-violet-600/20"
              >
                Email
              </a>
            </div>
          </div>

          {/* Chat */}
          <Chat
            listingId={listing.id}
            sellerId={listing.seller_id}
            sellerEmail={listing.seller_email}
          />

          {/* Link to all chats */}
          <div className="mt-6 pt-4 border-t border-white/5 text-right">
            <Link
              href="/chats"
              className="text-sm text-violet-400 hover:text-violet-300 underline"
            >
              See all my chats →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}