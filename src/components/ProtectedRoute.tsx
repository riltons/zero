import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  console.log('ProtectedRoute:', { path: location.pathname, loading, user: !!user })

  // Se ainda está carregando, mostra nada
  if (loading) {
    return null
  }

  // Se não está autenticado, redireciona para /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Se está autenticado, mostra o conteúdo
  return <>{children}</>
}
