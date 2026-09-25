import { Birthday, BirthdayCalculations, ZodiacSign } from '../types/birthday.ts';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Capricórnio', symbol: '♑', element: 'Terra', period: '22 Dez - 19 Jan' },
  { name: 'Aquário', symbol: '♒', element: 'Ar', period: '20 Jan - 18 Fev' },
  { name: 'Peixes', symbol: '♓', element: 'Água', period: '19 Fev - 20 Mar' },
  { name: 'Áries', symbol: '♈', element: 'Fogo', period: '21 Mar - 19 Abr' },
  { name: 'Touro', symbol: '♉', element: 'Terra', period: '20 Abr - 20 Mai' },
  { name: 'Gêmeos', symbol: '♊', element: 'Ar', period: '21 Mai - 20 Jun' },
  { name: 'Câncer', symbol: '♋', element: 'Água', period: '21 Jun - 22 Jul' },
  { name: 'Leão', symbol: '♌', element: 'Fogo', period: '23 Jul - 22 Ago' },
  { name: 'Virgem', symbol: '♍', element: 'Terra', period: '23 Ago - 22 Set' },
  { name: 'Libra', symbol: '♎', element: 'Ar', period: '23 Set - 22 Out' },
  { name: 'Escorpião', symbol: '♏', element: 'Água', period: '23 Out - 21 Nov' },
  { name: 'Sagitário', symbol: '♐', element: 'Fogo', period: '22 Nov - 21 Dez' },
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export function getZodiacSign(month: number, day: number): ZodiacSign {
  // month is 1-indexed (1 = Jan, 12 = Dec)
  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return ZODIAC_SIGNS[0]; // Capricórnio
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[1]; // Aquário
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[2]; // Peixes
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[3]; // Áries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[4]; // Touro
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[5]; // Gêmeos
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[6]; // Câncer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[7]; // Leão
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[8]; // Virgem
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[9]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[10]; // Escorpião
  return ZODIAC_SIGNS[11]; // Sagitário
}

export function parseBirthDate(dateStr: string): { year: number; month: number; day: number } {
  // Expected YYYY-MM-DD
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10)
  };
}

export function calculateBirthdayInfo(birthDateStr: string): BirthdayCalculations {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const { year: birthYear, month: birthMonth, day: birthDay } = parseBirthDate(birthDateStr);
  
  const currentYear = today.getFullYear();
  let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay);

  // Handle leap year February 29 on non-leap years
  if (birthMonth === 2 && birthDay === 29) {
    const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (!isLeap(currentYear)) {
      nextBirthday = new Date(currentYear, 1, 28);
    }
  }

  // If next birthday already passed this year, it falls in next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
    if (birthMonth === 2 && birthDay === 29) {
      const isNextYearLeap = ((currentYear + 1) % 4 === 0 && (currentYear + 1) % 100 !== 0) || ((currentYear + 1) % 400 === 0);
      if (!isNextYearLeap) {
        nextBirthday = new Date(currentYear + 1, 1, 28);
      }
    }
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const isToday = daysRemaining === 0;
  const isThisWeek = daysRemaining > 0 && daysRemaining <= 7;
  const isThisMonth = daysRemaining > 0 && daysRemaining <= 30;

  // Turning age
  const turningAge = nextBirthday.getFullYear() - birthYear;
  
  // Current age
  let currentAge = currentYear - birthYear;
  const hasHadBirthdayThisYear = today >= new Date(currentYear, birthMonth - 1, birthDay);
  if (!hasHadBirthdayThisYear) {
    currentAge -= 1;
  }

  const zodiacSign = getZodiacSign(birthMonth, birthDay);
  const weekdayFormatted = WEEKDAYS[nextBirthday.getDay()];
  const formattedDate = `${String(birthDay).padStart(2, '0')}/${String(birthMonth).padStart(2, '0')}`;

  return {
    currentAge,
    turningAge,
    daysRemaining,
    nextBirthdayDate: nextBirthday,
    isToday,
    isThisWeek,
    isThisMonth,
    weekdayFormatted,
    formattedDate,
    zodiacSign
  };
}

export function sortBirthdays(birthdays: Birthday[], sortBy: 'upcoming' | 'name' | 'calendar' | 'age'): Birthday[] {
  return [...birthdays].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'pt-BR');
    }
    
    const infoA = calculateBirthdayInfo(a.birth_date);
    const infoB = calculateBirthdayInfo(b.birth_date);

    if (sortBy === 'upcoming') {
      return infoA.daysRemaining - infoB.daysRemaining;
    }

    if (sortBy === 'calendar') {
      const partsA = parseBirthDate(a.birth_date);
      const partsB = parseBirthDate(b.birth_date);
      if (partsA.month !== partsB.month) {
        return partsA.month - partsB.month;
      }
      return partsA.day - partsB.day;
    }

    if (sortBy === 'age') {
      return infoB.currentAge - infoA.currentAge;
    }

    return 0;
  });
}

export const AVATAR_COLORS = [
  'bg-pink-500 text-white',
  'bg-purple-500 text-white',
  'bg-indigo-500 text-white',
  'bg-blue-500 text-white',
  'bg-cyan-500 text-white',
  'bg-teal-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-orange-500 text-white',
  'bg-rose-500 text-white',
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateWhatsAppMessage(
  birthday: Birthday,
  info: BirthdayCalculations,
  template: 'carinhoso' | 'divertido' | 'formal' | 'curto'
): string {
  const firstName = birthday.name.split(' ')[0];
  const age = info.turningAge;

  switch (template) {
    case 'divertido':
      return `🎉 Fala ${firstName}! Parabéns pelos ${age} anos de pura lenda! Que seu dia seja incrível, com muito bolo, risadas e momentos inesquecíveis! 🎂🍻 Aproveite seu dia!`;
    case 'carinhoso':
      return `❤️ Parabéns, querido(a) ${firstName}! Desejo que seu aniversário de ${age} anos seja repleto de amor, saúde e realizações. Você é uma pessoa muito especial na minha vida! 🎂🎈✨`;
    case 'formal':
      return `Prezado(a) ${firstName}, desejo-lhe um feliz aniversário e um novo ciclo repleto de saúde, prosperidade e muito sucesso pessoal e profissional! 🥂 Parabéns!`;
    case 'curto':
    default:
      return `🎉 Feliz aniversário, ${firstName}! Muita paz, saúde, alegria e realizações neste novo ano de vida! Parabéns pelos ${age} anos! 🎂🥳`;
  }
}

export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}
