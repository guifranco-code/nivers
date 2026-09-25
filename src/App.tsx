import { useState, useEffect, useMemo } from 'react';
import { Birthday, Category } from './types/birthday.ts';
import { 
  fetchBirthdays, 
  createBirthday, 
  updateBirthday, 
  deleteBirthday, 
  saveLocalBirthdays, 
  INITIAL_DEMO_BIRTHDAYS 
} from './services/birthdayService.ts';
import { getStoredSupabaseConfig } from './services/supabaseClient.ts';
import { sortBirthdays, parseBirthDate } from './utils/dateUtils.ts';

import { Header } from './components/Header.tsx';
import { TodayHighlights } from './components/TodayHighlights.tsx';
import { BirthdayCard } from './components/BirthdayCard.tsx';
import { BirthdayTable } from './components/BirthdayTable.tsx';
import { CalendarMonthView } from './components/CalendarMonthView.tsx';
import { FilterBar, ViewMode, SortOption } from './components/FilterBar.tsx';
import { BirthdayModal } from './components/BirthdayModal.tsx';
import { SupabaseConfigModal } from './components/SupabaseConfigModal.tsx';
import { WhatsAppModal } from './components/WhatsAppModal.tsx';
import { GiftIdeasModal } from './components/GiftIdeasModal.tsx';
import { ExportImportModal } from './components/ExportImportModal.tsx';

import { Cake, Sparkles, Database, Plus, RefreshCw, AlertCircle, Heart } from 'lucide-react';

