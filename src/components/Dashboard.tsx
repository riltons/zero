import { useAuth } from '../contexts/AuthContext'

export function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{user?.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white rounded-md py-2 px-4 text-sm font-semibold hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard!</h2>
            <p className="text-gray-600">
              Este é um exemplo de área protegida. Apenas usuários autenticados podem ver isto.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
