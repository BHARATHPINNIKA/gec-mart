'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

type Conversation = {
  listing_id: string
  listing_title: string
  buyer_id: string
  buyer_email: string
  last_message: string
  last_message_at: string
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let channel: any = null

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      const { data: myListings } = await supabase
        .from('listings')
        .select('id, title')
        .eq('seller_id', user.id)

      const listings: { id: string; title: string }[] = myListings ?? []

      if (listings.length === 0) {
        setLoading(false)
        return
      }

      const listingIds = listings.map((l) => l.id)

      async function fetchMessages() {
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false })

        if (!msgs) return

        const map = new Map<string, Conversation>()
        for (const m of msgs) {
          const buyerKey = m.buyer_id || m.sender_id
          const key = `${m.listing_id}:${buyerKey}`
          const listing = listings.find((l) => l.id === m.listing_id)

          if (!map.has(key)) {
            map.set(key, {
              listing_id: m.listing_id,
              listing_title: listing?.title || 'Listing',
              buyer_id: buyerKey,
              buyer_email:
                m.sender_id === buyerKey ? m.sender_email : 'Buyer',
              last_message: m.content,
              last_message_at: m.created_at,
            })
          }
        }

        setConversations(Array.from(map.values()))
        setLoading(false)
      }

      await fetchMessages()

      // Real-time: refresh list when any new message arrives
      channel = supabase
        .channel('seller-inbox')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchMessages()
          }
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (!user && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">
          Please{' '}
          <Link href="/login" className="text-violet-400 underline">
            log in
          </Link>{' '}
          to see your chats.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Your <span className="gradient-text">Conversations</span>
      </h1>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : conversations.length === 0 ? (
        <div className="glass rounded-2xl text-center py-16 px-4">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-slate-400">No conversations yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            When buyers message you about your listings, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link
              key={`${c.listing_id}:${c.buyer_id}`}
              href={`/chat/${c.listing_id}/${c.buyer_id}`}
              className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-violet-500/30 transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                {(c.buyer_email?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white truncate">
                    {c.buyer_email?.split('@')[0] || 'Buyer'}
                  </p>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-violet-400 truncate mt-0.5">
                  Re: {c.listing_title}
                </p>
                <p className="text-sm text-slate-400 truncate mt-0.5">
                  {c.last_message}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}