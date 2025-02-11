import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { Players } from './components/Players'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  const { loading, user } = useAuth()
  
  console.log('App:', { loading, user: !!user })

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#213435' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#213435' }}>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
