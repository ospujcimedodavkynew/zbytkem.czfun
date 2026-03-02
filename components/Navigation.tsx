
import React from 'react';
import Logo from './Logo';

interface NavigationProps {
  isAdmin: boolean;
  onNavigate: (view: 'home' | 'admin' | 'booking') => void;
  onScrollTo: (sectionId: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin, onNavigate, onScrollTo, onLogout }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Logo />
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              Domů
            </button>
            <button 
              onClick={() => onScrollTo('fleet')}
              className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              Naše vozy
            </button>
            <button 
              onClick={() => onScrollTo('pricing')}
              className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              Ceník
            </button>
            <button 
              onClick={() => onScrollTo('contact')}
              className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              Kontakt
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm
                ${isAdmin 
                  ? 'text-white bg-slate-800 hover:bg-slate-900' 
                  : 'text-orange-700 bg-orange-50 border border-orange-100 hover:bg-orange-100'}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              {isAdmin ? 'Administrace' : 'Vstup pro majitele'}
            </button>

            {isAdmin && (
              <button
                onClick={onLogout}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Odhlásit se"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
