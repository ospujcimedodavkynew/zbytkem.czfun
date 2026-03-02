
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
    { label: 'Kontakt', onClick: () => onScrollTo('contact') },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
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
          <div className="hidden md:flex space-x-10 items-center">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={link.onClick}
                className="text-slate-500 hover:text-orange-600 font-medium text-sm tracking-wide transition-all relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('admin')}
              className={`hidden sm:flex items-center px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-sm
                ${isAdmin 
                  ? 'text-white bg-slate-900 hover:bg-slate-800' 
                  : 'text-slate-700 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50/30'}`}
            >
              <User className="w-3.5 h-3.5 mr-2" />
              {isAdmin ? 'Dashboard' : 'Pro majitele'}
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4 shadow-xl"
        >
          {navLinks.map((link) => (
            <button 
              key={link.label}
              onClick={() => { link.onClick(); setIsMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 text-lg font-bold text-slate-800 hover:bg-orange-50 rounded-2xl transition-all flex justify-between items-center"
            >
              {link.label}
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}
          <button
            onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
            className="w-full mt-4 px-4 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-center"
          >
            {isAdmin ? 'Administrace' : 'Vstup pro majitele'}
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;
