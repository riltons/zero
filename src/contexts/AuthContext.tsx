import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean, error?: string, message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (!email || !password || !name) {
        return { 
          success: false, 
          error: 'Por favor, preencha todos os campos' 
        }
      }

      if (password.length < 6) {
        return { 
          success: false, 
          error: 'A senha deve ter pelo menos 6 caracteres' 
        }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })

      if (error) {
        console.error('Erro ao criar usuário:', error)
        return { 
          success: false, 
          error: error.message === 'User already registered'
            ? 'Este e-mail já está registrado'
            : 'Erro ao criar usuário. Por favor, tente novamente.' 
        }
      }

      return { 
        success: true,
        message: 'Conta criada com sucesso! Por favor, verifique seu e-mail para confirmar o cadastro.'
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error)
      return { 
        success: false, 
        error: 'Ocorreu um erro inesperado. Por favor, tente novamente.' 
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    session,
    user,
    signOut,
    signInWithPassword,
    signUp,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
