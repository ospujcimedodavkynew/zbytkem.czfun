
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import Logo from './Logo';

interface NavigationProps {
  isAdmin: boolean;
  onNavigate: (view: 'home' | 'admin' | 'booking' | 'blog' | 'vehicle-detail' | 'guides' | 'checklist') => void;
  onScrollTo: (sectionId: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin, onNavigate, onScrollTo, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Domů', onClick: () => onNavigate('home') },
    { label: 'Naše vozy', onClick: () => onScrollTo('fleet') },
    { label: 'Ceník', onClick: () => onScrollTo('pricing') },
    { label: 'Blog', onClick: () => onNavigate('blog') },
    { label: 'Checklist', onClick: () => onNavigate('checklist') },
    { label: 'FAQ', onClick: () => onScrollTo('faq') },
    { label: 'Kontakt', onClick: () => onScrollTo('contact') },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-slate-200/50 rounded-[2rem] px-6 md:px-10 py-4">
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
                className="px-6 py-2.5 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all rounded-full hover:bg-white hover:shadow-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('admin')}
              className={`hidden sm:flex items-center px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-full transition-all
                ${isAdmin 
                  ? 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg' 
                  : 'text-slate-900 bg-white border border-slate-200 hover:shadow-md'}`}
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
              className="md:hidden p-2 text-slate-900 bg-slate-50 rounded-full"
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
            className="md:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="space-y-4">
              {navLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={() => { link.onClick(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all flex justify-between items-center group"
                >
                  <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </button>
              ))}
              <div className="pt-4">
                <button
                  onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  {isAdmin ? 'Administrace' : 'Klientská zóna'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
