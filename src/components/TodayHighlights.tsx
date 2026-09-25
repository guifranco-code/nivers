import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Cake, MessageSquare, Clock, PartyPopper } from 'lucide-react';
import { Birthday } from '../types/birthday.ts';
import { calculateBirthdayInfo, getInitials } from '../utils/dateUtils.ts';

interface TodayHighlightsProps {
  birthdays: Birthday[];
  onOpenWhatsApp: (birthday: Birthday) => void;
  onOpenBirthdayModal: () => void;
}

export const TodayHighlights: React.FC<TodayHighlightsProps> = ({
  birthdays,
  onOpenWhatsApp,
}) => {
  const todayBirthdays: { birthday: Birthday; info: ReturnType<typeof calculateBirthdayInfo> }[] = [];
  const thisWeekBirthdays: { birthday: Birthday; info: ReturnType<typeof calculateBirthdayInfo> }[] = [];

  birthdays.forEach((b) => {
    const info = calculateBirthdayInfo(b.birth_date);
    if (info.isToday) {
      todayBirthdays.push({ birthday: b, info });
    } else if (info.isThisWeek) {
      thisWeekBirthdays.push({ birthday: b, info });
    }
  });

  // Confetti trigger when there is someone celebrating today
  useEffect(() => {
    if (todayBirthdays.length > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [todayBirthdays.length]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  if (todayBirthdays.length === 0 && thisWeekBirthdays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Today's Celebrants Highlight Banner */}
      {todayBirthdays.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
          {/* Background festive blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-400/20 rounded-full blur-xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                  <Cake className="w-8 h-8 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
                      É HOJE! 🎉
                    </span>
                    <span className="text-pink-100 text-xs font-medium">Não esqueça de parabenizar!</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                    {todayBirthdays.length === 1
                      ? 'Temos 1 aniversariante hoje!'
                      : `Temos ${todayBirthdays.length} aniversariantes hoje!`}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerConfetti}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PartyPopper className="w-4 h-4 text-amber-300" />
                Soltar Confetes
              </button>
            </div>

            {/* List of today celebrants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayBirthdays.map(({ birthday, info }) => (
                <div
                  key={birthday.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white/15 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${
                        birthday.avatar_color || 'bg-white text-pink-600'
                      }`}
                    >
                      {getInitials(birthday.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-base truncate">{birthday.name}</h4>
                      <p className="text-pink-100 text-xs">
                        Completando <strong className="text-white font-extrabold">{info.turningAge} anos</strong> hoje!
                      </p>
                      <span className="text-[11px] text-pink-200">
                        {info.zodiacSign.symbol} {info.zodiacSign.name} • {birthday.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenWhatsApp(birthday)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Felicitar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming in next 7 days */}
      {thisWeekBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-indigo-950">
              Próximos aniversariantes nos próximos 7 dias ({thisWeekBirthdays.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {thisWeekBirthdays.map(({ birthday, info }) => (
              <div
                key={birthday.id}
                className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-xs flex items-center justify-between gap-2 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      birthday.avatar_color || 'bg-indigo-600 text-white'
                    }`}
                  >
                    {getInitials(birthday.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{birthday.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {info.formattedDate} ({info.weekdayFormatted.split('-')[0]})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 block">
                    {info.daysRemaining === 1 ? 'Amanhã!' : `Em ${info.daysRemaining} dias`}
                  </span>
                  <span className="text-[10px] text-gray-400">Fará {info.turningAge} anos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
