import React from 'react';
import { Cake, Plus, Database, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { Birthday } from '../types/birthday.ts';
import { calculateBirthdayInfo } from '../utils/dateUtils.ts';

interface HeaderProps {
  birthdays: Birthday[];
  isSupabaseConfigured: boolean;
  onOpenNewBirthdayModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenExportImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  birthdays,
  isSupabaseConfigured,
  onOpenNewBirthdayModal,
  onOpenSupabaseModal,
  onOpenExportImportModal,
}) => {
  let todayCount = 0;
  let thisMonthCount = 0;

  birthdays.forEach((b) => {
    const info = calculateBirthdayInfo(b.birth_date);
    if (info.isToday) todayCount++;
    if (info.isThisMonth || info.isToday) thisMonthCount++;
  });

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand and stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md text-white">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-gray-900">
                  Niver<span className="text-pink-600">Hub</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Aniversários
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Nunca mais esqueça o aniversário de quem importa
              </p>
            </div>
          </div>

          {/* Mobile Supabase badge */}
          <div className="md:hidden">
            <button
              onClick={onOpenSupabaseModal}
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? 'Supabase' : 'Local'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/70 text-gray-700 font-medium flex items-center gap-1.5">
            <span>Total:</span>
            <strong className="text-gray-900 font-bold">{birthdays.length}</strong>
          </div>
          {todayCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Hoje: {todayCount}</span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-medium">
            <span>Neste mês:</span>{' '}
            <strong className="font-bold">{thisMonthCount}</strong>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Supabase status button */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSupabaseConfigured
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Gerenciar conexão com o Supabase"
          >
            {isSupabaseConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Conectado</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>Conectar ao Supabase</span>
              </>
            )}
          </button>

          {/* Backup / Export */}
          <button
            type="button"
            onClick={onOpenExportImportModal}
            className="px-3 py-2 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Exportar ou Importar dados"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* New Birthday Button */}
          <button
            type="button"
            onClick={onOpenNewBirthdayModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Aniversário</span>
          </button>
        </div>
      </div>
    </header>
  );
};
