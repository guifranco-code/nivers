-- ==============================================================================
-- NIVERHUB - ESQUEMA COMPLETO DO BANCO DE DADOS & POLÍTICAS DE RLS (SUPABASE)
-- Execute este script completo no "SQL Editor" do seu painel Supabase.
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAÇÃO DA TABELA DE ANIVERSÁRIOS (BIRTHDAYS)
CREATE TABLE IF NOT EXISTS public.birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Amigos' CHECK (category IN ('Família', 'Amigos', 'Trabalho', 'Estudos', 'Outros')),
  phone TEXT,
  email TEXT,
  gift_ideas TEXT,
  notes TEXT,
  avatar_color TEXT DEFAULT 'bg-pink-500 text-white',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ÍNDICES DE DESEMPENHO
CREATE INDEX IF NOT EXISTS idx_birthdays_birth_date ON public.birthdays (birth_date);
CREATE INDEX IF NOT EXISTS idx_birthdays_category ON public.birthdays (category);
CREATE INDEX IF NOT EXISTS idx_birthdays_name ON public.birthdays (name);

-- 4. FUNÇÃO E TRIGGER PARA ATUALIZAR AUTOMATICAMENTE O CAMPO 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_birthdays_updated_at ON public.birthdays;
CREATE TRIGGER trigger_birthdays_updated_at
BEFORE UPDATE ON public.birthdays
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA (RLS POLICIES) PARA ACESSO VIA ANON KEY E AUTH
-- Remove políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir atualização para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir exclusão para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir acesso publico total" ON public.birthdays;

-- Política 1: Leitura (SELECT)
CREATE POLICY "Permitir leitura para todos"
ON public.birthdays
FOR SELECT
TO anon, authenticated
USING (true);

-- Política 2: Inserção (INSERT)
CREATE POLICY "Permitir inserção para todos"
ON public.birthdays
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 3: Atualização (UPDATE)
CREATE POLICY "Permitir atualização para todos"
ON public.birthdays
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política 4: Exclusão (DELETE)
CREATE POLICY "Permitir exclusão para todos"
ON public.birthdays
FOR DELETE
TO anon, authenticated
USING (true);

-- ==============================================================================
-- 7. SUPABASE STORAGE (BUCKET PARA FOTOS DE AVATAR / PRESENTES - OPCIONAL)
-- Cria bucket público 'niverhub_storage' para armazenar mídias caso deseje
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('niverhub_storage', 'niverhub_storage', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para o Storage (storage.objects)
DROP POLICY IF EXISTS "Permitir visualizacao publica de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload publico de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizacao de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao de arquivos" ON storage.objects;

-- Leitura pública de arquivos no bucket niverhub_storage
CREATE POLICY "Permitir visualizacao publica de arquivos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'niverhub_storage');

-- Upload de arquivos no bucket niverhub_storage
CREATE POLICY "Permitir upload publico de arquivos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'niverhub_storage');

-- Atualização de arquivos no bucket niverhub_storage
CREATE POLICY "Permitir atualizacao de arquivos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'niverhub_storage');

-- Exclusão de arquivos no bucket niverhub_storage
CREATE POLICY "Permitir exclusao de arquivos"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'niverhub_storage');
