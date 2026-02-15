'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Bookmark {
  id: string
  title: string
  url: string
  user_id: string
}

export default function BookmarkManager({ user }: { user: any }) {
  // FIX: Initialize client once so it doesn't reset on re-renders
  const [supabase] = useState(() => createClient()) 
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Initial Fetch
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setBookmarks(data)
      setLoading(false)
    }

    fetchBookmarks()

    // 2. Realtime Subscription
    console.log("🔌 Attempting to subscribe...")

    const channel = supabase
      .channel('realtime bookmarks') // Unique name for the channel
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public', 
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
          // If this works, we will add `filter: 'user_id=eq.' + user.id` back later.
        },
        (payload) => {
          console.log('⚡ REALTIME EVENT:', payload) // Look for this log!

          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        // This is crucial. It must say "SUBSCRIBED"
        console.log('📡 Subscription Status:', status) 
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id]) // Supabase dependency is now stable

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) return

    // Insert to DB
    const { error } = await supabase.from('bookmarks').insert({ 
      title, 
      url, 
      user_id: user.id 
    })

    if (error) {
      alert(error.message)
    } else {
      // Clear form only
      setTitle('')
      setUrl('')
    }
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().match({ id })
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Input Form */}
      <form onSubmit={addBookmark} className="mb-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex gap-3">
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 p-3 rounded-md flex-1"
        />
        <input 
          type="url" 
          placeholder="URL" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 p-3 rounded-md flex-1"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-md">Add</button>
      </form>

      {/* List */}
      <ul className="space-y-3">
        {bookmarks.map((bm) => (
          <li key={bm.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow flex justify-between">
            <a href={bm.url} target="_blank" className="text-blue-600 dark:text-blue-400 font-bold">{bm.title}</a>
            <button onClick={() => deleteBookmark(bm.id)} className="text-red-500 dark:text-red-400">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}