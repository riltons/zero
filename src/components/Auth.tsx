import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Navigate, useLocation } from 'react-router-dom'

export function Auth() {
  const { signInWithPassword, signUp, user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    phone: ''
  })
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
    phone?: string
  }>({})

  if (user) {
    const from = (location.state as any)?.from || '/dashboard'
    return <Navigate to={from} replace />
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
      if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Telefone inválido. Use o formato: DDD + número'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!validateForm()) {
        setLoading(false)
        return
      }

      if (isLogin) {
        const { error } = await signInWithPassword(formData.email, formData.password)
        if (error) throw error
      } else {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.nickname,
          formData.phone
        )
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Formatação de telefone
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '')
      if (value.length <= 11) {
        if (value.length > 2) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`
        }
        if (value.length > 10) {
          value = value.slice(0, 10) + '-' + value.slice(10)
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }))
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
              <>
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

                <Input
                  label="Apelido (opcional)"
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Como você é conhecido"
                  className="border-[#46685b] focus:border-[#648a64]"
                />

                <Input
                  label="Celular"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="(00) 00000-0000"
                  error={fieldErrors.phone}
                  className="border-[#46685b] focus:border-[#648a64]"
                />
              </>
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
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFieldErrors({})
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  name: '',
                  nickname: '',
                  phone: ''
                })
              }}
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
