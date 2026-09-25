import React from 'react';
import { Search, LayoutGrid, List, CalendarDays, ArrowUpDown } from 'lucide-react';
import { Category } from '../types/birthday.ts';
import { MONTH_NAMES } from '../utils/dateUtils.ts';

export type ViewMode = 'cards' | 'table' | 'calendar';
export type SortOption = 'upcoming' | 'name' | 'calendar' | 'age';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedMonth: number | 'all';
  onMonthChange: (month: number | 'all') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
}

const CATEGORIES: ('Todos' | Category)[] = ['Todos', 'Família', 'Amigos', 'Trabalho', 'Estudos', 'Outros'];

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3.5 mb-6">
      {/* Top row: Search input, Sort, View mode toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar aniversariante por nome, telefone ou nota..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all bg-gray-50/50 hover:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-hidden focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todos os Meses</option>
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="outline-hidden bg-transparent font-medium"
            >
              <option value="upcoming">Mais Próximos</option>
              <option value="name">Nome (A - Z)</option>
              <option value="calendar">Calendário (Jan - Dez)</option>
              <option value="age">Mais Velhos</option>
            </select>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white shadow-xs text-pink-600 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-pink-600 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('calendar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white shadow-xs text-pink-600 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visão Geral Anual (Meses)"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500 mr-1">Grupos:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500">
          Mostrando <strong className="text-gray-800">{totalCount}</strong> aniversariante(s)
        </span>
      </div>
    </div>
  );
};
