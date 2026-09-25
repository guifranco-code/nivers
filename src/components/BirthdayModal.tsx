import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, Gift, FileText, Sparkles, Tag } from 'lucide-react';
import { Birthday, Category } from '../types/birthday.ts';
import { AVATAR_COLORS, calculateBirthdayInfo } from '../utils/dateUtils.ts';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (birthdayData: Omit<Birthday, 'id' | 'created_at' | 'updated_at'>, id?: string) => Promise<void>;
  editingBirthday?: Birthday | null;
}

const CATEGORIES: Category[] = ['Família', 'Amigos', 'Trabalho', 'Estudos', 'Outros'];

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBirthday,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [category, setCategory] = useState<Category>('Amigos');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [giftIdeas, setGiftIdeas] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBirthday) {
      setName(editingBirthday.name);
      setBirthDate(editingBirthday.birth_date);
      setCategory(editingBirthday.category || 'Amigos');
      setPhone(editingBirthday.phone || '');
      setEmail(editingBirthday.email || '');
      setGiftIdeas(editingBirthday.gift_ideas || '');
      setNotes(editingBirthday.notes || '');
      setAvatarColor(editingBirthday.avatar_color || AVATAR_COLORS[0]);
    } else {
      // Default new form
      setName('');
      // Default date to today's month/day but 25 years ago
      const d = new Date();
      const defaultYear = d.getFullYear() - 25;
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setBirthDate(`${defaultYear}-${mm}-${dd}`);
      setCategory('Amigos');
      setPhone('');
      setEmail('');
      setGiftIdeas('');
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
    setError(null);
  }, [editingBirthday, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation preview if valid date
  let previewInfo = null;
  if (birthDate && birthDate.length === 10) {
    try {
      previewInfo = calculateBirthdayInfo(birthDate);
    } catch {
      previewInfo = null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da pessoa.');
      return;
    }
    if (!birthDate) {
      setError('Por favor, selecione a data de nascimento.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(
        {
          name: name.trim(),
          birth_date: birthDate,
          category,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          gift_ideas: giftIdeas.trim() || undefined,
          notes: notes.trim() || undefined,
          avatar_color: avatarColor,
        },
        editingBirthday ? editingBirthday.id : undefined
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar aniversário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {editingBirthday ? 'Editar Aniversário' : 'Novo Aniversário'}
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                {editingBirthday
                  ? 'Atualize as informações do aniversariante'
                  : 'Cadastre amigos, familiares ou colegas para nunca esquecer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mariana Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Data de Nascimento *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Real-time calculated preview badge */}
          {previewInfo && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/70 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{previewInfo.zodiacSign.symbol}</span>
                <div>
                  <span className="font-semibold text-purple-900">
                    {previewInfo.zodiacSign.name} ({previewInfo.zodiacSign.element})
                  </span>
                  <span className="text-gray-500 text-[11px] block">
                    {previewInfo.formattedDate} • Próximo cai num(a) {previewInfo.weekdayFormatted}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-pink-600 block">
                  Completará {previewInfo.turningAge} anos
                </span>
                <span className="text-[11px] text-gray-500">
                  {previewInfo.daysRemaining === 0
                    ? '🎉 É HOJE!'
                    : `Faltam ${previewInfo.daysRemaining} dias`}
                </span>
              </div>
            </div>
          )}

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                Categoria / Grupo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                Cor do Avatar
              </label>
              <div className="flex items-center gap-2 py-1.5 overflow-x-auto">
                {AVATAR_COLORS.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-6 h-6 rounded-full transition-all shrink-0 cursor-pointer ${c.split(' ')[0]} ${
                      avatarColor === c ? 'ring-2 ring-offset-2 ring-pink-500 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Phone (WhatsApp) & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all"
              />
              <span className="text-[10px] text-gray-400">Permite enviar parabéns direto no WhatsApp</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: mariana@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Gift Ideas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              Ideias de Presentes
            </label>
            <input
              type="text"
              value={giftIdeas}
              onChange={(e) => setGiftIdeas(e.target.value)}
              placeholder="Ex: Perfume amadeirado, livro de ficção, garrafa térmica..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Observações & Detalhes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: É alérgico a nozes; gosta de rock clássico; comemora no sítio da família."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? 'Salvando...' : editingBirthday ? 'Salvar Alterações' : 'Cadastrar Aniversário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
