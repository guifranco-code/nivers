import React, { useState } from 'react';
import { X, Gift, Save } from 'lucide-react';
import { Birthday } from '../types/birthday.ts';

interface GiftIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthday: Birthday | null;
  onSaveGiftIdeas: (id: string, giftIdeas: string) => Promise<void>;
}

export const GiftIdeasModal: React.FC<GiftIdeasModalProps> = ({
  isOpen,
  onClose,
  birthday,
  onSaveGiftIdeas,
}) => {
  const [ideas, setIdeas] = useState(birthday?.gift_ideas || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (birthday) {
      setIdeas(birthday.gift_ideas || '');
    }
  }, [birthday]);

  if (!isOpen || !birthday) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSaveGiftIdeas(birthday.id, ideas);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Ideias de Presentes</h3>
              <p className="text-amber-100 text-xs">Para {birthday.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Lista de desejos, tamanhos ou sugestões de presente:
            </label>
            <textarea
              rows={4}
              value={ideas}
              onChange={(e) => setIdeas(e.target.value)}
              placeholder="Ex: Tamanho de camisa M; Calça 40; Adora livros de ficção científica; Quer o fone sem fio da marca X..."
              className="w-full p-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Ideias'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
