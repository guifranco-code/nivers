import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Birthday } from '../types/birthday.ts';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdays: Birthday[];
  onImport: (imported: Birthday[]) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  birthdays,
  onImport,
  onResetDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(birthdays, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aniversarios_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatus({ success: true, message: 'Arquivo JSON baixado com sucesso!' });
  };

  const handleExportCSV = () => {
    const headers = ['id', 'nome', 'data_nascimento', 'categoria', 'telefone', 'email', 'ideias_presente', 'observacoes'];
    const rows = birthdays.map((b) => [
      `"${b.id}"`,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${b.birth_date}"`,
      `"${b.category || ''}"`,
      `"${b.phone || ''}"`,
      `"${b.email || ''}"`,
      `"${(b.gift_ideas || '').replace(/"/g, '""')}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aniversarios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus({ success: true, message: 'Arquivo CSV baixado com sucesso!' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          await onImport(parsed);
          setStatus({ success: true, message: `${parsed.length} aniversários importados com sucesso!` });
        } else {
          setStatus({ success: false, message: 'O arquivo JSON deve conter uma lista de aniversários.' });
        }
      } catch (err: unknown) {
        setStatus({ success: false, message: 'Falha ao ler o arquivo JSON: ' + (err instanceof Error ? err.message : '') });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Backup e Dados</h3>
              <p className="text-gray-300 text-xs">Exporte ou importe seus aniversários</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                status.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {status.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Export Options */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Exportar Aniversários ({birthdays.length} cadastrados)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <FileText className="w-5 h-5 text-pink-600" />
                Exportar JSON (Completo)
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <Download className="w-5 h-5 text-emerald-600" />
                Exportar CSV (Planilhas)
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Restaurar / Importar de Arquivo JSON
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-600" />
              Selecionar arquivo de backup .JSON
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-800">Recarregar Exemplos</p>
              <p className="text-[11px] text-gray-500">Adicionar modelos com aniversários para teste</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await onResetDemoData();
                setStatus({ success: true, message: 'Dados de demonstração carregados!' });
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              Exemplos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
