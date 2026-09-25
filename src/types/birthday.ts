export type Category = 'Família' | 'Amigos' | 'Trabalho' | 'Estudos' | 'Outros';

export interface Birthday {
  id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  category: Category;
  phone?: string;
  email?: string;
  gift_ideas?: string;
  notes?: string;
  avatar_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export interface BirthdayCalculations {
  currentAge: number;
  turningAge: number;
  daysRemaining: number;
  nextBirthdayDate: Date;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  weekdayFormatted: string;
  formattedDate: string;
  zodiacSign: ZodiacSign;
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'Fogo' | 'Terra' | 'Ar' | 'Água';
  period: string;
}
