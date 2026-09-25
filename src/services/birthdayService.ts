import { Birthday } from '../types/birthday.ts';
import { getSupabaseClient } from './supabaseClient.ts';

const LOCAL_STORAGE_KEY = 'niverhub_birthdays_data';

// Exemplos iniciais realistas para primeira experiência
export const INITIAL_DEMO_BIRTHDAYS: Omit<Birthday, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Ana Clara Silva',
    birth_date: getSampleDate(0), // Hoje!
    category: 'Família',
    phone: '+55 11 98765-4321',
    email: 'anaclara@email.com',
    gift_ideas: 'Livro de receitas francesas ou fone bluetooth',
    notes: 'Irmã mais nova. Ama chocolates finos!',
    avatar_color: 'bg-rose-500 text-white',
  },
  {
    name: 'Lucas Ferreira',
    birth_date: getSampleDate(2), // Daqui a 2 dias
    category: 'Amigos',
    phone: '+55 21 99887-1122',
    email: 'lucas.ferreira@email.com',
    gift_ideas: 'Camisa do time ou voucher Steam',
    notes: 'Amigo de faculdade.',
    avatar_color: 'bg-indigo-500 text-white',
  },
  {
    name: 'Mariana Costa',
    birth_date: getSampleDate(6), // Daqui a 6 dias
    category: 'Trabalho',
    phone: '+55 31 99123-5566',
    email: 'mariana.costa@empresa.com',
    gift_ideas: 'Caneca térmica para café',
    notes: 'Líder do time de design.',
    avatar_color: 'bg-emerald-500 text-white',
  },
  {
    name: 'Roberto Mendes',
    birth_date: getSampleDate(15), // Daqui a 15 dias
    category: 'Família',
    phone: '+55 11 97654-3210',
    gift_ideas: 'Vinho tinto Malbec',
    notes: 'Tio Beto.',
    avatar_color: 'bg-amber-500 text-white',
  },
  {
    name: 'Beatriz Almeida',
    birth_date: getSampleDate(35), // Próximo mês
    category: 'Amigos',
    phone: '+55 19 98877-4433',
    gift_ideas: 'Planner 2026 ou vela aromática',
    avatar_color: 'bg-purple-500 text-white',
  },
];

function getSampleDate(daysInFuture: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysInFuture);
  const birthYear = 1994 + (daysInFuture % 6);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
}

export function getLocalBirthdays(): Birthday[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler aniversários locais:', e);
  }
  return [];
}

export function saveLocalBirthdays(birthdays: Birthday[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(birthdays));
}

export async function fetchBirthdays(): Promise<{ data: Birthday[]; source: 'supabase' | 'local'; error?: string }> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('birthdays')
        .select('*')
        .order('birth_date', { ascending: true });

      if (!error && data) {
        // Atualiza cache local para redundância offline
        saveLocalBirthdays(data as Birthday[]);
        return { data: data as Birthday[], source: 'supabase' };
      } else if (error) {
        console.warn('Supabase query error, usando dados locais:', error.message);
        return {
          data: getLocalBirthdays(),
          source: 'local',
          error: `Erro no Supabase (${error.message}). Carregando do armazenamento local.`
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com Supabase';
      return {
        data: getLocalBirthdays(),
        source: 'local',
        error: `${msg}. Carregando do armazenamento local.`
      };
    }
  }

  // Se não configurou Supabase ou cliente nulo, pega local
  let localData = getLocalBirthdays();
  if (localData.length === 0) {
    // Popula com exemplos iniciais se estiver totalmente vazio
    const seeded: Birthday[] = INITIAL_DEMO_BIRTHDAYS.map((item, idx) => ({
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveLocalBirthdays(seeded);
    localData = seeded;
  }

  return { data: localData, source: 'local' };
}

export async function createBirthday(birthday: Omit<Birthday, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Birthday; error?: string }> {
  const supabase = getSupabaseClient();
  const id = crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRecord: Birthday = {
    ...birthday,
    id,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('birthdays')
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no Supabase:', error);
        // Salva localmente para não perder a informação
        const locals = getLocalBirthdays();
        saveLocalBirthdays([newRecord, ...locals]);
        return { success: false, error: `Salvo apenas localmente: ${error.message}`, data: newRecord };
      }

      // Atualiza local
      const locals = getLocalBirthdays();
      saveLocalBirthdays([data as Birthday, ...locals.filter(b => b.id !== (data as Birthday).id)]);
      return { success: true, data: data as Birthday };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar no Supabase';
      const locals = getLocalBirthdays();
      saveLocalBirthdays([newRecord, ...locals]);
      return { success: false, error: `${msg} (salvo em cache local)`, data: newRecord };
    }
  }

  // Modo local
  const locals = getLocalBirthdays();
  const updated = [newRecord, ...locals];
  saveLocalBirthdays(updated);
  return { success: true, data: newRecord };
}

export async function updateBirthday(birthday: Birthday): Promise<{ success: boolean; data?: Birthday; error?: string }> {
  const supabase = getSupabaseClient();
  const updatedRecord: Birthday = {
    ...birthday,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('birthdays')
        .update(updatedRecord)
        .eq('id', birthday.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar no Supabase:', error);
        return { success: false, error: error.message };
      }

      const locals = getLocalBirthdays();
      const updatedList = locals.map(b => b.id === birthday.id ? (data as Birthday) : b);
      saveLocalBirthdays(updatedList);
      return { success: true, data: data as Birthday };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar no Supabase';
      return { success: false, error: msg };
    }
  }

  // Local
  const locals = getLocalBirthdays();
  const updatedList = locals.map(b => b.id === birthday.id ? updatedRecord : b);
  saveLocalBirthdays(updatedList);
  return { success: true, data: updatedRecord };
}

export async function deleteBirthday(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('birthdays')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao deletar no Supabase';
      return { success: false, error: msg };
    }
  }

  const locals = getLocalBirthdays();
  const filtered = locals.filter(b => b.id !== id);
  saveLocalBirthdays(filtered);
  return { success: true };
}

export async function syncLocalToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, count: 0, error: 'Supabase não está configurado.' };
  }

  const locals = getLocalBirthdays();
  if (locals.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('birthdays')
      .upsert(locals, { onConflict: 'id' })
      .select();

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data ? data.length : locals.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao sincronizar dados';
    return { success: false, count: 0, error: msg };
  }
}
