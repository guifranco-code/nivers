import React from 'react';
import { Birthday } from '../types/birthday.ts';
import { calculateBirthdayInfo, getInitials } from '../utils/dateUtils.ts';
import { MessageSquare, Gift, Pencil, Trash2, Calendar, Phone } from 'lucide-react';

interface BirthdayTableProps {
  birthdays: Birthday[];
  onEdit: (birthday: Birthday) => void;
  onDelete: (id: string, name: string) => void;
  onOpenWhatsApp: (birthday: Birthday) => void;
  onOpenGiftIdeas: (birthday: Birthday) => void;
}

export const BirthdayTable: React.FC<BirthdayTableProps> = ({
  birthdays,
  onEdit,
  onDelete,
  onOpenWhatsApp,
  onOpenGiftIdeas,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4">Pessoa</th>
              <th className="py-3 px-4">Data Nasc.</th>
              <th className="py-3 px-4">Idade</th>
              <th className="py-3 px-4">Próximo Aniversário</th>
              <th className="py-3 px-4">Signo</th>
              <th className="py-3 px-4">Grupo</th>
              <th className="py-3 px-4">Contato</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {birthdays.map((b) => {
              const info = calculateBirthdayInfo(b.birth_date);
              return (
                <tr
                  key={b.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    info.isToday ? 'bg-pink-50/50 font-medium' : ''
                  }`}
                >
                  {/* Name + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          b.avatar_color || 'bg-indigo-600 text-white'
                        }`}
                      >
                        {getInitials(b.name)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{b.name}</span>
                        {b.notes && (
                          <span className="text-[11px] text-gray-400 truncate max-w-xs block">
                            {b.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" />
                      <span>{info.formattedDate}</span>
                    </div>
                  </td>

                  {/* Age */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">
                      Fará {info.turningAge} anos
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      (atual: {info.currentAge})
                    </span>
                  </td>

                  {/* Countdown */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {info.isToday ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        🎉 É HOJE!
                      </span>
                    ) : info.daysRemaining <= 7 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Faltam {info.daysRemaining} dias
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Em {info.daysRemaining} dias ({info.weekdayFormatted.split('-')[0]})
                      </span>
                    )}
                  </td>

                  {/* Zodiac */}
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    <span className="mr-1">{info.zodiacSign.symbol}</span>
                    <span>{info.zodiacSign.name}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                      {b.category}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {b.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {b.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sem fone</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenWhatsApp(b)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Enviar parabéns no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenGiftIdeas(b)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        title="Ideias de presentes"
                      >
                        <Gift className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(b)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(b.id, b.name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
