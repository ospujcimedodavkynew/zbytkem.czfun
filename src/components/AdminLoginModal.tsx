import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';
import { loginAdmin, DEFAULT_ADMIN_PASSWORD } from '../utils/authUtils';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden relative"
      >
        {/* Header background with accent */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            title="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Vstup do administrace
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Tato sekce obsahuje osobní údaje zákazníků a nastavení pronájmu. Pro přístup zadejte heslo majitele.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 rounded-2xl flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span><strong>Zadané heslo je nesprávné.</strong> Zkontrolujte velká a malá písmena.</span>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Heslo administrátora
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                autoFocus
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Vložte heslo..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-[11px] text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Nápověda k přihlášení:
            </div>
            <p className="leading-relaxed">
              Výchozí heslo při prvním spuštění je <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950">{DEFAULT_ADMIN_PASSWORD}</strong>. Heslo si můžete kdykoliv změnit v nastavení po přihlášení.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Zrušit
            </button>
            <button 
              type="submit"
              className="w-full sm:w-1/2 bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/15 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Vstoupit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
