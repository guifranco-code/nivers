import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Sparkles } from 'lucide-react';
import { Birthday } from '../types/birthday.ts';
import { calculateBirthdayInfo, cleanPhoneNumber, generateWhatsAppMessage } from '../utils/dateUtils.ts';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthday: Birthday | null;
}

type TemplateType = 'curto' | 'carinhoso' | 'divertido' | 'formal';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  birthday,
}) => {
  const [template, setTemplate] = useState<TemplateType>('curto');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (birthday) {
      const info = calculateBirthdayInfo(birthday.birth_date);
      setMessage(generateWhatsAppMessage(birthday, info, template));
      setCopied(false);
    }
  }, [birthday, template, isOpen]);

  if (!isOpen || !birthday) return null;

  const info = calculateBirthdayInfo(birthday.birth_date);
  const cleanPhone = cleanPhoneNumber(birthday.phone);

  const handleTemplateChange = (newTemplate: TemplateType) => {
    setTemplate(newTemplate);
    setMessage(generateWhatsAppMessage(birthday, info, newTemplate));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    let url = '';
    if (cleanPhone) {
      // If phone starts without country code, add 55 (Brazil) by default if 10-11 digits
      let fullPhone = cleanPhone;
      if (fullPhone.length === 10 || fullPhone.length === 11) {
        fullPhone = `55${fullPhone}`;
      }
      url = `https://wa.me/${fullPhone}?text=${encoded}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Enviar Mensagem de Aniversário</h2>
              <p className="text-emerald-100 text-xs">
                Para <strong>{birthday.name}</strong> • {info.turningAge} anos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Template pills */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Estilo da Mensagem:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('curto')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  template === 'curto'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🎉 Curto
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('carinhoso')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  template === 'carinhoso'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ❤️ Carinhoso
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('divertido')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  template === 'divertido'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🍻 Divertido
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('formal')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  template === 'formal'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                👔 Formal
              </button>
            </div>
          </div>

          {/* Textarea preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Editar Mensagem antes de enviar:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all bg-emerald-50/20"
            />
          </div>

          {/* Phone note */}
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>
              Destinatário:{' '}
              {birthday.phone ? (
                <strong className="text-emerald-700">{birthday.phone}</strong>
              ) : (
                <span className="text-amber-600 italic">Telefone não cadastrado (abrirá seletor do WhatsApp)</span>
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Abrir no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
