
import React from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import Logo from './Logo';

interface NavigationProps {
  isAdmin: boolean;
  onNavigate: (view: 'home' | 'admin' | 'booking') => void;
  onScrollTo: (sectionId: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin, onNavigate, onScrollTo, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Domů', onClick: () => onNavigate('home') },
    { label: 'Naše vozy', onClick: () => onScrollTo('fleet') },
    { label: 'Ceník', onClick: () => onScrollTo('pricing') },
    { label: 'FAQ', onClick: () => onScrollTo('faq') },
    { label: 'Kontakt', onClick: () => onScrollTo('contact') },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Logo />
          </motion.div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex space-x-12 items-center">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={link.onClick}
                className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-[0.2em] transition-all relative group"
              >
                {link.label}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-slate-900 rounded-full transition-all group-hover:w-4" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('admin')}
              className={`hidden sm:flex items-center px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all
                ${isAdmin 
                  ? 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200' 
                  : 'text-slate-900 bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md'}`}
            >
              <User className="w-3.5 h-3.5 mr-2" />
              {isAdmin ? 'Administrace' : 'Klientská zóna'}
            </motion.button>

            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLogout}
                className="p-2.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Odhlásit se"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-6 py-10 space-y-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button 
              key={link.label}
              onClick={() => { link.onClick(); setIsMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex justify-between items-center"
            >
              {link.label}
              <ChevronRight className="w-4 h-4 text-slate-200" />
            </button>
          ))}
          <div className="pt-6 border-t border-slate-50">
            <button
              onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
              className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs text-center shadow-xl shadow-slate-200"
            >
              {isAdmin ? 'Administrace' : 'Klientská zóna'}
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;
