'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import BookmarkManager from '@/components/BookmarkManager' // Import added

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  
  // ... (Keep existing useEffect and handleLogin/handleLogout logic same as before) ...
  // Re-pasting just the relevant useEffect for clarity:
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-900 font-sans p-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           ⚡ Smart Bookmarks
        </h1>
        {user && (
          <button
            onClick={handleLogout}
            className="text-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition"
          >
            Sign Out
          </button>
        )}
      </header>

      <main className="w-full max-w-4xl">
        {user ? (
          /* THIS IS THE NEW PART */
          <BookmarkManager user={user} />
        ) : (
          /* Login Screen (Keep this as it was) */
          <div className="flex flex-col items-center justify-center py-20 bg-white shadow-sm rounded-2xl border border-gray-100 mt-10">
             <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
             <p className="text-gray-500 mb-8">Login to access your private bookmarks.</p>
             <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-3 transition shadow-md"
            >
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}