import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types/birthday.ts';

const STORAGE_KEY = 'niverhub_supabase_config';

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- NIVERHUB - ESQUEMA COMPLETO DO BANCO DE DADOS & POLÍTICAS DE RLS (SUPABASE)
-- Execute este script no "SQL Editor" do seu painel Supabase:
-- ==============================================================================

-- 1. TABELA DE ANIVERSÁRIOS
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

-- 2. ÍNDICES DE BUSCA E ORDENAÇÃO
CREATE INDEX IF NOT EXISTS idx_birthdays_birth_date ON public.birthdays (birth_date);
CREATE INDEX IF NOT EXISTS idx_birthdays_category ON public.birthdays (category);
CREATE INDEX IF NOT EXISTS idx_birthdays_name ON public.birthdays (name);

-- 3. TRIGGER AUTOMÁTICO PARA ATUALIZAR 'updated_at'
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

-- 4. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO (RLS POLICIES)
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir atualização para todos" ON public.birthdays;
DROP POLICY IF EXISTS "Permitir exclusão para todos" ON public.birthdays;

CREATE POLICY "Permitir leitura para todos" ON public.birthdays FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção para todos" ON public.birthdays FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização para todos" ON public.birthdays FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão para todos" ON public.birthdays FOR DELETE TO anon, authenticated USING (true);

-- 6. POLÍTICAS DO SUPABASE STORAGE (BUCKET PARA FOTOS / ARQUIVOS)
INSERT INTO storage.buckets (id, name, public) VALUES ('niverhub_storage', 'niverhub_storage', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir visualizacao publica de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload publico de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizacao de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao de arquivos" ON storage.objects;

CREATE POLICY "Permitir visualizacao publica de arquivos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'niverhub_storage');
CREATE POLICY "Permitir upload publico de arquivos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'niverhub_storage');
CREATE POLICY "Permitir atualizacao de arquivos" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'niverhub_storage');
CREATE POLICY "Permitir exclusao de arquivos" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'niverhub_storage');
`;

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          isCustom: true
        };
      }
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase do localStorage:', e);
  }

  return {
    url: envUrl.trim(),
    anonKey: envKey.trim(),
    isCustom: false
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
}

export function clearStoredSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (error) {
    console.error('Falha ao inicializar cliente Supabase:', error);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tableExists: boolean }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL e Anon Key são obrigatórios.', tableExists: false };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    
    // Tenta consultar a tabela birthdays
    const { error } = await testClient
      .from('birthdays')
      .select('id')
      .limit(1);

    if (error) {
      // Se a tabela não existir, o erro geralmente menciona "relation ... does not exist"
      if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
        return {
          success: true,
          tableExists: false,
          message: 'Conectado ao Supabase com sucesso! A tabela "birthdays" ainda não foi criada. Execute o script SQL no painel do Supabase.'
        };
      }
      return {
        success: false,
        tableExists: false,
        message: `Erro do Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      tableExists: true,
      message: 'Conexão estabelecida com sucesso e tabela "birthdays" pronta para uso!'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha ao conectar com o Supabase';
    return {
      success: false,
      tableExists: false,
      message: `Erro de rede/conexão: ${errorMsg}`
    };
  }
}
