'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function UnreadBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let channel: any = null

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all my listings (I'm the seller)
      const { data: myListings } = await supabase
        .from('listings')
        .select('id')
        .eq('seller_id', user.id)

      const listingIds = (myListings ?? []).map((l) => l.id)

      // Count unread messages where I'm the seller (not the sender)
      let sellerUnread = 0
      if (listingIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIds)
          .eq('read', false)
          .neq('sender_id', user.id)
        sellerUnread = count || 0
      }

      // Count unread messages where I'm the buyer
      const { count: buyerCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('read', false)
        .neq('sender_id', user.id)

      setCount(sellerUnread + (buyerCount || 0))

      // Realtime: refresh count on new messages
      channel = supabase
        .channel('unread-badge')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => {
            load()
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          () => {
            load()
          }
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
      {count > 99 ? '99+' : count}
    </span>
  )
}