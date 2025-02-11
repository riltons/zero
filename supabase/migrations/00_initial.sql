-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_profile() CASCADE;
DROP FUNCTION IF EXISTS manage_user_roles() CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tipo enum para papéis
CREATE TYPE public.user_role AS ENUM ('admin', 'organizer', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    roles user_role[] DEFAULT '{user}'::user_role[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_id UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Garantir que o papel anon possa ler auth.users
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON auth.users TO anon, authenticated;

-- Create policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Service role can view all" ON public.profiles;
    DROP POLICY IF EXISTS "Service role can update all" ON public.profiles;

    -- Política para o service role (usado pelo trigger)
    CREATE POLICY "Enable insert for service role"
        ON public.profiles
        FOR INSERT
        TO service_role
        WITH CHECK (true);

    -- Política para visualização pelo service role
    CREATE POLICY "Service role can view all"
        ON public.profiles
        FOR SELECT
        TO service_role
        USING (true);

    -- Política para atualização pelo service role
    CREATE POLICY "Service role can update all"
        ON public.profiles
        FOR UPDATE
        TO service_role
        USING (true);

    -- Políticas para usuários autenticados
    CREATE POLICY "Users can view own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (
            auth.uid() = user_id OR
            (
                SELECT COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false)
                FROM auth.users u
                WHERE u.id = auth.uid()
            )
        );

    CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (
            auth.uid() = user_id OR
            (
                SELECT COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false)
                FROM auth.users u
                WHERE u.id = auth.uid()
            )
        );
END $$;

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _roles user_role[];
BEGIN
    -- Todos os usuários recebem todos os papéis
    _roles := ARRAY['admin', 'organizer', 'user']::user_role[];

    -- Atualizar metadados do usuário com flag de admin
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('is_admin', true)
    WHERE id = NEW.id;

    INSERT INTO public.profiles (user_id, full_name, roles)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        _roles
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Criar função para gerenciar papéis
CREATE OR REPLACE FUNCTION public.manage_user_roles(
    target_user_id UUID,
    new_roles user_role[],
    OUT success BOOLEAN,
    OUT message TEXT
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'is_admin')::boolean = true
    ) THEN
        success := false;
        message := 'Apenas administradores podem gerenciar papéis';
        RETURN;
    END IF;

    -- Atualizar os papéis
    UPDATE public.profiles
    SET roles = new_roles
    WHERE user_id = target_user_id;

    -- Se estiver definindo como admin, atualizar metadados do usuário
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('is_admin', 'admin' = ANY(new_roles))
    WHERE id = target_user_id;

    success := true;
    message := 'Papéis atualizados com sucesso';
    RETURN;
END;
$$;

-- Criar função para atualizar perfil
CREATE OR REPLACE FUNCTION public.update_profile(
    p_user_id UUID,
    p_full_name TEXT,
    OUT success BOOLEAN,
    OUT message TEXT
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se o usuário está tentando atualizar seu próprio perfil ou é admin
    IF auth.uid() <> p_user_id AND NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'is_admin')::boolean = true
    ) THEN
        success := false;
        message := 'Você só pode atualizar seu próprio perfil';
        RETURN;
    END IF;

    -- Atualizar o perfil
    UPDATE public.profiles
    SET 
        full_name = p_full_name,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    success := true;
    message := 'Perfil atualizado com sucesso';
    RETURN;
END;
$$;
