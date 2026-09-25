import React from 'react';
import { MONTH_NAMES, parseBirthDate, calculateBirthdayInfo } from '../utils/dateUtils.ts';
import { Birthday } from '../types/birthday.ts';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface CalendarMonthViewProps {
  birthdays: Birthday[];
  onSelectBirthday: (birthday: Birthday) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  birthdays,
  onSelectBirthday,
}) => {
  const currentMonthIndex = new Date().getMonth(); // 0-11

  // Group birthdays by month (1 to 12)
  const monthGroups: { [month: number]: Birthday[] } = {};
  for (let m = 1; m <= 12; m++) {
    monthGroups[m] = [];
  }

  birthdays.forEach((b) => {
    const { month } = parseBirthDate(b.birth_date);
    if (monthGroups[month]) {
      monthGroups[month].push(b);
    }
  });

  // Sort within each month by day
  for (let m = 1; m <= 12; m++) {
    monthGroups[m].sort((a, b) => {
      const dayA = parseBirthDate(a.birth_date).day;
      const dayB = parseBirthDate(b.birth_date).day;
      return dayA - dayB;
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {MONTH_NAMES.map((name, index) => {
        const monthNum = index + 1;
        const list = monthGroups[monthNum] || [];
        const isCurrentMonth = index === currentMonthIndex;

        return (
          <div
            key={name}
            className={`rounded-2xl border transition-all flex flex-col justify-between ${
              isCurrentMonth
                ? 'bg-gradient-to-b from-pink-50/50 to-white border-pink-300 shadow-md ring-1 ring-pink-300'
                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-xs'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon
                  className={`w-4 h-4 ${isCurrentMonth ? 'text-pink-600' : 'text-gray-400'}`}
                />
                <h4
                  className={`font-bold text-sm ${
                    isCurrentMonth ? 'text-pink-700' : 'text-gray-900'
                  }`}
                >
                  {name}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {isCurrentMonth && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Mês Atual
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    list.length > 0
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {list.length}
                </span>
              </div>
            </div>

            {/* List */}
            <div className="p-3 flex-1 min-h-[140px] space-y-1.5">
              {list.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 italic py-6">
                  Nenhum aniversariante
                </div>
              ) : (
                list.map((b) => {
                  const { day } = parseBirthDate(b.birth_date);
                  const info = calculateBirthdayInfo(b.birth_date);

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSelectBirthday(b)}
                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        info.isToday
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs'
                          : 'bg-gray-50/70 hover:bg-gray-100 border-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            info.isToday
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-700'
                          }`}
                        >
                          {day}
                        </span>
                        <span className="text-xs truncate font-medium">{b.name}</span>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-500">{info.turningAge} anos</span>
                        <span className="text-xs">{info.zodiacSign.symbol}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
