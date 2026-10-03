'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../supabase'

type Message = {
  id: string
  listing_id: string
  sender_id: string
  sender_email: string
  content: string
  created_at: string
}

type ChatProps = {
  listingId: string
  sellerId: string
  sellerEmail: string
}

export default function Chat({ listingId, sellerId, sellerEmail }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (!currentUser) return

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
      setLoading(false)
    }
    loadMessages()

    const channel = supabase
      .channel(`chat:${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, listingId])

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
      sender_id: currentUser.id,
      sender_email: currentUser.email,
      content,
    })
  }

  if (!currentUser) {
    return (
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-sm text-slate-400">
          Please{' '}
          <a href="/login" className="text-violet-400 underline">
            log in
          </a>{' '}
          to chat with the seller.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-4">
        Chat with Seller
      </h2>

      <div className="bg-black/30 border border-white/5 rounded-xl p-4 h-72 overflow-y-auto mb-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser.id
            return (
              <div
                key={msg.id}
                className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                    {isOwn ? 'You' : msg.sender_email?.split('@')[0] || 'Seller'}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-violet-600/20"
        >
          Send
        </button>
      </form>
    </div>
  )
}