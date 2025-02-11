import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  user_id: string
  full_name: string
  roles: string[]
  created_at: string
  updated_at: string
}

interface Player {
  id: string
  full_name: string
  nickname?: string
  phone: string
  user_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  player: Player | null
  isAdmin: boolean
  isOrganizer: boolean
  signOut: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (
    email: string, 
    password: string, 
    name: string,
    playerData?: {
      phone: string
      nickname?: string
    }
  ) => Promise<{ success: boolean, error?: string, message?: string }>
  updateUserRoles: (userId: string, roles: string[]) => Promise<{ success: boolean, message: string }>
  updateProfile: (userId: string, fullName: string) => Promise<{ success: boolean, message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }

    return data
  }

  const fetchPlayer = async (userId: string) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado
      console.error('Erro ao buscar jogador:', error)
    }

    return data || null
  }

  useEffect(() => {
    const loadUserData = async (userId: string) => {
      const [profileData, playerData] = await Promise.all([
        fetchProfile(userId),
        fetchPlayer(userId)
      ])
      
      setProfile(profileData)
      setPlayer(playerData)
    }

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      }
    })

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setProfile(null)
        setPlayer(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string, 
    password: string, 
    name: string,
    playerData?: {
      phone: string
      nickname?: string
    }
  ) => {
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
            full_name: name,
            phone: playerData?.phone,
            nickname: playerData?.nickname
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

  const updateUserRoles = async (userId: string, roles: string[]) => {
    const { data, error } = await supabase
      .rpc('manage_user_roles', {
        target_user_id: userId,
        new_roles: roles
      })

    if (error) {
      console.error('Erro ao atualizar papéis:', error)
      return {
        success: false,
        message: 'Erro ao atualizar papéis do usuário'
      }
    }

    // Atualizar perfil local se for o usuário atual
    if (user?.id === userId) {
      const updatedProfile = await fetchProfile(userId)
      setProfile(updatedProfile)
    }

    return {
      success: true,
      message: 'Papéis atualizados com sucesso'
    }
  }

  const updateProfile = async (userId: string, fullName: string) => {
    const { data, error } = await supabase
      .rpc('update_profile', {
        p_user_id: userId,
        p_full_name: fullName
      })

    if (error) {
      console.error('Erro ao atualizar perfil:', error)
      return {
        success: false,
        message: 'Erro ao atualizar perfil'
      }
    }

    // Atualizar perfil local se for o usuário atual
    if (user?.id === userId) {
      const updatedProfile = await fetchProfile(userId)
      setProfile(updatedProfile)
    }

    return {
      success: true,
      message: 'Perfil atualizado com sucesso'
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    session,
    user,
    profile,
    player,
    isAdmin: profile?.roles.includes('admin') ?? false,
    isOrganizer: profile?.roles.includes('organizer') ?? false,
    signOut,
    signInWithPassword,
    signUp,
    updateUserRoles,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
