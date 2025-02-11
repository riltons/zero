import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from './ui/Button'
import { Plus, UserPlus } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface Player {
  id: string
  full_name: string
  nickname?: string
  phone: string
  created_at: string
}

export function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('full_name')

      if (error) throw error

      setPlayers(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar jogadores:', error)
      setError('Não foi possível carregar os jogadores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlayer = () => {
    // TODO: Implementar criação de jogador
    console.log('Criar jogador')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold" style={{ color: '#213435' }}>
            Jogadores
          </h2>
          {!isMobile && (
            <Button
              onClick={handleCreatePlayer}
              className="flex items-center gap-2"
              style={{ 
                backgroundColor: '#46685b',
                color: '#fff'
              }}
            >
              <UserPlus size={20} />
              Novo Jogador
            </Button>
          )}
        </div>

        {error ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        ) : loading ? (
          <div className="text-center" style={{ color: '#46685b' }}>
            Carregando jogadores...
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#46685b' }}>
            Nenhum jogador cadastrado
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white p-6 rounded-xl border"
                style={{ borderColor: '#46685b' }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#213435' }}>
                  {player.full_name}
                </h3>
                {player.nickname && (
                  <p className="text-sm mb-2" style={{ color: '#46685b' }}>
                    Apelido: {player.nickname}
                  </p>
                )}
                <p className="text-sm" style={{ color: '#46685b' }}>
                  Telefone: {player.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB para mobile */}
      {isMobile && (
        <button
          onClick={handleCreatePlayer}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: '#46685b' }}
        >
          <Plus size={24} color="#fff" />
        </button>
      )}
    </div>
  )
}
