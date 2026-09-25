import React from 'react';
import { 
  Calendar, 
  MessageSquare, 
  Gift, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { Birthday } from '../types/birthday.ts';
import { calculateBirthdayInfo, getInitials } from '../utils/dateUtils.ts';

interface BirthdayCardProps {
  birthday: Birthday;
  onEdit: (birthday: Birthday) => void;
  onDelete: (id: string, name: string) => void;
  onOpenWhatsApp: (birthday: Birthday) => void;
  onOpenGiftIdeas: (birthday: Birthday) => void;
}

export const BirthdayCard: React.FC<BirthdayCardProps> = ({
  birthday,
  onEdit,
  onDelete,
  onOpenWhatsApp,
  onOpenGiftIdeas,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const info = calculateBirthdayInfo(birthday.birth_date);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Família':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Amigos':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Trabalho':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Estudos':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCountdownBadge = () => {
    if (info.isToday) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> É HOJE!
        </span>
      );
    }
    if (info.daysRemaining === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3" /> Amanhã!
        </span>
      );
    }
    if (info.daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Clock className="w-3 h-3" /> Faltam {info.daysRemaining} dias
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        Faltam {info.daysRemaining} dias
      </span>
    );
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
        info.isToday
          ? 'border-pink-300 ring-2 ring-pink-400/40 shadow-md bg-gradient-to-b from-pink-50/30 to-white'
          : info.daysRemaining <= 7
          ? 'border-indigo-200 shadow-xs'
          : 'border-gray-200/80 hover:border-gray-300'
      }`}
    >
      {/* Top Banner highlight for Today */}
      {info.isToday && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 h-1.5 w-full" />
      )}

      {/* Main card body */}
      <div className="p-5">
        {/* Header row: Avatar, Name, Category, More menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                birthday.avatar_color || 'bg-indigo-600 text-white'
              }`}
            >
              {getInitials(birthday.name)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-pink-600 transition-colors">
                  {birthday.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(
                    birthday.category
                  )}`}
                >
                  {birthday.category}
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-0.5" title={`Signo: ${info.zodiacSign.name}`}>
                  <span>{info.zodiacSign.symbol}</span>
                  <span>{info.zodiacSign.name}</span>
                </span>
              </div>
            </div>
          </div>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(birthday);
                    }}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenGiftIdeas(birthday);
                    }}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    Ideias Presente
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(birthday.id, birthday.name);
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Date, Age & Countdown */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>{info.formattedDate}</span>
              <span className="text-gray-400 font-normal">({info.weekdayFormatted})</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Completará <strong className="text-gray-800">{info.turningAge} anos</strong>
            </p>
          </div>

          <div>{getCountdownBadge()}</div>
        </div>

        {/* Notes preview if available */}
        {birthday.notes && (
          <p className="mt-2.5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg line-clamp-1 italic">
            "{birthday.notes}"
          </p>
        )}

        {/* Gift idea badge if present */}
        {birthday.gift_ideas && (
          <button
            onClick={() => onOpenGiftIdeas(birthday)}
            className="mt-2 w-full text-left text-[11px] text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60 p-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Presente: {birthday.gift_ideas}</span>
          </button>
        )}
      </div>

      {/* Card Footer: Fast actions (WhatsApp, Call, Gift) */}
      <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
          {birthday.phone && (
            <span className="flex items-center gap-1 text-[11px]">
              <Phone className="w-3 h-3 text-emerald-600" />
              <span className="truncate">{birthday.phone}</span>
            </span>
          )}
          {!birthday.phone && birthday.email && (
            <span className="flex items-center gap-1 text-[11px]">
              <Mail className="w-3 h-3 text-blue-500" />
              <span className="truncate">{birthday.email}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenGiftIdeas(birthday)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              birthday.gift_ideas
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={birthday.gift_ideas ? 'Ver ideias de presentes' : 'Adicionar ideia de presente'}
          >
            <Gift className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenWhatsApp(birthday)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Enviar mensagem pelo WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Felicitar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
