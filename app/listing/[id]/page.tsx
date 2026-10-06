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
  seller_phone: string | null
  status: string
  views: number
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

      // Only count unique views per browser
      const viewed = JSON.parse(localStorage.getItem('viewed') || '[]')
      if (!viewed.includes(id)) {
        supabase.rpc('increment_views', { listing_id: id })
        viewed.push(id)
        localStorage.setItem('viewed', JSON.stringify(viewed))
      }
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

  const isSold = listing.status === 'sold'

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
              className={`w-full h-full object-contain ${isSold ? 'opacity-40' : ''}`}
            />
          ) : (
            <span className="text-slate-600">No image</span>
          )}

          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className="text-xs uppercase tracking-wider text-white font-semibold bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
              {listing.category}
            </span>
          </div>

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-4xl sm:text-6xl font-bold text-red-400 border-4 border-red-400 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl rotate-[-8deg] bg-black/60 backdrop-blur">
                SOLD
              </span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-8">
          <h1
            className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 ${
              isSold ? 'text-slate-500' : ''
            }`}
          >
            {listing.title}
          </h1>

          <p
            className={`text-2xl sm:text-4xl font-bold mb-2 ${
              isSold ? 'text-slate-500 line-through' : 'gradient-text'
            }`}
          >
            ₹{listing.price.toLocaleString('en-IN')}
          </p>

          {/* Views counter */}
          <p className="text-sm text-slate-400 mb-4 sm:mb-6 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {listing.views || 0} views
            </span>
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

          {isSold ? (
            <div className="mt-6 pt-6 text-center py-8">
              <p className="text-lg sm:text-xl font-semibold text-red-400 mb-2">
                This item has been sold
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Check out similar listings on the homepage
              </p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-violet-600/20"
              >
                Browse other listings
              </Link>
            </div>
          ) : (
            <>
              {/* Contact Seller */}
              <div className="mt-4 sm:mt-6 pb-4 sm:pb-6 border-b border-white/5">
                <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Contact Seller
                </h2>

                {listing.seller_phone && (
                  <div className="flex gap-2 sm:gap-3 flex-wrap mb-3">
                    <a
                      href={`https://wa.me/${listing.seller_phone.replace(
                        /[^0-9]/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Hi, I'm interested in your "${listing.title}" (₹${listing.price}) on GEC Mart. Is it still available?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium transition shadow-lg shadow-green-500/20"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${listing.seller_phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition shadow-lg shadow-blue-600/20"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                      </svg>
                      Call
                    </a>
                  </div>
                )}

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

              {/* Report listing */}
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <button
                  onClick={async () => {
                    const reason = prompt('Why are you reporting this listing?')
                    if (!reason) return

                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      alert('Please log in to report.')
                      return
                    }

                    const { error } = await supabase.from('reports').insert({
                      listing_id: listing.id,
                      reporter_id: user.id,
                      reason,
                    })

                    if (error) {
                      alert('Could not submit report: ' + error.message)
                    } else {
                      alert('Report submitted. Thank you for keeping GEC Mart safe!')
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 underline transition"
                >
                  Report this listing
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}