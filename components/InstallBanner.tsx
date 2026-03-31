
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const InstallBanner: React.FC = () => {
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a short delay if not installed
    if (!isStandalone && (isInstallable || isIOS)) {
      const timer = setTimeout(() => {
        // Check if user has already dismissed it in this session
        const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isIOS, isStandalone]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const onInstall = () => {
    if (isIOS) {
      // For iOS, we just show instructions since we can't trigger prompt
      return;
    }
    handleInstallClick();
    setIsVisible(false);
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[110] md:left-auto md:right-8 md:w-96"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                <Smartphone size={24} />
              </div>
              
              <div className="flex-grow pr-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                  Nainstalujte si Obytkem
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Mějte své rezervace a návody vždy po ruce přímo na ploše telefonu.
                </p>

                {isIOS ? (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-2">
                      <Share size={12} className="text-brand-primary" />
                      Klepněte na "Sdílet" a poté na "Přidat na plochu"
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={onInstall}
                    className="w-full py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 hover:bg-brand-secondary transition-colors"
                  >
                    <Download size={14} />
                    Instalovat aplikaci
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
