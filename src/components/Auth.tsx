import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Navigate } from 'react-router-dom'

export function Auth() {
  const { signInWithPassword, signUp, user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  if (user) {
    return <Navigate to="/" />
  }

  const validateForm = () => {
    const errors: typeof fieldErrors = {}
    
    if (!isLogin) {
      if (formData.password.length < 6) {
        errors.password = 'A senha deve ter pelo menos 6 caracteres'
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        await signInWithPassword(formData.email, formData.password)
      } else {
        const { success, error } = await signUp(formData.email, formData.password, formData.name)
        if (!success && error) {
          setError(error)
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError(null)
    setFieldErrors({})
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    })
  }

  return (
    <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: '#213435' }}>
      <div className="w-full max-w-md mx-auto">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 mx-4">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold" style={{ color: '#213435' }}>
              {isLogin ? 'Bem-vindo' : 'Criar Conta'}
            </h2>
            <p style={{ color: '#46685b' }}>
              {isLogin 
                ? 'Entre para continuar sua jornada'
                : 'Comece sua jornada agora mesmo'}
            </p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Nome"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Seu nome completo"
                className="border-[#46685b] focus:border-[#648a64]"
              />
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="seu@email.com"
              className="border-[#46685b] focus:border-[#648a64]"
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="********"
              error={fieldErrors.password}
              className="border-[#46685b] focus:border-[#648a64]"
            />

            {!isLogin && (
              <Input
                label="Confirmar Senha"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="********"
                error={fieldErrors.confirmPassword}
                className="border-[#46685b] focus:border-[#648a64]"
              />
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3"
              style={{ 
                backgroundColor: '#46685b',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#213435'
                }
              }}
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={toggleForm}
              type="button"
              style={{ color: '#46685b' }}
              className="hover:text-[#213435] transition-colors"
            >
              {isLogin
                ? 'Não tem uma conta? Criar conta'
                : 'Já tem uma conta? Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
