
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Menu, X, ChevronRight, Download, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavigationProps {
  isAdmin: boolean;
  onNavigate: (view: 'home' | 'admin' | 'booking' | 'blog' | 'vehicle-detail' | 'checklist') => void;
  onScrollTo: (sectionId: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin, onNavigate, onScrollTo, onLogout, isDarkMode, setIsDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();

  const navLinks = [
    { label: 'Domů', onClick: () => onNavigate('home') },
    { label: 'Naše vozy', onClick: () => onScrollTo('fleet') },
    { label: 'Ceník', onClick: () => onScrollTo('pricing') },
    { label: 'Blog', onClick: () => onNavigate('blog') },
    { label: 'Checklist', onClick: () => onNavigate('checklist') },
    { label: 'FAQ', onClick: () => onScrollTo('faq') },
    { label: 'Kontakt', onClick: () => onScrollTo('contact') },
  ];

  const handleInstall = () => {
    if (isIOS) {
      alert('Pro instalaci na iPhone klepněte na tlačítko "Sdílet" (čtvereček se šipkou nahoru) a zvolte "Přidat na plochu".');
    } else {
      handleInstallClick();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass border border-white/20 shadow-ultimate rounded-[2rem] px-6 md:px-10 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Logo />
          </motion.div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center bg-slate-50/50 rounded-full px-2 py-1 border border-slate-100">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={link.onClick}
                className="px-6 py-2.5 text-slate-500 hover:text-brand-primary font-bold text-[11px] uppercase tracking-wider transition-all rounded-full hover:bg-white hover:shadow-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('admin')}
              className={`hidden sm:flex items-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all
                ${isAdmin 
                  ? 'btn-ultimate-primary shadow-lg' 
                  : 'btn-ultimate-secondary'}`}
            >
              <User className="w-3 h-3 mr-2" />
              {isAdmin ? 'Admin' : 'Přihlásit'}
            </motion.button>

            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-900 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="md:hidden absolute top-full left-0 right-0 mt-4 glass rounded-[2.5rem] p-8 shadow-ultimate border border-white/20 overflow-y-auto max-h-[80vh] no-scrollbar"
          >
            <div className="space-y-4">
              {navLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={() => { link.onClick(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-slate-50 hover:bg-brand-primary hover:text-white transition-all flex justify-between items-center group"
                >
                  <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </button>
              ))}
              
              {/* PWA Install Link in Mobile Menu */}
              {!isStandalone && (
                <button 
                  onClick={handleInstall}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex justify-between items-center group border border-brand-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Stáhnout aplikaci</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-primary/30 group-hover:text-white transition-colors" />
                </button>
              )}

              {/* Dark Mode Toggle in Mobile Menu */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex justify-between items-center group ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="text-xs font-black uppercase tracking-widest">{isDarkMode ? 'Světlý režim' : 'Tmavý režim'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="pt-4 space-y-4">
                <button
                  onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                  className="w-full py-5 btn-ultimate-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  {isAdmin ? 'Administrace' : 'Klientská zóna'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-100 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Odhlásit se
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
