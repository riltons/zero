-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tipo enum para papéis de usuário
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'organizer');
    END IF;
END $$;

-- Criar tabela de perfis se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            roles user_role[] NOT NULL DEFAULT '{}'::user_role[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(user_id)
        );
    END IF;
END $$;

-- Criar tabela de comunidades se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'communities') THEN
        CREATE TABLE communities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
    END IF;
END $$;

-- Criar tabela de organizadores de comunidade se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_organizers') THEN
        CREATE TABLE community_organizers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(community_id, user_id)
        );
    END IF;
END $$;

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o updated_at se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON profiles
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_communities_updated_at') THEN
        CREATE TRIGGER update_communities_updated_at
            BEFORE UPDATE ON communities
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

-- Criar políticas de segurança

-- auth.users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth') THEN
        ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Permitir leitura pública de usuários"
            ON auth.users FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;
END $$;

-- Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Permitir inserção de perfil para usuários autenticados
        CREATE POLICY "Usuários autenticados podem criar seu perfil"
            ON profiles FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);

        -- Permitir leitura de perfis
        CREATE POLICY "Usuários podem ver todos os perfis"
            ON profiles FOR SELECT
            TO authenticated
            USING (true);

        -- Permitir atualização do próprio perfil
        CREATE POLICY "Usuários podem atualizar seu próprio perfil"
            ON profiles FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Communities
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communities') THEN
        ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Qualquer usuário pode ver comunidades"
            ON communities FOR SELECT
            TO authenticated
            USING (true);

        CREATE POLICY "Apenas administradores podem criar comunidades"
            ON communities FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE user_id = auth.uid()
                    AND 'admin' = ANY(roles)
                )
            );

        CREATE POLICY "Apenas o admin da comunidade pode atualizar"
            ON communities FOR UPDATE
            TO authenticated
            USING (admin_id = auth.uid())
            WITH CHECK (admin_id = auth.uid());
    END IF;
END $$;

-- Community Organizers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_organizers') THEN
        ALTER TABLE community_organizers ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Qualquer usuário pode ver organizadores"
            ON community_organizers FOR SELECT
            TO authenticated
            USING (true);

        CREATE POLICY "Apenas admin da comunidade pode gerenciar organizadores"
            ON community_organizers FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM communities
                    WHERE id = community_id
                    AND admin_id = auth.uid()
                )
            );
    END IF;
END $$;
