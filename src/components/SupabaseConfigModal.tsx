import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  X,
  UploadCloud,
  ShieldCheck,
  Code
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  clearStoredSupabaseConfig, 
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA 
} from '../services/supabaseClient.ts';
import { syncLocalToSupabase } from '../services/birthdayService.ts';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableExists: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    saveStoredSupabaseConfig(url, anonKey);
    onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigSaved();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncLocalToSupabase();
    if (res.success) {
      setSyncResult({ success: true, message: `${res.count} aniversários sincronizados com sucesso!` });
    } else {
      setSyncResult({ success: false, message: res.error || 'Falha ao sincronizar dados.' });
    }
    setSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Configuração do Supabase</h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Conecte seu banco de dados PostgreSQL do Supabase em poucos segundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick instructions */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 text-sm text-emerald-950 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Como obter suas credenciais:</p>
              <ol className="list-decimal list-inside text-xs space-y-1 mt-1 text-emerald-800">
                <li>Acesse o painel do seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-medium inline-flex items-center gap-0.5 hover:text-emerald-950">Supabase <ExternalLink className="w-3 h-3" /></a></li>
                <li>Vá em <strong>Project Settings</strong> &gt; <strong>API</strong></li>
                <li>Copie a <strong>Project URL</strong> e a <strong>anon / public key</strong></li>
              </ol>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-empresa-id.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Nunca use a chave service_role aqui. Utilize apenas a chave anônima pública (<code className="bg-gray-100 px-1 py-0.5 rounded">anon public</code>).
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !url || !anonKey}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                {testing ? 'Testando conexão...' : 'Testar Conexão com Supabase'}
              </button>

              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-gray-600" />
                {showSql ? 'Ocultar Script SQL da Tabela' : 'Ver Script SQL para criar a Tabela'}
              </button>
            </div>

            {/* Test Result Feedback */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.message}</p>
                  {!testResult.tableExists && testResult.success && (
                    <p className="mt-1 text-emerald-800">
                      💡 Copie o código SQL abaixo e rode no <strong>SQL Editor</strong> do Supabase para criar a tabela com 1 clique!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SQL Table Creation Accordion */}
            {showSql && (
              <div className="bg-gray-900 text-gray-100 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                  <span className="text-xs font-semibold text-emerald-400 font-mono">SQL para Supabase:</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed overflow-x-auto text-emerald-200 font-mono p-1 max-h-48">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}

            {/* Push local data to Supabase */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Sincronização de Dados</h4>
                  <p className="text-[11px] text-gray-500">
                    Enviar aniversários cadastrados localmente para o banco de dados Supabase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncData}
                  disabled={syncing || !url || !anonKey}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Enviar para Supabase'}
                </button>
              </div>

              {syncResult && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    syncResult.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{syncResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Limpar credenciais
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