export default function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Views
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('upcoming');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals state
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [whatsAppRecipient, setWhatsAppRecipient] = useState<Birthday | null>(null);
  const [giftRecipient, setGiftRecipient] = useState<Birthday | null>(null);

  // Check Supabase configuration status
  const supabaseConfig = getStoredSupabaseConfig();
  const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchBirthdays();
      setBirthdays(res.data);
      setSource(res.source);
      if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao carregar aniversários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort birthdays
  const filteredBirthdays = useMemo(() => {
    let result = [...birthdays];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          (b.phone && b.phone.includes(query)) ||
          (b.notes && b.notes.toLowerCase().includes(query)) ||
          (b.gift_ideas && b.gift_ideas.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'Todos') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Month filter
    if (selectedMonth !== 'all') {
      result = result.filter((b) => {
        const { month } = parseBirthDate(b.birth_date);
        return month === selectedMonth;
      });
    }

    // Sorting
    return sortBirthdays(result, sortBy);
  }, [birthdays, search, selectedCategory, selectedMonth, sortBy]);

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingBirthday(null);
    setIsBirthdayModalOpen(true);
  };

  const handleOpenEdit = (b: Birthday) => {
    setEditingBirthday(b);
    setIsBirthdayModalOpen(true);
  };

  const handleSaveBirthday = async (
    data: Omit<Birthday, 'id' | 'created_at' | 'updated_at'>,
    id?: string
  ) => {
    if (id) {
      // Edit existing
      const existing = birthdays.find((b) => b.id === id);
      if (!existing) return;
      const updated: Birthday = { ...existing, ...data };
      const res = await updateBirthday(updated);
      if (res.success) {
        setBirthdays((prev) => prev.map((item) => (item.id === id ? (res.data || updated) : item)));
      } else {
        alert(res.error || 'Erro ao atualizar.');
      }
    } else {
      // Create new
      const res = await createBirthday(data);
      if (res.data) {
        setBirthdays((prev) => [res.data!, ...prev]);
      }
    }
  };

  const handleDeleteBirthday = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${name} da lista de aniversários?`)) {
      const res = await deleteBirthday(id);
      if (res.success) {
        setBirthdays((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(res.error || 'Erro ao excluir aniversário.');
      }
    }
  };

  const handleSaveGiftIdeas = async (id: string, giftIdeas: string) => {
    const target = birthdays.find((b) => b.id === id);
    if (!target) return;
    const updated = { ...target, gift_ideas: giftIdeas };
    await updateBirthday(updated);
    setBirthdays((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const handleImportBirthdays = async (imported: Birthday[]) => {
    saveLocalBirthdays(imported);
    setBirthdays(imported);
  };

  const handleResetDemoData = async () => {
    const seeded: Birthday[] = INITIAL_DEMO_BIRTHDAYS.map((item, idx) => ({
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveLocalBirthdays(seeded);
    setBirthdays(seeded);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        birthdays={birthdays}
        isSupabaseConfigured={isSupabaseConfigured}
        onOpenNewBirthdayModal={handleOpenAdd}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenExportImportModal={() => setIsExportImportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Supabase Prompt Banner (if not connected yet) */}
        {!isSupabaseConfigured && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Conecte seu banco de dados Supabase
                </h3>
                <p className="text-xs text-emerald-800/90 mt-0.5">
                  Armazene seus aniversários na nuvem de forma persistente. Enquanto isso, seus dados são salvos localmente no navegador!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Configurar Supabase Agora
            </button>
          </div>
        )}

        {/* Transient Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-950 font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Today's Celebrants Highlight banner (Confetti + Upcoming Week) */}
        <TodayHighlights
          birthdays={birthdays}
          onOpenWhatsApp={(b) => setWhatsAppRecipient(b)}
          onOpenBirthdayModal={handleOpenAdd}
        />

        {/* Filter & Controls Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={filteredBirthdays.length}
        />

        {/* Content Body: Loading, Empty, or Views */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-500">Carregando aniversários...</p>
          </div>
        ) : filteredBirthdays.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs max-w-lg mx-auto my-6">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-pink-500 shadow-inner">
              <Cake className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {search || selectedCategory !== 'Todos' || selectedMonth !== 'all'
                ? 'Nenhum aniversariante encontrado'
                : 'Nenhum aniversário cadastrado ainda'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              {search || selectedCategory !== 'Todos' || selectedMonth !== 'all'
                ? 'Tente ajustar os filtros de busca ou categoria acima.'
                : 'Comece adicionando parentes, amigos ou colegas para acompanhar os aniversários.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Aniversário
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Carregar Exemplos
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBirthdays.map((b) => (
                  <BirthdayCard
                    key={b.id}
                    birthday={b}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteBirthday}
                    onOpenWhatsApp={(item) => setWhatsAppRecipient(item)}
                    onOpenGiftIdeas={(item) => setGiftRecipient(item)}
                  />
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <BirthdayTable
                birthdays={filteredBirthdays}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteBirthday}
                onOpenWhatsApp={(item) => setWhatsAppRecipient(item)}
                onOpenGiftIdeas={(item) => setGiftRecipient(item)}
              />
            )}

            {/* Calendar Annual Month View */}
            {viewMode === 'calendar' && (
              <CalendarMonthView
                birthdays={filteredBirthdays}
                onSelectBirthday={handleOpenEdit}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">NiverHub</span> • Feito com{' '}
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> para você nunca esquecer datas especiais.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-emerald-700 hover:underline cursor-pointer font-medium"
            >
              Configurações Supabase
            </button>
            <button
              onClick={() => setIsExportImportModalOpen(true)}
              className="text-gray-600 hover:underline cursor-pointer"
            >
              Exportar / Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BirthdayModal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
        onSave={handleSaveBirthday}
        editingBirthday={editingBirthday}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => loadData()}
      />

      <WhatsAppModal
        isOpen={Boolean(whatsAppRecipient)}
        onClose={() => setWhatsAppRecipient(null)}
        birthday={whatsAppRecipient}
      />

      <GiftIdeasModal
        isOpen={Boolean(giftRecipient)}
        onClose={() => setGiftRecipient(null)}
        birthday={giftRecipient}
        onSaveGiftIdeas={handleSaveGiftIdeas}
      />

      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        birthdays={birthdays}
        onImport={handleImportBirthdays}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
