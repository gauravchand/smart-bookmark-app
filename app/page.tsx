'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import BookmarkManager from '@/components/BookmarkManager' // Import added
import { ThemeToggle } from './theme-toggle'

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
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 font-mono p-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-center items-center py-6 mb-4 relative">
        <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
            Smart Bookmarks 📑
        </h1>
        <div className="absolute right-0 flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded transition"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-4xl">
        {user ? (
          /* THIS IS THE NEW PART */
          <BookmarkManager user={user} />
        ) : (
          /* Login Screen (Keep this as it was) */
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 mt-10">
             <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Welcome Back</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8">Login to access your private bookmarks.</p>
             <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-3 transition shadow-md"
            >
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}