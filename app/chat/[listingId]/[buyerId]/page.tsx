'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../supabase'

type Message = {
  id: string
  listing_id: string
  buyer_id: string
  sender_id: string
  sender_email: string
  content: string
  created_at: string
}

type Listing = {
  id: string
  title: string
  image_url: string | null
  price: number
}

export default function ConversationPage() {
  const params = useParams() as { listingId: string; buyerId: string }
  const { listingId, buyerId } = params

  const [messages, setMessages] = useState<Message[]>([])
  const [listing, setListing] = useState<Listing | null>(null)
  const [otherEmail, setOtherEmail] = useState<string>('')
  const [input, setInput] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [])

  useEffect(() => {
    if (!currentUser) return

    async function load() {
      // Load listing info
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, image_url, price')
        .eq('id', listingId)
        .single()
      setListing(listingData)

      // Load messages for this conversation
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])

      // Mark all incoming messages as read
      const { error: readError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .neq('sender_id', currentUser.id)

      if (readError) {
        console.log('Mark as read error:', readError.message)
      } else {
        console.log('Mark as read: SUCCESS')
      }

      // Find the other person's email
      const other = (msgs || []).find((m) => m.sender_id !== currentUser.id)
      if (other) setOtherEmail(other.sender_email)

      setLoading(false)
    }
    load()

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`conversation:${listingId}:${buyerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.buyer_id !== buyerId) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })

          // If the message is from the other person, mark it read immediately
          if (msg.sender_id !== currentUser.id) {
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', msg.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, listingId, buyerId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !currentUser) return

    const content = input.trim()
    setInput('')

    await supabase.from('messages').insert({
      listing_id: listingId,
      buyer_id: buyerId,
      sender_id: currentUser.id,
      sender_email: currentUser.email,
      content,
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-slate-400">Loading conversation...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
        <Link
          href="/chats"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex-shrink-0"
        >
          ←
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
          {(otherEmail?.[0] || '?').toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate">
            {otherEmail?.split('@')[0] || 'Chat'}
          </p>
          <p className="text-xs text-slate-400 truncate">
            Re: {listing?.title || 'Listing'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-black/20 rounded-2xl border border-white/5 p-3 sm:p-4">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser?.id
            return (
              <div
                key={msg.id}
                className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                    {isOwn ? 'You' : msg.sender_email?.split('@')[0] || 'Them'}
                  </p>
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-violet-600/20 flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  )
}