import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Zero Project
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!session ? (
            <Auth />
          ) : (
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center flex-col gap-4">
              <p className="text-xl text-gray-600">
                Bem-vindo, {session.user.email}!
              </p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-600 text-white rounded-md py-2 px-4 text-sm font-semibold hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
