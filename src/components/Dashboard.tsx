import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Logo } from './ui/Logo'
import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Dashboard() {
  const { user, signOut, profile } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen w-full fixed inset-0" style={{ backgroundColor: '#213435' }}>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Logo />
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-[#46685b] text-white' 
                      : 'text-[#46685b] hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/players"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/players')
                      ? 'bg-[#46685b] text-white'
                      : 'text-[#46685b] hover:bg-gray-100'
                  }`}
                >
                  Jogadores
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={{ color: '#46685b' }}>
                {profile?.full_name}
              </span>
              <button
                onClick={signOut}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Sair"
              >
                <LogOut size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold" style={{ color: '#213435' }}>
                Bem-vindo ao Dashboard!
              </h2>
              <p style={{ color: '#46685b' }}>
                Este é um exemplo de área protegida. Apenas usuários autenticados podem ver isto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-xl border" style={{ borderColor: '#46685b' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#213435' }}>
                  Estatísticas
                </h3>
                <p style={{ color: '#46685b' }}>
                  Visualize suas estatísticas e métricas importantes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-xl border" style={{ borderColor: '#46685b' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#213435' }}>
                  Atividades
                </h3>
                <p style={{ color: '#46685b' }}>
                  Acompanhe suas atividades e progresso.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-xl border" style={{ borderColor: '#46685b' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#213435' }}>
                  Configurações
                </h3>
                <p style={{ color: '#46685b' }}>
                  Personalize suas preferências e configurações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
